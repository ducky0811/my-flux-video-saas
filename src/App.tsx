import { useRef, useState, useEffect } from 'react';
import { Download, Type, Palette, Sparkles, Crown, Film, BrainCircuit, RefreshCw } from 'lucide-react';

type Theme = 'dark' | 'glass';
type FontStack = 'sans' | 'handwritten';

const fontClasses: Record<FontStack, string> = {
  sans: 'font-sans-tc',
  serif: 'font-serif-tc',
  handwritten: 'font-handwritten-tc',
};

export default function App() {
  const [longText, setLongText] = useState('');
  const [title, setTitle] = useState('這裡會顯示 AI 提煉的爆款金句');
  const [author, setAuthor] = useState('@YourName');
  const [font, setFont] = useState<FontStack>('sans');
  const [theme, setTheme] = useState<Theme>('glass');
  const [aiLoading, setAiLoading] = useState(false);
  const [rendering, setRendering] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 引入 Google Fonts
  useEffect(() => {
    if (!document.getElementById('custom-fonts-link')) {
      const link = document.createElement('link');
      link.id = 'custom-fonts-link';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@700&family=LXGW+WenKai+TC:wght@700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // 核心大腦：正式連線到 Vite 後端呼叫真 AI 金句提煉
  const handleAiRefine = async () => {
    if (!longText.trim()) {
      alert('請先輸入或貼上您的長文想法！');
      return;
    }
    setAiLoading(true);
    try {
      // 戳我們在 vite.config.ts 裡攔截建立的 API 通道
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: longText }),
      });
      
      const data = await response.json();
      
      if (data.result) {
        setTitle(data.result); // 將真 AI 算出來的精準爆款金句放上字卡！
      } else if (data.error) {
        alert(`AI 服務回報錯誤: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('連線到 AI 大腦失敗，請確認網路或後端設定！');
    } finally {
      setAiLoading(false);
    }
  };

  // 核心黑科技：利用 HTML5 Canvas 繪製打字機動畫並錄製成 MP4 短影音
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRendering(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 設定高解析度社群 1:1 畫布 (1080x1080)
    canvas.width = 1080;
    canvas.height = 1080;

    // 準備錄製 Canvas 串流
    const stream = canvas.captureStream(30); // 30 FPS
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-flux-video.mp4';
      a.click();
      setRendering(false);
    };

    mediaRecorder.start();

    // 動態流體背景與打字機參數
    let frame = 0;
    const durationFrames = 150; // 5 秒鐘影片 (30fps * 5)
    const fullText = title;
    let currentText = "";

    const draw = () => {
      if (frame > durationFrames) {
        mediaRecorder.stop();
        return;
      }

      ctx.clearRect(0, 0, 1080, 1080);

      // 1. 繪製流體漸層背景
      const gradient = ctx.createLinearGradient(
        0 + Math.sin(frame * 0.02) * 100, 
        0, 
        1080, 
        1080 + Math.cos(frame * 0.02) * 100
      );
      if (theme === 'glass') {
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#ec4899');
      } else {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, 1080, 1080);
      }
      if (theme === 'glass') {
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1080);
      }

      // 2. 繪製中間的高級感微透明字卡
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = theme === 'glass' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(24, 24, 27, 0.9)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      
      // 繪製圓角卡片
      const cardSize = 860;
      const cardX = (1080 - cardSize) / 2;
      const cardY = (1080 - cardSize) / 2;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardSize, cardSize, 40);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3. 打字機動態邏輯：隨著影格增加文字
      const charsToShow = Math.floor((frame / (durationFrames * 0.6)) * fullText.length);
      currentText = fullText.substring(0, Math.min(charsToShow, fullText.length));

      // 4. 繪製文字
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = font === 'sans' ? 'bold 52px "Noto Sans TC"' : 'bold 54px "LXGW WenKai TC"';

      // 支援多行換行
      const lines = currentText.split('\n');
      const lineHeight = 80;
      const startY = 540 - ((lines.length - 1) * lineHeight) / 2;

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 540, startY + (i * lineHeight));
      }

      // 5. 繪製創作者簽名
      if (frame > durationFrames * 0.6) {
        ctx.font = '600 28px "Noto Sans TC"';
        ctx.fillStyle = theme === 'glass' ? 'rgba(255,255,255,0.7)' : '#a1a1aa';
        ctx.fillText(author, 540, 840);
      }

      frame++;
      requestAnimationFrame(draw);
    };

    draw();
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="border-b border-zinc-800 bg-[#121215] px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit size={18} className="text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black tracking-tight text-base">FluxSaaS AI</span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Crown size={9} /> PRO COMMERCIAL
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">長文自動提煉金句 ✕ 5秒社群短影音產生器</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Control Panel */}
        <aside className="w-full lg:w-96 bg-[#121215] border-r border-zinc-800 flex flex-col overflow-y-auto">
          <div className="p-6 flex flex-col gap-6">
            
            {/* Step 1: AI Engine Input */}
            <section className="bg-[#1c1c22] p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} /> STEP 1: AI 爆款文案提煉
                </span>
              </div>
              <textarea
                value={longText}
                onChange={e => setLongText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-xs border border-zinc-700 rounded-lg bg-[#121215] text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                placeholder="在此貼上您的長篇文章、靈感日記、或讀書筆記，讓 AI 自動提煉最吸睛的社群金句..."
              />
              <button
                onClick={handleAiRefine}
                disabled={aiLoading}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-zinc-100 text-zinc-950 font-bold text-xs rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
              >
                {aiLoading ? <RefreshCw size={12} className="animate-spin" /> : <BrainCircuit size={13} />}
                {aiLoading ? 'AI 正在深度思考提煉中...' : '一鍵提煉爆款社群金句'}
              </button>
            </section>

            {/* Step 2: Customization */}
            <section className="bg-[#1c1c22] p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-2">
                <Type size={12} className="text-purple-400" />
                <span className="text-xs font-bold text-zinc-300 tracking-wider">STEP 2: 微調文案與簽名</span>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">金句內容 (可手動換行)</label>
                  <textarea
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-700 rounded-lg bg-[#121215] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">作者簽名 / 帳號</label>
                  <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-700 rounded-lg bg-[#121215] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            </section>

            {/* Step 3: Design Style */}
            <section className="bg-[#1c1c22] p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Palette size={12} className="text-pink-400" />
                <span className="text-xs font-bold text-zinc-300 tracking-wider">STEP 3: 視覺與字體美學</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setFont('sans')} className={`py-2 rounded-lg text-xs border ${font === 'sans' ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold' : 'border-zinc-700 text-zinc-400 bg-[#121215]'}`}>思源黑體</button>
                  <button onClick={() => setFont('handwritten')} className={`py-2 rounded-lg text-xs border ${font === 'handwritten' ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold' : 'border-zinc-700 text-zinc-400 bg-[#121215]'}`}>霞鶩文楷</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setTheme('glass')} className={`py-2 rounded-lg text-xs border ${theme === 'glass' ? 'border-purple-500 bg-purple-500/10 text-white font-bold' : 'border-zinc-700 text-zinc-400 bg-[#121215]'}`}>流體毛玻璃</button>
                  <button onClick={() => setTheme('dark')} className={`py-2 rounded-lg text-xs border ${theme === 'dark' ? 'border-zinc-500 bg-zinc-500/10 text-white font-bold' : 'border-zinc-700 text-zinc-400 bg-[#121215]'}`}>極簡深邃黑</button>
                </div>
              </div>
            </section>
          </div>

          {/* Action Footer */}
          <div className="mt-auto p-6 border-t border-zinc-800 bg-[#121215]">
            <button
              onClick={handleExportVideo}
              disabled={rendering}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white text-sm font-black rounded-xl transition shadow-xl shadow-purple-500/10 disabled:opacity-40 animate-shimmer"
            >
              <Film size={16} className={rendering ? "animate-spin" : ""} />
              {rendering ? '高解析短影音渲染中 (5秒)...' : '一鍵生成 5 秒動態短影音 (MP4)'}
            </button>
          </div>
        </aside>

        {/* Right Preview Section */}
        <section className="flex-1 flex flex-col items-center justify-center p-8 bg-[#09090b] relative">
          <div className="w-full max-w-sm aspect-square bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center">
            
            {/* 隱藏的實體 Canvas，專門用來錄製超清晰 1080p 影片 */}
            <canvas ref={canvasRef} className="hidden" />

            {/* 前端 CSS 模擬的動態效果 (供使用者在網頁上預覽效果) */}
            <div className={`aspect-square w-full rounded-xl flex items-center justify-center overflow-hidden border border-zinc-700/30 shadow-inner relative ${theme === 'glass' ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : 'bg-zinc-950'}`}>
              
              {/* 流體背景動畫模擬 */}
              {theme === 'glass' && <div className="absolute inset-0 bg-white/10 backdrop-blur-md animate-pulse" />}
              
              <div className={`w-4/5 h-4/5 rounded-xl flex flex-col items-center justify-center p-6 gap-4 text-center relative z-10 ${theme === 'glass' ? 'bg-white/20 border border-white/20 backdrop-blur-md' : 'bg-zinc-900 border border-zinc-800'}`}>
                <div className={`w-6 h-0.5 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-white/30'}`} />
                <h2 className={`text-lg md:text-xl font-bold leading-snug tracking-tight text-white whitespace-pre-line ${font === 'sans' ? 'font-sans-tc' : 'font-handwritten-tc'}`}>
                  {title}
                </h2>
                <div className={`w-6 h-0.5 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-white/30'}`} />
                <span className="text-[10px] tracking-widest text-zinc-300 font-medium uppercase">{author}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-zinc-600 mt-4 font-mono">
            OUTPUT: 1080x1080 MP4 // WITH TYPEWRITER ANIMATION
          </div>
        </section>
      </main>
    </div>
  );
}