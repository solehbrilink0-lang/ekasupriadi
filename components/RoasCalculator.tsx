
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { generateAdStrategy, AdStrategyResult } from '../services/geminiService';
import { Target, TrendingUp, Loader2, Bot, Info, Crosshair, BarChart3, Coins, ShoppingBag } from 'lucide-react';
import { Marketplace } from '../types';

const RoasCalculator: React.FC = () => {
  const { deductCredit } = useUser();
  const [productName, setProductName] = useState('');
  const [marketplace, setMarketplace] = useState<Marketplace>(Marketplace.SHOPEE);
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [profitPerItem, setProfitPerItem] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdStrategyResult | null>(null);

  const handleAiCalculate = async () => {
    if (!productName || !sellingPrice || !profitPerItem) {
        alert("Mohon lengkapi Nama Produk, Harga, dan Profit.");
        return;
    }

    setLoading(true);
    const success = await deductCredit();
    
    if (!success) {
        alert("Koin tidak cukup. Silakan topup.");
        setLoading(false);
        return;
    }

    try {
        const price = parseFloat(sellingPrice) || 0;
        const profit = parseFloat(profitPerItem) || 0;
        
        const strategy = await generateAdStrategy(productName, marketplace, price, profit);
        setResult(strategy);
    } catch (error) {
        alert("Gagal menganalisa strategi iklan.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="pt-4 pb-20 lg:pb-0 flex flex-col lg:flex-row gap-8 items-start">
      
      {/* INPUT SECTION */}
      <div className={`w-full ${result ? 'lg:w-1/2' : 'lg:w-full max-w-2xl mx-auto'} transition-all`}>
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <Target className="w-6 h-6 text-rose-500" /> Konsultan Iklan AI
              </h2>
              <span className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5">
                 <Coins className="w-3.5 h-3.5"/> 1 Koin
              </span>
           </div>

           <div className="space-y-5">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Produk & Platform</label>
                 <input 
                  type="text" 
                  placeholder="Nama Produk (Misal: Serum Wajah)" 
                  value={productName} 
                  onChange={e => setProductName(e.target.value)} 
                  className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500" 
                 />
                 <div className="flex flex-wrap gap-2 pt-2">
                    {Object.values(Marketplace).map(m => (
                        <button 
                          key={m} 
                          onClick={() => setMarketplace(m)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                            marketplace === m ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          {m}
                        </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Harga Jual</label>
                    <input 
                        type="number" 
                        placeholder="0" 
                        value={sellingPrice} 
                        onChange={e => setSellingPrice(e.target.value)} 
                        className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Profit/Pcs</label>
                    <input 
                        type="number" 
                        placeholder="0" 
                        value={profitPerItem} 
                        onChange={e => setProfitPerItem(e.target.value)} 
                        className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-emerald-600 outline-none" 
                    />
                 </div>
              </div>

              <button 
                onClick={handleAiCalculate}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Bot className="w-5 h-5" />}
                REKOMENDASIKAN SETTING IKLAN
              </button>
           </div>
           
           <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-800 leading-relaxed font-bold">
                AI akan menghitung batas aman ROAS dan memberikan angka rekomendasi setting yang pas agar iklan perform (tidak kemahalan, tidak boncos).
              </p>
           </div>
        </div>
      </div>

      {/* RESULT SECTION */}
      {result && (
        <div className="w-full lg:w-1/2 animate-fade-up">
            <div className="flex justify-between items-center px-2 mb-4">
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-rose-600" /> Strategi {marketplace}
                </h3>
                <button onClick={() => setResult(null)} className="text-xs font-bold text-slate-400 underline hover:text-slate-600">
                    Reset Analisa
                </button>
            </div>

            <div className="space-y-6">
                {/* Main Recommendation Card */}
                <div className="bg-rose-600 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                    
                    <div className="relative z-10 text-center">
                        <p className="text-xs font-black text-rose-200 uppercase tracking-widest mb-3">SETTING DI APLIKASI IKLAN</p>
                        <div className="flex items-end justify-center gap-3 mb-2">
                            <span className="text-6xl font-black">{result.recommendedTargetRoas}x</span>
                            <span className="text-lg font-bold mb-3 opacity-80">ROAS</span>
                        </div>
                        <p className="text-sm font-medium text-rose-100 px-4">
                            Masukkan angka ini di kolom "Target ROAS" saat pasang iklan.
                        </p>
                    </div>
                </div>

                {/* Break Even Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="p-3 bg-slate-100 rounded-full mb-3">
                            <Crosshair className="w-5 h-5 text-slate-500" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Titik Impas (BEP)</p>
                        <p className="text-xl font-black text-slate-700">{result.breakEvenRoas.toFixed(2)}x</p>
                        <p className="text-[9px] text-slate-400 leading-tight mt-1">Di bawah ini = Rugi</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="p-3 bg-slate-100 rounded-full mb-3">
                            <BarChart3 className="w-5 h-5 text-slate-500" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Mode Bidding</p>
                        <p className="text-base font-black text-indigo-600 mt-1 uppercase">{result.biddingStrategy}</p>
                    </div>
                </div>

                {/* AI Explanation & Keywords */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analisa AI</h4>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            {result.explanation}
                        </p>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Keyword / Audiens</h4>
                        <div className="flex flex-wrap gap-2">
                            {result.targetAudienceKeywords.map((kw, i) => (
                                <span key={i} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-emerald-800 uppercase">Rekomendasi Budget Harian</p>
                            <p className="text-[10px] text-emerald-600 font-medium">Fase testing 7 hari</p>
                        </div>
                        <div className="text-xl font-black text-emerald-700">
                            Rp {result.dailyBudgetRecommendation.toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RoasCalculator;
