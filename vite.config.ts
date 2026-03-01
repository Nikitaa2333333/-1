import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Локальный плагин сохранения для админки
function savePlugin() {
  return {
    name: 'save-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url.startsWith('/api/save-content')) {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const filePath = path.resolve(__dirname, 'src/data/products.json');
              fs.writeFileSync(filePath, JSON.stringify(JSON.parse(body), null, 2));
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: true }));
            }
          });
        } else if (req.url.startsWith('/api/send-order')) {
          // ЛОКАЛЬНАЯ ИМИТАЦИЯ ОТПРАВКИ ЗАКАЗА + ЮKASSA
          let body = '';
          req.on('data', (chunk: any) => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              const order = JSON.parse(body);

              // Твои личные тестовые данные ЮKassa
              const shopId = '1288702';
              const secretKey = 'test_E3TyzQ80H1z7e2XOvU_VZbdHqGqpsyEX7ESUXUe8FjQ';
              const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');
              const idempotenceKey = Date.now().toString();

              const { type = 'embedded' } = order;
              const protocol = req.headers['x-forwarded-proto'] || 'http';
              const host = req.headers.host || 'localhost:5173';

              const confirmationParams = type === 'redirect'
                ? { type: 'redirect', return_url: `${protocol}://${host}/checkout?success=true` }
                : { type: 'embedded' };

              console.log(`[YooKassa] Creating payment (type: ${type})...`);

              const response = await fetch('https://api.yookassa.ru/v3/payments', {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${auth}`,
                  'Idempotence-Key': idempotenceKey,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  amount: { value: order.total.toString(), currency: 'RUB' },
                  confirmation: confirmationParams,
                  capture: true,
                  description: `Заказ (режим ${type}): ${order.name} | ${order.phone}`
                })
              });

              const payment = await response.json();
              console.log('[YooKassa] Response:', JSON.stringify(payment, null, 2));

              if (!response.ok) {
                console.error('❌ YooKassa API Error:', payment);
                res.statusCode = response.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: payment.description || 'Ошибка ЮKassa: ' + (payment.code || 'unknown') }));
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                confirmationToken: payment.confirmation?.confirmation_token,
                paymentUrl: payment.confirmation?.confirmation_url
              }));
            } catch (e: any) {
              console.error('❌ Local API System Error:', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Internal Server Error: ' + e.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), savePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
        }
      }
    }
  }
});
