import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'claude-api-router',
      configureServer(server) {
        // 在 Vite 開發伺服器中直接攔截並建立一個真的後端 API 路由
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/refine' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { text } = JSON.parse(body);
                
                // 優先讀取環境變數中的 Claude API Key
                const apiKey = process.env.VITE_CLAUDE_API_KEY || process.env.CLAUDE_API_KEY;
                
                if (!apiKey) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: '伺服器未設定 AI 憑證金鑰，請至 Zeabur 設定環境變數' }));
                  return;
                }

                // 在伺服器端安全的呼叫 Anthropic 官方 Claude API
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 100,
                    messages: [
                      {
                        role: 'user',
                        content: `你是一位 Threads 爆款行銷專家。請讀完以下這段使用者提供的長文：\n\n"${text}"\n\n請從中提煉出一句最能引發社群共鳴、最適合做成 5 秒打字機短影音的精闢短金句。限制在 30 字以內，為了排版美觀，請在適當的地方加上換行符號（\\n）。只需要吐出這句金句本身，不要包含任何其他引號、解釋或回覆。`
                      }
                    ]
                  })
                });

                const data = await response.json();
                
                if (data.content && data.content[0]) {
                  const goldSentence = data.content[0].text.trim();
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ result: goldSentence }));
                } else {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Claude API 回傳格式異常' }));
                }
              } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'AI 服務連線異常' }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});