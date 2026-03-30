export default async function handler(req, res) {
    const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
    const branch = "main";
    const dataPath = "src/data/products.json";

    try {
        // Если есть токены — пробуем взять самое свежее с GitHub
        if (GITHUB_TOKEN && GITHUB_REPO) {
            // Добавляем t=Date.now() чтобы убить кэш
            const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${dataPath}?ref=${branch}&t=${Date.now()}`, {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (ghRes.ok) {
                const ghJson = await ghRes.json();
                const content = Buffer.from(ghJson.content, 'base64').toString('utf-8');
                return res.status(200).json(JSON.parse(content));
            }
        }

        // Если токенов нет или GitHub недоступен — берем локальный файл
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const localPath = path.resolve(__dirname, '../src/data/products.json');
        
        if (fs.existsSync(localPath)) {
            const localContent = fs.readFileSync(localPath, 'utf-8');
            return res.status(200).json(JSON.parse(localContent));
        }

        res.status(404).json({ error: 'Data not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
