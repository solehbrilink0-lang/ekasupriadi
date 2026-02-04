import React, { useState } from 'react';
import { analyzeStoreUrl, AnalysisResult } from '../services/geminiService';
import { Send, Loader2, Link as LinkIcon, ExternalLink, Bot, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AiAdvisor: React.FC = () => {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [marketplace, setMarketplace] = useState('Shopee');

  const handleAnalysis = async () => {
    if (!url.trim()) {
      alert("Masukkan URL dulu bosku.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeStoreUrl(url, marketplace, notes);
      setResult(data);
    } catch (error) {
      alert("Gagal analisa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 relative">
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50">
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
            <div className="bg-violet-100 p-4 rounded-full">
              <Bot className="w-8 h-8 text-violet-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">Konsultan Pribadi</p>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                Kirim link toko kompetitor atau toko kamu sendiri untuk di-audit kelemahannya.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
             <div className="relative">
               <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
               <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-violet-600" />
             </div>
             <p className="text-sm font-medium text-violet-600 animate-pulse">Sedang mengintip toko...</p>
          </div>
        )}

        {result && (
          <div className="animate-fade-in-up pb-4">
             <div className="flex items-start gap-3">
               <div className="bg-violet-600 p-2 rounded-xl rounded-tl-none flex-shrink-0">
                 <Bot className="w-5 h-5 text-white" />
               </div>
               <div className="space-y-2 max-w-[90%]">
                 <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-800 leading-relaxed prose prose-sm prose-violet">
                    <ReactMarkdown>{result.text}</ReactMarkdown>
                 </div>
                 
                 {result.sources.length > 0 && (
                   <div className="flex flex-wrap gap-2">
                     {result.sources.map((s, i) => (
                       <a key={i} href={s.uri} target="_blank" className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-medium text-gray-500 hover:text-violet-600 hover:border-violet-200 flex items-center gap-1 transition-colors">
                         <ExternalLink className="w-3 h-3" />
                         {s.title.substring(0, 20)}...
                       </a>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 z-10">
         <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
           {['Shopee', 'TikTok Shop', 'Tokopedia'].map(m => (
             <button 
               key={m} 
               onClick={() => setMarketplace(m)}
               className={`text-xs px-3 py-1.5 rounded-full border transition-all ${marketplace === m ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
             >
               {m}
             </button>
           ))}
         </div>
         
         <div className="flex flex-col gap-2">
           <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste Link Toko disini..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              />
           </div>
           <div className="flex gap-2">
             <input 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan (Opsional)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              />
             <button 
               onClick={handleAnalysis}
               disabled={loading || !url}
               className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors shadow-lg shadow-violet-200"
             >
               <Send className="w-5 h-5" />
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default AiAdvisor;