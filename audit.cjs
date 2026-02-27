const { chromium } = require('playwright'); (async () => { const browser = await chromium.launch(); const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage(); 
try { 
    console.log('1. Главная...'); await page.goto('http://localhost:5173'); await page.waitForTimeout(2000); await page.screenshot({ path: '1_home.png' });
    
    console.log('2. Проверка товаров...'); await page.evaluate(() => window.scrollTo(0, 2000)); await page.waitForTimeout(1000); await page.screenshot({ path: '2_products.png' });

    console.log('3. Оформление заказа...'); await page.goto('http://localhost:5173/checkout'); await page.waitForTimeout(1500); await page.screenshot({ path: '3_checkout_empty.png' });

    console.log('Готово! Проверь файлы: 1_home.png, 2_products.png, 3_checkout_empty.png');
} catch (e) { console.error(e); } finally { await browser.close(); } })();
