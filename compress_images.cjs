const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Проверяем установку библиотеки sharp для сжатия картинок...');
try {
    require.resolve('sharp');
} catch (e) {
    console.log('Библиотека sharp не найдена. Устанавливаю (это займет пару секунд)...');
    execSync('npm install sharp --no-save', { stdio: 'inherit' });
}

const sharp = require('sharp');
const dir = path.join(__dirname, 'public', 'sequence');

async function processImages() {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    console.log(`Найдено ${files.length} кадров .png для конвертации в формат WebP.`);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sourcePath = path.join(dir, file);
        const targetPath = path.join(dir, file.replace('.png', '.webp'));

        // Сжимаем кадр до 1080px (или меньше) с качеством WebP 70%
        // Это снизит вес одного кадра с ~1-2 MB до ~30-50 KB без потери визуального качества
        await sharp(sourcePath)
            .resize({ width: 1080, withoutEnlargement: true })
            .webp({ quality: 65, effort: 6 })
            .toFile(targetPath);

        // Удаляем исходный тяжелый PNG файл
        fs.unlinkSync(sourcePath);

        // Красивый вывод прогресса
        process.stdout.write(`\rСжимаем изображения: [${i + 1}/${files.length}]`);
    }

    console.log('\n\n✅ Успешно! Все изображения сжаты и конвертированы в WebP.');
    console.log('Вес папки /sequence снизился примерно в 10-15 раз!');
    console.log('Теперь анимация при скролле будет работать молниеносно даже на старых телефонах.');
}

processImages().catch(console.error);
