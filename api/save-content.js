export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
        return res.status(500).json({ error: 'ОШИБКА: Токены GITHUB_TOKEN и GITHUB_REPO не найдены в настройках Vercel' });
    }

    const branch = "main";
    const dataPath = "src/data/products.json";

    try {
        let formData = req.body;
        const uploadPromises = [];

        // 1. Пробегаемся по товарам и ищем новые картинки (в формате base64)
        formData.products = await Promise.all(formData.products.map(async (product) => {
            if (product.image && product.image.startsWith('data:image')) {
                const fileName = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
                const storagePath = `public/assets/products/${fileName}`;
                const base64Data = product.image.split(',')[1];

                // Подготавливаем загрузку картинки на GitHub
                const uploadRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${storagePath}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `📸 Загрузка фото для ${product.name}`,
                        content: base64Data,
                        branch: branch
                    })
                });

                if (uploadRes.ok) {
                    // Если загрузилось — меняем путь в JSON на статический
                    return { ...product, image: `/assets/products/${fileName}` };
                }
            }
            return product;
        }));

        // 2. Теперь сохраняем обновленный JSON
        const jsonContent = Buffer.from(JSON.stringify(formData, null, 2)).toString('base64');

        // Получаем SHA файла для обновления
        const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${dataPath}?ref=${branch}`, {
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

        const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${dataPath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: '🚀 Обновление товаров и фото через Админ-Панель',
                content: jsonContent,
                sha: sha,
                branch: branch
            })
        });

        if (!putRes.ok) {
            throw new Error(`Ошибка от GitHub при сохранении JSON: ${await putRes.text()}`);
        }

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
