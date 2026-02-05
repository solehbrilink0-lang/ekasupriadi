import React, { useState } from 'react';
import { analyzeStoreUrl, AnalysisResult } from '../services/geminiService';
import { Bot, Send, Loader2, Lightbulb, Link as LinkIcon, ExternalLink, Search, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AiAdvisor: React.FC = () => {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [marketplace, setMarketplace] = useState('Shopee');

  const handleAnalysis = async () => {
    if (!url.trim()) {
      alert("Mohon masukkan URL toko Anda.");
      return;
    }
    
    setLoading(true);
    setResult(null);
    setErrorMsg(null);
    
    try {
      const data = await analyzeStoreUrl(url, marketplace, notes);
      setResult(data);
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan saat menganalisa URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[650px]">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bot className="w-6 h-6" />
          Analisa Toko (Via URL)
        </h2>
        <select 
          value={marketplace}
          onChange={(e) => setMarketplace(e.target.value)}
          className="bg-white/20 text-white border border-white/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <option value="Shopee" className="text-gray-900">Shopee</option>
          <option value="TikTok Shop" className="text-gray-900">TikTok Shop</option>
          <option value="Lazada" className="text-gray-900">Lazada</option>
          <option value="Tokopedia" className="text-gray-900">Tokopedia</option>
        </select>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {!result && !loading && !errorMsg && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
            <Search className="w-12 h-12 text-violet-400 opacity-50" />
            <div className="max-w-md">
              <h3 className="font-medium text-gray-800 mb-2">Cek Kesehatan Toko Anda</h3>
              <p className="text-sm">
                Masukkan link toko Anda (atau kompetitor). AI akan mengunjungi link tersebut, mencari data publik, dan memberikan analisa SWOT serta saran perbaikan.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-indigo-600 animate-pulse">
            <Loader2 className="w-10 h-10 animate-spin mb-3" />
            <p className="font-medium">Sedang mengunjungi URL & Menganalisa...</p>
            <p className="text-xs text-gray-400 mt-2">Ini menggunakan Google Search Real-time</p>
          </div>
        )}

        {errorMsg && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
             <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
             <p className="text-gray-800 font-medium mb-1">Gagal Menganalisa</p>
             <p className="text-sm text-gray-500">{errorMsg}</p>
             <button onClick={() => setErrorMsg(null)} className="mt-4 text-sm text-indigo-600 hover:underline">Coba Lagi</button>
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-fade-in">
             <div className="prose prose-sm prose-indigo max-w-none bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>

            {/* Grounding Sources */}
            {result.sources.length > 0 && (
              <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Sumber Referensi Pencarian
                </h4>
                <div className="grid gap-2">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-indigo-600 hover:underline bg-white p-2 rounded border border-gray-200"
                    >
                      <LinkIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{source.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LinkIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={`Paste Link Toko ${marketplace} di sini (Contoh: shopee.co.id/namatoko)`}
            className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
          />
        </div>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ada keluhan khusus? (Contoh: Kenapa traffic tinggi tapi yang beli sedikit?)"
            className="flex-1 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAnalysis();
            }}
          />
          <button
            onClick={handleAnalysis}
            disabled={loading || !url.trim()}
            className="px-6 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors font-medium text-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analisa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAdvisor;