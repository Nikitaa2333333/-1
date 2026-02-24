const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'клубничка');
const targetDir = path.join(__dirname, 'public', 'sequence');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.readdir(sourceDir, (err, files) => {
  if (err) {
    console.error('Ошибка при чтении папки клубничка:', err);
    return;
  }

  // Фильтруем только png файлы и сортируем их
  const pngFiles = files.filter(f => f.endsWith('.png')).sort();

  console.log(`Найдено ${pngFiles.length} кадров. Начинаю копирование и переименование...`);

  pngFiles.forEach((file, index) => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, `frame_${index}.png`);
    
    // Копируем файл
    fs.copyFileSync(sourcePath, targetPath);
  });

  console.log('Готово! Изображения успешно скопированы в public/sequence/');
});
