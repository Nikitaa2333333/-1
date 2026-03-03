/**
 * GET /api/check-payment?id=<payment_id>
 *
 * Проверяет статус платежа в ЮKassa.
 * Возвращает { status: 'pending' | 'succeeded' | 'canceled' | 'waiting_for_capture' }
 *
 * Используется фронтом для polling — каждые 3 секунды проверяем,
 * прошла ли оплата, и показываем экран успеха.
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Не указан ID платежа' });
    }

    const { YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY } = process.env;

    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
        return res.status(500).json({ error: 'Ключи ЮKassa не настроены' });
    }

    try {
        const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

        const response = await fetch(`https://api.yookassa.ru/v3/payments/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error('[check-payment] YooKassa error:', errData);
            return res.status(response.status).json({ error: errData.description || 'Ошибка ЮKassa' });
        }

        const payment = await response.json();
        console.log(`[check-payment] Payment ${id}: ${payment.status}`);

        return res.status(200).json({
            status: payment.status,
            paid: payment.paid,
            amount: payment.amount
        });

    } catch (err) {
        console.error('[check-payment] Server error:', err);
        return res.status(500).json({ error: 'Ошибка сервера: ' + err.message });
    }
}
