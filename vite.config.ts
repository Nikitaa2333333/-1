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
        if (req.url === '/api/save-content' && req.method === 'POST') {
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
  build: {
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // инлайн файлов < 4KB
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
