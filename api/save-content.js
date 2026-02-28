export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { GITHUB_TOKEN, GITHUB_REPO } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
        return res.status(500).json({ error: 'ОШИБКА: Токены GITHUB_TOKEN и GITHUB_REPO не найдены в настройках Vercel' });
    }

    const branch = "main";
    const path = "src/data/products.json";

    try {
        const data = req.body;
        const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

        // 1. Получаем текущий файл, чтобы узнать его SHA (требование GitHub для перезаписи)
        const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${branch}`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let sha;
        if (getRes.ok) {
            const getJson = await getRes.json();
            sha = getJson.sha;
        }

        // 2. Делаем невидимый коммит (сохраняем прямо на GitHub)
        const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: '🚀 Обновление контента через Админ-Панель',
                content: content,
                sha: sha,
                branch: branch
            })
        });

        if (!putRes.ok) {
            const errorText = await putRes.text();
            throw new Error(`Ошибка от GitHub: ${errorText}`);
        }

        res.status(200).json({ success: true, message: 'Сохранено на GitHub' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
