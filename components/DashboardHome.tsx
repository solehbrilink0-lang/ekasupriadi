import React, { useEffect, useState } from 'react';
import { getDailyInsight, DailyInsightResult } from '../services/geminiService';
import { Calendar, TrendingUp, Zap, Clock, ChevronRight, BarChart3, AlertTriangle, CloudSun } from 'lucide-react';

const DashboardHome: React.FC<{ onChangeMode: (mode: any) => void }> = ({ onChangeMode }) => {
  const [insight, setInsight] = useState<DailyInsightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Timer untuk jam
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    
    // Fetch AI Insight
    const fetchInsight = async () => {
      try {
        const data = await getDailyInsight();
        setInsight(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
    return () => clearInterval(timer);
  }, []);

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateString = currentDate.toLocaleDateString('id-ID', dateOptions);

  return (
    <div className="space-y-6">
      
      {/* 1. Date & Time Hero */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Hari Ini</p>
          <h2 className="text-xl font-black text-slate-800 leading-tight">{dateString}</h2>
        </div>
        <div className="relative z-10 bg-indigo-50 p-3 rounded-2xl">
          <Calendar className="w-8 h-8 text-indigo-600" />
        </div>
        
        {/* Decorative BG */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-2xl opacity-50"></div>
      </div>

      {/* 2. AI Daily Insight Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden animate-fade-up">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
             <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
             <p className="text-xs text-white/60 animate-pulse">AI sedang membaca kalender...</p>
          </div>
        ) : insight ? (
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" /> Daily Insight
                </span>
                
                {/* Mood Badge */}
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                  insight.marketMood === 'FIRE' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 
                  insight.marketMood === 'SLOW' ? 'bg-slate-600 text-slate-200' : 'bg-blue-500 text-white'
                }`}>
                   {insight.marketMood === 'FIRE' ? '🔥 Traffic Tinggi' : 
                    insight.marketMood === 'SLOW' ? '❄️ Traffic Santai' : '🛒 Traffic Normal'}
                </span>
             </div>

             <h3 className="text-lg font-bold mb-2 leading-snug">{insight.headline}</h3>
             <p className="text-sm text-slate-300 mb-6 leading-relaxed border-l-2 border-indigo-500 pl-3">
               "{insight.strategy}"
             </p>

             <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
               <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold text-xs uppercase">
                 <Clock className="w-3 h-3" /> Tugas Hari Ini
               </div>
               <p className="text-sm font-medium">{insight.actionItem}</p>
             </div>
          </div>
        ) : (
          <div className="py-8 text-center text-white/50">Gagal memuat insight.</div>
        )}

        {/* Decorative Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* 3. Trending & Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
         {/* Trending Categories */}
         <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="mb-3">
               <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mb-2">
                 <TrendingUp className="w-5 h-5 text-orange-500" />
               </div>
               <h4 className="font-bold text-slate-700 text-sm">Produk Laris</h4>
               <p className="text-[10px] text-slate-400">Prediksi hari ini</p>
            </div>
            
            {loading ? (
              <div className="space-y-2">
                <div className="h-2 bg-slate-100 rounded w-full animate-pulse"></div>
                <div className="h-2 bg-slate-100 rounded w-3/4 animate-pulse"></div>
              </div>
            ) : (
              <ul className="space-y-1">
                 {insight?.trendingCategories.slice(0, 3).map((cat, idx) => (
                   <li key={idx} className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                     <div className="w-1 h-1 rounded-full bg-orange-400"></div> {cat}
                   </li>
                 ))}
              </ul>
            )}
         </div>

         {/* Quick Action: Price Calc */}
         <div 
           onClick={() => onChangeMode('pricing')}
           className="bg-indigo-600 p-5 rounded-[2rem] shadow-lg shadow-indigo-200 flex flex-col justify-between cursor-pointer hover:bg-indigo-700 transition-colors relative overflow-hidden group"
         >
            <div className="relative z-10">
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                 <BarChart3 className="w-5 h-5 text-white" />
               </div>
               <h4 className="font-bold text-white text-sm">Cek Profit</h4>
               <p className="text-[10px] text-indigo-200 group-hover:text-white transition-colors">Hitung margin & admin fee</p>
            </div>
            <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
               <ChevronRight className="w-5 h-5 text-white" />
            </div>
            {/* Decoration */}
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
         </div>
      </div>
      
      {/* 4. Alert / Info */}
      <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3 border border-blue-100">
         <CloudSun className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
         <div>
            <h5 className="text-xs font-bold text-blue-800 mb-1">Info Cuaca Pasar</h5>
            <p className="text-xs text-blue-600 leading-relaxed">
               Data menunjukkan penjualan biasanya memuncak pada pukul 19:00 - 21:00 WIB. Siapkan CS Anda di jam tersebut!
            </p>
         </div>
      </div>

    </div>
  );
};

export default DashboardHome;