export default async function handler(req, res) {
    const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
    const branch = "main";
    const dataPath = "src/data/products.json";

    try {
        // 1. Сначала пытаемся получить свежие данные с GitHub (Sync с Админкой)
        if (GITHUB_TOKEN && GITHUB_REPO) {
            const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${dataPath}?ref=${branch}`, {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (ghRes.ok) {
                const ghJson = await ghRes.json();
                const content = Buffer.from(ghJson.content, 'base64').toString('utf8');
                return res.status(200).json(JSON.parse(content));
            }
        }

        // 2. Если с GitHub не вышло (или нет токенов), берем локальные данные с диска
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        // В Timeweb API файлы лежат в /api, а данные в /src/data
        const localPath = path.resolve(__dirname, '../src/data/products.json');
        
        if (fs.existsSync(localPath)) {
            const localContent = fs.readFileSync(localPath, 'utf8');
            return res.status(200).json(JSON.parse(localContent));
        }

        res.status(404).json({ error: 'Data not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
