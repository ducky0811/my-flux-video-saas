import { useRef, useState, useEffect } from 'react';
import { Download, Type, Palette, Sparkles, Crown, Film, BrainCircuit, RefreshCw } from 'lucide-react';

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [author, setAuthor] = useState('@YourName');
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState('modern');

  const handleRefine = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim() // 🎯 前端打包成 text 變數送出
        })
      });
      
      const data = await response.json();
      if (response.ok && data.result) {
        setResult(data.result.replace(/^["']|["']$/g, ''));
      } else if (data.error) {
        alert(`AI 思考失敗：${typeof data.error === 'object' ? JSON.stringify(data.error) : data.error}`);
      } else {
        alert('連線到 AI 大腦失敗，請確認網路或後端設定！');
      }
    } catch (error) {
      alert('後端連線中斷，請稍後再試！');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-between font-sans">
      <header className="p-4 border-b border-slate-900 bg-slate-950/50 backdrop-blur flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-indigo-500 animate-pulse" />
          <div>
            <h1 className="font-bold tracking-tight flex items-center gap-1.5">
              FluxSaaS AI 
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Crown className="w-3 h-3" /> PRO COMMERCIAL
              </span>
            </h1>
            <p className="text-xs text-slate-500">長文自動提煉金句 × 5秒社群短影音產生器</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-4">
            <h2 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> STEP 1: AI 爆款文案提煉
            </h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="請在這裡輸入或貼上你的長文案、文章內容、專業筆記..."
              className="w-full h-40 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 transition resize-none text-slate-300"
            />
            <button
              onClick={handleRefine}
              disabled={loading || !text.trim()}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-sm font-medium py-2.5 px-4 rounded-lg border border-slate-700 transition flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              {loading ? 'AI 大腦高速提煉中...' : '一鍵提煉爆款社群金句'}
            </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-4">
            <h2 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-2">
              <Type className="w-4 h-4" /> STEP 2: 微調文案與簽名
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">金句內容 (可手動換行)</label>
                <textarea
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="這裡會顯示 AI 提煉的爆款金句"
                  className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 transition resize-none text-slate-300"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">作者簽名 / 帳號</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition text-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-4">
            <h2 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-2">
              <Palette className="w-4 h-4" /> STEP 3: 視覺與字體美學
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStyle('modern')}
                className={`py-2 px-3 text-xs rounded-lg border font-medium transition ${style === 'modern' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
              >
                思源黑體
              </button>
              <button
                onClick={() => setStyle('serif')}
                className={`py-2 px-3 text-xs rounded-lg border font-medium transition ${style === 'serif' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
              >
                霞鶩文楷
              </button>
              <button
                onClick={() => setStyle('glass')}
                className={`py-2 px-3 text-xs rounded-lg border font-medium transition ${style === 'glass' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
              >
                流體毛玻璃
              </button>
              <button
                onClick={() => setStyle('dark')}
                className={`py-2 px-3 text-xs rounded-lg border font-medium transition ${style === 'dark' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
              >
                極簡深邃黑
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-900/20 border border-slate-900 rounded-2xl p-6 min-h-[500px] flex flex-col items-center justify-center gap-6 sticky top-24">
          <div className="w-full max-w-md aspect-square rounded-2xl p-8 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-indigo-950">
            <div className="w-full border-b border-slate-800/50 pb-4 text-xs font-mono tracking-widest text-slate-500 uppercase">
              ✨ AI INSIGHT VIDEO PREVIEW
            </div>
            <div className="flex-1 flex items-center justify-center my-6">
              <p className={`text-xl md:text-2xl font-bold leading-relaxed tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-100 ${style === 'serif' ? 'font-serif' : 'font-sans'}`}>
                {result || '這裡會顯示 AI 提煉的爆款金句'}
              </p>
            </div>
            <div className="w-full border-t border-slate-800/50 pt-4 text-xs tracking-wider text-indigo-400 font-medium">
              {author}
            </div>
          </div>
          <div className="text-[10px] text-slate-600 font-mono tracking-wider uppercase">
            OUTPUT: 1080x1080 MP4 // WITH TYPEWRITER ANIMATION
          </div>
        </div>
      </main>

      <footer className="p-4 border-t border-slate-900 bg-slate-950/80 sticky bottom-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-end">
          <button
            disabled={!result}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-30 disabled:pointer-events-none text-white text-sm font-semibold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2"
          >
            <Film className="w-4 h-4" /> 一鍵生成 5 秒動態短影音 (MP4)
          </button>
        </div>
      </footer>
    </div>
  );
}
