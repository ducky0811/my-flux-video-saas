import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// 🎯 用最安全直接的方式靜態託管 dist 資料夾
app.use(express.static('dist'));

// 服務檢查端點
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AI 金句提煉通道
app.post('/api/claude', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: '請提供需要提煉的長文案！' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: '後端未配置 ANTHROPIC_API_KEY 環境變數！' });

    // Anthropic 官方標準規格
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [{ role: 'user', content: `請幫我把以下長文案提煉成一句震撼、吸引人的社群爆款金句：\n\n${text}` }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Anthropic API 拒絕請求' });

    res.json({ result: data.content?.[0]?.text || '' });
  } catch (error) {
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
});

// 任何路由一律指向 dist 裡面的 index.html
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: '.' });
});

app.listen(PORT, () => {
  console.log(`🚀 伺服器已在 Port ${PORT} 完美發動！`);
});
