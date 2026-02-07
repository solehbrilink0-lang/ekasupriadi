
import React, { useEffect, useState } from 'react';
import { getDailyInsight, DailyInsightResult } from '../services/geminiService';
import { Zap, Clock, BarChart3, TrendingUp, Sparkles, Layout, Coins, ExternalLink, ArrowRight, ShoppingBag, Flame } from 'lucide-react';

const DashboardHome: React.FC<{ onChangeMode: (mode: any) => void }> = ({ onChangeMode }) => {
  const [insight, setInsight] = useState<DailyInsightResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      getDailyInsight()
        .then(setInsight)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getPlatformStyle = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('shopee')) return 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100';
    if (p.includes('tiktok')) return 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800';
    if (p.includes('tokopedia')) return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100';
    if (p.includes('lazada')) return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
    return 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
  };

  return (
    <div className="space-y-8">
      
      {/* Intro Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">Selamat Datang, Juragan! 👋</h4>
            <p className="text-sm text-slate-500 font-medium mt-1 max-w-lg">
              Optimalkan penjualanmu hari ini dengan data dan AI. Jangan biarkan profit tergerus biaya admin.
            </p>
          </div>
          <div className="hidden md:block">
             <span className="bg-white px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 shadow-sm">
               {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
             </span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Market Insight Card - Spans 2 cols on Desktop */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300/50 relative overflow-hidden flex flex-col justify-between min-h-[300px] group transition-all duration-500 hover:shadow-indigo-900/20">
            {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Scanning Market Mood...</p>
            </div>
            ) : (
            <div className="relative z-10 animate-fade-up h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <span className="bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-indigo-500/20 flex items-center gap-2 backdrop-blur-sm">
                        <Zap className="w-3 h-3 fill-current" /> Mood Pasar Hari Ini
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                        insight?.marketMood === 'FIRE' ? 'bg-rose-500 text-white shadow-rose-500/50' : 'bg-blue-500 text-white'
                    }`}>
                        {insight?.marketMood}
                    </span>
                </div>
                
                <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-black leading-tight mb-3 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                        {insight?.headline}
                    </h3>
                    <p className="text-sm text-slate-300 font-medium italic mb-6 border-l-4 border-indigo-500 pl-4 py-1">
                        "{insight?.strategy}"
                    </p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shrink-0 shadow-lg shadow-indigo-900/50 group-hover:scale-110 transition-transform duration-300">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs font-bold leading-normal text-slate-200 max-w-sm">{insight?.actionItem}</p>
                     </div>

                    {/* Grounding Sources */}
                    {insight?.sources && insight.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {insight.sources.slice(0, 2).map((src, i) => (
                                <a 
                                key={i} 
                                href={src.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[9px] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors uppercase font-bold tracking-wider backdrop-blur-md"
                                >
                                <ExternalLink className="w-2.5 h-2.5" /> Sumber Info
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            )}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] group-hover:bg-indigo-600/30 transition-colors duration-700"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px]"></div>
        </div>

        {/* Quick Access Menu Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6 h-full">
             <button onClick={() => onChangeMode('pricing')} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-left active:scale-[0.98] transition-all duration-300 group hover:border-indigo-100 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] h-full flex flex-col relative overflow-hidden">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-600">
                    <BarChart3 className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="mt-auto relative z-10">
                    <h4 className="font-black text-slate-800 text-sm md:text-base group-hover:text-indigo-700 transition-colors">Cek Profit</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">Kalkulator Admin Fee</p>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-300 ml-auto mt-2 absolute bottom-6 right-6 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
             </button>

             <button onClick={() => onChangeMode('creator')} className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all duration-300 text-left group h-full flex flex-col relative overflow-hidden hover:shadow-indigo-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10 backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="mt-auto relative z-10">
                    <h4 className="font-black text-sm md:text-base">Magic Content</h4>
                    <p className="text-[10px] text-indigo-200 mt-1 font-bold uppercase tracking-tight">Buat Deskripsi & Foto AI</p>
                </div>
             </button>
        </div>

      </div>

      {/* TRENDING PRODUCTS SECTION */}
      {insight?.marketplaceTrends && insight.marketplaceTrends.length > 0 && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" /> Sedang Trending
             </h3>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time AI Analysis</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {insight.marketplaceTrends.map((trend, idx) => (
               <div key={idx} className={`rounded-[2rem] p-5 border shadow-sm flex flex-col h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${getPlatformStyle(trend.platform)}`}>
                  <div className="flex items-center justify-between mb-4 border-b border-current/10 pb-3">
                     <h4 className="font-black text-sm uppercase tracking-wide">{trend.platform}</h4>
                     <ShoppingBag className="w-4 h-4 opacity-70" />
                  </div>
                  
                  <div className="space-y-4 flex-1">
                     {trend.items.map((item, i) => (
                        <div key={i} className="flex gap-3 items-start group/item">
                           <span className="text-xs font-black opacity-50 mt-0.5 group-hover/item:opacity-100 transition-opacity">{i+1}.</span>
                           <div>
                              <p className="text-xs font-bold leading-tight group-hover/item:underline">{item.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[9px] opacity-70 bg-current/10 px-1.5 py-0.5 rounded font-bold uppercase">{item.category}</span>
                                 <span className="text-[9px] opacity-70 flex items-center gap-1 font-bold">
                                    <TrendingUp className="w-2.5 h-2.5" /> {item.status}
                                 </span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => onChangeMode('roas')} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all duration-300 group hover:border-emerald-100">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-left">
                <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">Audit Iklan</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Optimasi ROAS</p>
            </div>
        </button>

        <button onClick={() => onChangeMode('topup')} className="bg-amber-50 p-5 rounded-[2rem] border border-amber-100 flex items-center gap-4 hover:bg-amber-100 transition-all duration-300 group md:col-span-2">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Coins className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
                <h4 className="font-black text-amber-900 text-sm">Isi Ulang Koin Kredit</h4>
                <p className="text-[10px] text-amber-700 font-bold uppercase mt-0.5">Dapatkan akses tak terbatas ke fitur AI Premium</p>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-full text-[10px] font-black text-amber-600 shadow-sm group-hover:scale-105 transition-transform duration-300">
                TOPUP
            </div>
        </button>
      </div>

    </div>
  );
};

export default DashboardHome;
