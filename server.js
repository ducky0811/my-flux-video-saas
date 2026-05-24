import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// 允許跨域請求，並強制解析 JSON 格式
app.use(cors());
app.use(express.json());

// 靜態網頁路由：讓後端順便幫你把漂亮的網頁前端渲染出來
app.use(express.static(path.join(__dirname, 'dist')));

// 真正的商用 AI 轉接大腦 (Proxy API)
app.post('/api/claude', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: '雲端伺服器未設定 ANTHROPIC_API_KEY 環境變數！' });
  }

  try {
    // 由安全的雲端後端去幫你敲 Anthropic 的大門，100% 繞過 CORS 跨域限制
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('後端呼叫 Claude 發生崩潰:', error);
    res.status(500).json({ error: '後端伺服器連線中斷' });
  }
});

// 萬用路由：確保重整網頁時不會噴 404
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 商業級前後端完全體伺服器已成功在 Port ${PORT} 完美發動！`);
});
