export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        BOT_TOKEN,
        ADMIN_CHAT_IDS,
        YOOKASSA_SHOP_ID,
        YOOKASSA_SECRET_KEY,
    } = process.env;

    // Проверяем наличие боевых ключей
    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
        return res.status(500).json({ error: 'ОШИБКА: Боевые ключи ЮKassa не настроены' });
    }

    if (!BOT_TOKEN || !ADMIN_CHAT_IDS) {
        return res.status(500).json({ error: 'ОШИБКА: Настройки Telegram не найдены' });
    }

    const order = req.body;
    console.log('[API] New order request:', {
        name: order.name,
        total: order.total,
        type: order.type
    });

    try {
        const idempotenceKey = Date.now().toString() + Math.random().toString(36).substring(7);
        const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

        const { type = 'embedded' } = order;
        const host = req.headers.host;
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const returnUrl = `${protocol}://${host}/checkout?success=true`;

        // === ПОДГОТОВКА ЧЕКА ПО ФЗ-54 ===
        const paymentItems = [];
        let cartItemsTotalAfterDiscount = order.total - order.deliveryCost;
        let currentItemsSum = 0;

        // Разворачиваем товары по 1 штуке, чтобы избежать любых проблем с округлением цены
        const allIndividualItems = [];
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const qty = Number(item.quantity) || 1;
                for (let i = 0; i < qty; i++) {
                    allIndividualItems.push({ ...item, quantity: 1 });
                }
            });
        }

        // Распределяем скидку пропорционально на каждый товар
        const baseCartSum = allIndividualItems.reduce((sum, item) => sum + Number(item.price), 0);

        allIndividualItems.forEach((item, index) => {
            const isLast = index === allIndividualItems.length - 1;
            const ratio = baseCartSum > 0 ? (Number(item.price) / baseCartSum) : 0;

            // Вычисляем цену единицы товара со скидкой
            let finalPrice = Number(item.price) - (Number(order.discount || 0) * ratio);
            finalPrice = Math.round(finalPrice * 100) / 100; // Округляем до копеек

            // Последний товар "вбирает" погрешность округлений, чтобы сумма сошлась копейка-в-копейку
            if (isLast) {
                finalPrice = cartItemsTotalAfterDiscount - currentItemsSum;
                finalPrice = Math.round(finalPrice * 100) / 100;
            }

            currentItemsSum += finalPrice;

            // YooKassa требует точного соответствия суммы, передаем quantity: '1.000'
            paymentItems.push({
                description: item.name ? item.name.substring(0, 128) : 'Товар',
                quantity: '1.000',
                amount: {
                    value: finalPrice.toFixed(2),
                    currency: 'RUB'
                },
                vat_code: 1, // Без НДС, измените на нужный код (например 1 для ИП без НДС)
                payment_mode: 'full_prepayment',
                payment_subject: 'commodity'
            });
        });

        // Доставка идет отдельной услугой в чеке
        if (Number(order.deliveryCost) > 0) {
            paymentItems.push({
                description: 'Доставка',
                quantity: '1.000',
                amount: {
                    value: Number(order.deliveryCost).toFixed(2),
                    currency: 'RUB'
                },
                vat_code: 1,
                payment_mode: 'full_prepayment',
                payment_subject: 'service' // Услуга
            });
        }

        const phoneForReceipt = order.phone ? order.phone.replace(/[^0-9+]/g, '') : '';

        const paymentData = {
            amount: {
                value: String(order.total),
                currency: 'RUB'
            },
            confirmation: type === 'redirect'
                ? { type: 'redirect', return_url: returnUrl }
                : { type: 'embedded' },
            capture: true,
            description: `Заказ: ${order.name} (${order.phone})`,
            metadata: {
                // Передаем весь заказ в метадату, чтобы бот смог отправить в телегу после оплаты
                orderData: JSON.stringify(order)
            },
            // Объект чека в соответствии с 54-ФЗ
            receipt: {
                customer: {
                    phone: phoneForReceipt
                },
                items: paymentItems
            }
        };

        console.log(`[API] Creating YooKassa payment (${type}) with receipt...`);
        const response = await fetch('https://api.yookassa.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Idempotence-Key': idempotenceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const payment = await response.json();

        if (!response.ok) {
            console.error('[API] YooKassa Error Response:', payment);
            let errorMessage = payment.description;
            if (payment.parameters && payment.parameters.length) {
                errorMessage += ` (${payment.parameters.map(p => p.name).join(', ')})`;
            }
            return res.status(response.status).json({
                error: errorMessage || 'Ошибка ЮKassa: ' + (payment.code || 'unknown')
            });
        }

        console.log('[API] YooKassa Payment Created:', payment.id);

        return res.status(200).json({
            success: true,
            confirmationToken: payment.confirmation?.confirmation_token,
            paymentUrl: payment.confirmation?.confirmation_url
        });

    } catch (err) {
        console.error('[API] Server Error:', err);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера: ' + err.message });
    }
}
