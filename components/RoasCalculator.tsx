import React, { useState } from 'react';
import { RoasResult } from '../types';
import { Target, AlertTriangle, TrendingUp } from 'lucide-react';

const RoasCalculator: React.FC = () => {
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [profitPerItem, setProfitPerItem] = useState<string>('');
  const [targetSales, setTargetSales] = useState<string>('100');
  const [maxCpa, setMaxCpa] = useState<string>('');
  
  const [result, setResult] = useState<RoasResult | null>(null);

  const handleCalculate = () => {
    const price = parseFloat(sellingPrice) || 0;
    const profit = parseFloat(profitPerItem) || 0;
    const sales = parseFloat(targetSales) || 0;
    const cpa = parseFloat(maxCpa) || 0;

    if (price === 0 || sales === 0) return;

    const revenue = price * sales;
    const totalAdBudget = cpa * sales;
    const profitBeforeAds = profit * sales;
    const requiredRoas = totalAdBudget > 0 ? revenue / totalAdBudget : 0;
    const netProfitAfterAds = profitBeforeAds - totalAdBudget;

    setResult({
      revenue,
      totalAdBudget,
      requiredRoas,
      profitBeforeAds,
      netProfitAfterAds
    });
  };

  const StyledInput = (props: any) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{props.label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
        <input 
          type="number"
          {...props}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {result && (
         <div className="bg-white rounded-3xl shadow-xl shadow-pink-100 border border-pink-50 overflow-hidden animate-fade-in">
           <div className="p-6 text-center border-b border-gray-100">
             <p className="text-gray-400 text-xs font-bold uppercase mb-2">Minimal ROAS Setting</p>
             <div className="text-5xl font-extrabold text-pink-600 tracking-tighter">
               {result.requiredRoas.toFixed(1)}x
             </div>
             <p className="text-xs text-gray-500 mt-2">Iklan harus balik modal minimal {result.requiredRoas.toFixed(1)} kali lipat.</p>
           </div>
           
           <div className="p-6 bg-gray-50/50 space-y-3">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                <span className="text-sm text-gray-600">Budget Iklan</span>
                <span className="font-bold text-gray-800">Rp {result.totalAdBudget.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                <span className="text-sm text-gray-600">Omzet</span>
                <span className="font-bold text-indigo-600">Rp {result.revenue.toLocaleString('id-ID')}</span>
              </div>
              
              <div className={`flex justify-between items-center p-3 rounded-xl border ${result.netProfitAfterAds > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <span className={`text-sm font-medium ${result.netProfitAfterAds > 0 ? 'text-green-700' : 'text-red-700'}`}>Sisa Profit</span>
                <span className={`font-bold ${result.netProfitAfterAds > 0 ? 'text-green-700' : 'text-red-700'}`}>Rp {result.netProfitAfterAds.toLocaleString('id-ID')}</span>
              </div>
           </div>
         </div>
      )}

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <StyledInput label="Harga Jual Final" value={sellingPrice} onChange={(e:any) => setSellingPrice(e.target.value)} placeholder="100000" />
        <StyledInput label="Profit/Pcs (Sebelum Iklan)" value={profitPerItem} onChange={(e:any) => setProfitPerItem(e.target.value)} placeholder="30000" />
        <StyledInput label="Max Budget Iklan/Pcs (CPA)" value={maxCpa} onChange={(e:any) => setMaxCpa(e.target.value)} placeholder="5000" />
        
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Target Penjualan (Pcs)</label>
          <input 
            type="number"
            value={targetSales}
            onChange={(e) => setTargetSales(e.target.value)}
            placeholder="100"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
          />
        </div>

        <button 
          onClick={handleCalculate}
          className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Target className="w-5 h-5" />
          Hitung Target ROAS
        </button>
      </div>
    </div>
  );
};

export default RoasCalculator;