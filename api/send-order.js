/**
 * POST /api/send-order
 *
 * Создаёт платёж в ЮKassa (API v3).
 *
 * ИСПРАВЛЕНИЯ (на основе логов ЮKassa):
 * 1. amount.value → строго "500.00" (toFixed(2)), не "500"
 * 2. receipt.customer.phone → "79001234567" БЕЗ знака + (E.164 без +)
 *    Ошибка в логах: "parameter": "receipt.customer.phone"
 * 3. quantity → число 1.000, не строка "1.000"
 * 4. Сумма позиций чека = сумме платежа (копейка в копейку)
 */

// ВАЖНО: Мы не используем статический импорт, так как админка меняет файл на GitHub, 
// и нам нужны свежие данные без пересборки сайта на Timeweb.
let productsCache = null;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Очищаем ключи от лишних пробелов/переносов (бывает при вставке в Timeweb)
    const YOOKASSA_SHOP_ID = (process.env.YOOKASSA_SHOP_ID || '').trim();
    const YOOKASSA_SECRET_KEY = (process.env.YOOKASSA_SECRET_KEY || '').trim();
    const BOT_TOKEN = (process.env.BOT_TOKEN || '').trim();
    const ADMIN_CHAT_IDS = (process.env.ADMIN_CHAT_IDS || '').trim();

    // БЕЗОПАСНАЯ ПРОВЕРКА (в консоль Timeweb)
    console.log('[DEBUG] Ключи:', {
        shopId: YOOKASSA_SHOP_ID ? `${YOOKASSA_SHOP_ID.substring(0, 3)}...` : 'ОТСУТСТВУЕТ',
        secretKey: YOOKASSA_SECRET_KEY ? `${YOOKASSA_SECRET_KEY.substring(0, 7)}...${YOOKASSA_SECRET_KEY.slice(-4)}` : 'ОТСУТСТВУЕТ'
    });

    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
        return res.status(500).json({ error: 'ОШИБКА: Ключи ЮKassa не найдены в переменных окружения Timeweb' });
    }

    const order = req.body;
    console.log('[API] New order:', { name: order.name, total: order.total, type: order.type });

    try {
        // === ЗАГРУЗКА АКТУАЛЬНЫХ ДАННЫХ ТОВАРОВ (Sync с Админкой) ===
        const { GITHUB_REPO, GITHUB_TOKEN } = process.env;
        const branch = "main";
        const dataPath = "src/data/products.json";
        let productsData = null;

        try {
            // Пытаемся получить свежие данные с GitHub, чтобы не ждать пересборки сайта на Timeweb
            const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${dataPath}?ref=${branch}`, {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (ghRes.ok) {
                const ghJson = await ghRes.json();
                const content = Buffer.from(ghJson.content, 'base64').toString('utf8');
                productsData = JSON.parse(content);
                console.log('[Sync] Свежие данные товаров успешно получены с GitHub.');
            }
        } catch (syncErr) {
            console.error('[Sync Error] Не удалось получить данные с GitHub:', syncErr.message);
        }

        // Если с GitHub не вышло, берем локальные (старые) данные
        if (!productsData) {
            const fs = await import('fs');
            const path = await import('path');
            const { fileURLToPath } = await import('url');
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const localPath = path.resolve(__dirname, '../src/data/products.json');
            productsData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
            console.log('[Sync] Используются локальные данные товаров (возможна задержка синхронизации).');
        }

        // =========================================================
        // ЗАЩИТА ОТ ДВОЙНЫХ СПИСАНИЙ (Idempotency Key)
        // Ключ = хэш от содержимого заказа (имя + телефон + сумма + товары)
        // Если клиент нажмёт "Оплатить" дважды с теми же данными —
        // ЮKassa вернёт тот же объект платежа БЕЗ нового списания!
        // =========================================================
        // ВАЖНО: включаем timestamp чтобы каждый новый вызов имел УНИКАЛЬНЫЙ ключ.
        // Без timestamp при повторном нажатии "Оформить" (с теми же данными) ЮKassa
        // вернёт ошибку "already used this idempotence key".
        const orderFingerprint = [
            order.name || '',
            String(order.phone || '').replace(/[^0-9]/g, ''),
            String(order.total || ''),
            JSON.stringify((order.items || []).map(i => `${i.name}:${i.quantity}:${i.price}`).sort()),
            String(order.timestamp || Date.now()) // <-- ФИКС: уникальность по времени
        ].join('|');

        // Простой детерминированный хэш (djb2)
        let hash = 5381;
        for (let i = 0; i < orderFingerprint.length; i++) {
            hash = ((hash << 5) + hash) ^ orderFingerprint.charCodeAt(i);
        }
        const idempotenceKey = `order-${Math.abs(hash).toString(16)}-${String(order.total).replace('.', '')}`;
        console.log('[API] Idempotence-Key:', idempotenceKey);
        const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

        const { type = 'embedded' } = order;
        const host = req.headers.host;
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const returnUrl = `${protocol}://${host}/checkout?success=true`;

        // === ЗАЩИТА: ПЕРЕСЧЕТ СУММЫ НА СЕРВЕРЕ (Anti-Fraud) ===
        let calculatedBaseTotal = 0;
        const serverProducts = productsData.products || [];

        if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста' });
        }

        try {
            order.items.forEach(clientItem => {
                const realProduct = serverProducts.find(p => p.name === clientItem.name);
                if (!realProduct) {
                    throw new Error(`Товар "${clientItem.name}" не найден в базе данных сервера. Пожалуйста, обновите страницу.`);
                }
                // Очищаем цену от пробелов и валютных символов на случай, если в JSON попал грязный формат
                const priceMatch = String(realProduct.price).replace(/\s/g, '').match(/\d+/);
                const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
                const qty = parseInt(clientItem.quantity) || 1;
                calculatedBaseTotal += price * qty;
            });
        } catch (itemErr) {
            return res.status(400).json({ error: itemErr.message });
        }

        // Считаем скидки (логика "Либо-Либо"):
        // Если есть промокод — скидка предзаказа 10% НЕ применяется (приоритет промокода)
        const serverPromo = productsData.promoCodes?.find(p => p.code === order.appliedPromo && p.isActive);
        const promoDiscountPct = serverPromo ? serverPromo.discount : 0;
        const promoDiscountAmount = Math.round(calculatedBaseTotal * (promoDiscountPct / 100));

        const isPreorder = order.deliveryTime === 'later';
        // Скидка предзаказа только если НЕТ активного промокода
        const preorderDiscountAmount = (isPreorder && !serverPromo) ? Math.round(calculatedBaseTotal * 0.1) : 0;
        const totalDiscount = promoDiscountAmount + preorderDiscountAmount;

        // Доставка берется как пришла, но мы проверяем логику
        const clientDeliveryCost = parseFloat(order.deliveryCost) || 0;

        // ЗАЩИТА: Минимальная стоимость доставки 600р, если это доставка курьером
        if (order.deliveryType === 'delivery' && clientDeliveryCost < 600) {
            return res.status(403).json({ error: 'Ошибка: стоимость доставки не может быть меньше 600 ₽' });
        }

        const serverFinalTotal = calculatedBaseTotal - totalDiscount + clientDeliveryCost;

        console.log('[Security] Price Check:', {
            clientSent: order.total,
            serverCalculated: serverFinalTotal,
            diff: Math.abs(order.total - serverFinalTotal)
        });

        // ПРОВЕРКА ЦЕНЫ (разрешаем погрешность в 5 рублей на случай округлений)
        if (Math.abs(order.total - serverFinalTotal) > 5) {
            return res.status(403).json({
                error: `Ошибка безопасности: сервер насчитал ${serverFinalTotal} р., а браузер прислал ${order.total} р. Попробуйте обновить корзину.`
            });
        }

        const totalAmount = serverFinalTotal;
        const deliveryCost = clientDeliveryCost;
        const discount = totalDiscount;

        // === ПОДГОТОВКА ПОЗИЦИЙ ЧЕКА (54-ФЗ) ===
        const paymentItems = [];
        const cartItemsTotal = totalAmount - deliveryCost; // товары без доставки
        let currentItemsSum = 0;

        // Разворачиваем qty > 1 в отдельные позиции (безопаснее для округления)
        const allIndividualItems = [];
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const qty = Math.max(1, parseInt(item.quantity) || 1);
                // Находим цену в серверной базе для безопасности
                const realProduct = serverProducts.find(p => p.name === item.name);
                const priceMatch = realProduct ? String(realProduct.price).replace(/\s/g, '').match(/\d+/) : null;
                const serverPrice = priceMatch ? parseFloat(priceMatch[0]) : 0;

                for (let i = 0; i < qty; i++) {
                    allIndividualItems.push({
                        ...item,
                        quantity: 1,
                        price: serverPrice // Принудительно ставим серверную цену
                    });
                }
            });
        }

        const baseCartSum = allIndividualItems.reduce((s, i) => s + (i.price || 0), 0);

        allIndividualItems.forEach((item, index) => {
            const isLast = index === allIndividualItems.length - 1;
            const itemPrice = parseFloat(item.price) || 0;
            const ratio = baseCartSum > 0 ? (itemPrice / baseCartSum) : 0;

            let finalPrice;
            if (isLast) {
                // последний товар закрывает погрешность округления
                finalPrice = Math.round((cartItemsTotal - currentItemsSum) * 100) / 100;
            } else {
                finalPrice = Math.round((itemPrice - discount * ratio) * 100) / 100;
            }
            if (finalPrice < 0.01) finalPrice = 0.01;

            currentItemsSum = Math.round((currentItemsSum + finalPrice) * 100) / 100;

            paymentItems.push({
                description: item.name ? String(item.name).substring(0, 128) : 'Товар',
                quantity: 1.000,                    // ЧИСЛО, не строка
                amount: {
                    value: finalPrice.toFixed(2),   // всегда "X.XX"
                    currency: 'RUB'
                },
                vat_code: 1,                        // 1 = без НДС
                payment_mode: 'full_prepayment',
                payment_subject: 'commodity'
            });
        });

        // Доставка как отдельная позиция
        if (deliveryCost > 0) {
            paymentItems.push({
                description: 'Доставка',
                quantity: 1.000,
                amount: {
                    value: deliveryCost.toFixed(2),
                    currency: 'RUB'
                },
                vat_code: 1,
                payment_mode: 'full_prepayment',
                payment_subject: 'service'
            });
        }

        // =====================================================
        // КРИТИЧНО: receipt.customer.phone
        // ЮKassa (E.164) требует ТОЛЬКО ЦИФРЫ без знака +:
        //   "79001234567" ✅
        //   "+79001234567" ❌ — именно это вызывало ошибку в логах!
        // =====================================================
        const digitsOnly = String(order.phone || '').replace(/[^0-9]/g, '');
        let phoneForReceipt;

        if (digitsOnly.startsWith('8') && digitsOnly.length === 11) {
            // 89991234567 → 79991234567
            phoneForReceipt = '7' + digitsOnly.substring(1);
        } else if (digitsOnly.startsWith('7') && digitsOnly.length === 11) {
            // 79991234567 — уже правильный формат
            phoneForReceipt = digitsOnly;
        } else if (digitsOnly.length === 10) {
            // 9991234567 → 79991234567
            phoneForReceipt = '7' + digitsOnly;
        } else {
            phoneForReceipt = digitsOnly;
        }

        console.log('[API] Phone normalized:', order.phone, '→', phoneForReceipt);

        // === ПРОВЕРКА: сумма позиций = итогу ===
        const receiptTotal = paymentItems.reduce((s, i) =>
            Math.round((s + parseFloat(i.amount.value)) * 100) / 100, 0);

        if (Math.abs(receiptTotal - totalAmount) > 0.01) {
            console.error('[API] Sum mismatch! receipt:', receiptTotal, 'payment:', totalAmount);
            return res.status(500).json({
                error: `Ошибка чека: сумма позиций ${receiptTotal} ≠ итогу ${totalAmount}`
            });
        }

        // КРИТИЧНО: ЮKassa имеет лимит 512 символов на ЗНАЧЕНИЕ в metadata.
        // Если заказ большой (много товаров или длинный адрес), JSON.stringify(order) этот лимит превысит.
        // Поэтому мы разбиваем данные на куски od0, od1... (каждый до 510 симв).
        const orderStr = JSON.stringify(order);
        const metadata = {};
        const chunkSize = 510;
        
        if (orderStr.length <= chunkSize) {
            metadata.orderData = orderStr; // обратная совместимость
        } else {
            for (let i = 0; i < orderStr.length; i += chunkSize) {
                metadata[`od${Math.floor(i / chunkSize)}`] = orderStr.substring(i, i + chunkSize);
            }
        }

        const paymentData = {
            amount: {
                value: totalAmount.toFixed(2),  // "500.00" — СТРОГО 2 знака
                currency: 'RUB'
            },
            confirmation: type === 'redirect'
                ? { type: 'redirect', return_url: returnUrl }
                : { type: 'embedded' },
            capture: true,
            description: `Заказ: ${order.name || 'покупатель'} (${order.phone || ''})`.substring(0, 128),
            metadata: metadata,
            receipt: {
                customer: {
                    phone: phoneForReceipt  // "79001234567" — БЕЗ ПЛЮСА
                },
                items: paymentItems
            }
        };

        console.log('[API] Sending to YooKassa:', {
            amount: paymentData.amount.value,
            phone: phoneForReceipt,
            itemsCount: paymentItems.length,
            receiptTotal
        });

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
            console.error('[API] YooKassa Error:', JSON.stringify(payment, null, 2));
            let errorMessage = payment.description || 'Ошибка ЮKassa';
            if (payment.parameter) {
                errorMessage += ` [поле: ${payment.parameter}]`;
            }
            if (payment.parameters && payment.parameters.length) {
                errorMessage += ` (параметры: ${payment.parameters.map(p => p.name).join(', ')})`;
            }
            return res.status(response.status).json({
                error: errorMessage,
                code: payment.code,
                yookassaResponse: payment
            });
        }

        console.log('[API] Payment created:', payment.id, '| status:', payment.status);

        // === ОТПРАВКА УВЕДОМЛЕНИЯ "ОЖИДАЕТ ОПЛАТЫ" ===
        const { BOT_TOKEN, ADMIN_CHAT_IDS } = process.env;
        if (BOT_TOKEN && ADMIN_CHAT_IDS) {
            const adminIds = ADMIN_CHAT_IDS.split(',').map(id => id.trim());

            const itemsText = order.items.map(item => {
                const productUrl = item.id ? `${protocol}://${host}/product/${item.id}` : null;
                const nameText = productUrl ? `<a href="${productUrl}">${item.name}</a>` : `<b>${item.name}</b>`;
                return `• ${nameText} × ${item.quantity} — ${item.price * item.quantity} ₽`;
            }).join('\n');
            const addressText = order.deliveryType === 'delivery'
                ? `📍 Адрес: ${order.address}${order.apartment ? `, кв. ${order.apartment}` : ''}${order.floor ? `, эт. ${order.floor}` : ''}`
                : '🏪 Самовывоз';

            const message = [
                '⏳ <b>НОВЫЙ ЗАКАЗ (ОЖИДАЕТ ОПЛАТЫ)</b>',
                '',
                itemsText,
                '─────────────────────',
                `💰 К оплате: <b>${totalAmount} ₽</b>`,
                `🚚 Доставка: ${deliveryCost} ₽`,
                `🎁 Скидка: ${discount} ₽`,
                '─────────────────────',
                `👤 Клиент: ${order.name}`,
                `📞 Тел: ${order.phone}`,
                `⏱ Время: ${order.deliveryTime === 'later' ? `На другой день (${order.targetDate || '?'})` : 'Сегодня'}`,
                addressText,
                order.comment ? `💬 Коммент: ${order.comment}` : '',
                '',
                `<i>ID платежа: ${payment.id}</i>`,
                '<i>Менеджер, жди подтверждения оплаты от бота ✅</i>'
            ].filter(Boolean).join('\n');

            import('telegraf').then(({ Telegraf }) => {
                const tempBot = new Telegraf(BOT_TOKEN);
                Promise.all(adminIds.map(chatId =>
                    tempBot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' })
                )).catch(tgErr => {
                    console.error('[Telegram] Error sending pending notification:', tgErr);
                });
            }).catch(tgErr => {
                console.error('[Telegram] Error importing telegraf:', tgErr);
            });
        }

        return res.status(200).json({
            success: true,
            confirmationToken: payment.confirmation?.confirmation_token,
            paymentUrl: payment.confirmation?.confirmation_url,
            paymentId: payment.id   // для polling статуса на фронте
        });

    } catch (err) {
        console.error('[API] Server Error:', err);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера: ' + err.message });
    }
}
