export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
        return res.status(500).json({ error: 'ОШИБКА: Токены GITHUB_TOKEN и GITHUB_REPO не найдены. Добавьте их в Переменные окружения в панели Timeweb.' });
    }

    const branch = "main";
    const dataPath = "src/data/products.json";

    try {
        let formData = req.body;

        // Хелпер для загрузки картинки на GitHub
        const uploadToGitHub = async (base64String, namePrefix) => {
            if (!base64String || !base64String.startsWith('data:image')) return base64String;
            
            const fileName = `${namePrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}.webp`;
            const storagePath = `public/assets/products/${fileName}`;
            const base64Data = base64String.split(',')[1];

            // Подготавливаем загрузку картинки на GitHub
            const uploadRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${storagePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `📸 Загрузка фото: ${fileName}`,
                    content: base64Data,
                    branch: branch
                })
            });

            if (uploadRes.ok) {
                // Если загрузилось — меняем путь в JSON на статический
                return `/assets/products/${fileName}`;
            } else {
                const errorText = await uploadRes.text();
                console.error(`Ошибка загрузки фото ${fileName}:`, errorText);
                return base64String; // Оставляем как есть, если не вышло
            }
        };

        // 1. Пробегаемся по товарам и ищем новые картинки (включая галерею)
        formData.products = await Promise.all(formData.products.map(async (product) => {
            // Обработка главного фото
            const mainImage = await uploadToGitHub(product.image, 'item');
            
            // Обработка галереи
            const updatedGallery = product.gallery ? await Promise.all(product.gallery.map(async (item) => {
                const imgUrl = await uploadToGitHub(item.image, 'gal');
                return { ...item, image: imgUrl };
            })) : [];

            return { ...product, image: mainImage, gallery: updatedGallery };
        }));

        // 2. Теперь сохраняем обновленный JSON
        const jsonContent = Buffer.from(JSON.stringify(formData, null, 2)).toString('base64');

        // Получаем SHA файла для обновления (с защитой от кэша)
        const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${dataPath}?ref=${branch}&t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache'
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
                message: '🚀 Обновление товаров и фото через Админ-Панель (v2)',
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
        console.error('Save Error:', err);
        res.status(500).json({ error: err.message });
    }
}
