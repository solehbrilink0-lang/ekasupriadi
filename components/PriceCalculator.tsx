import React, { useState } from 'react';
import { Marketplace, PricingResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronDown, DollarSign, Store, Percent } from 'lucide-react';

const MARKETPLACE_FEES = {
  [Marketplace.SHOPEE]: { admin: 6.5, transaction: 4.0, shipping: 4.0 },
  [Marketplace.TIKTOK]: { admin: 4.0, transaction: 3.0, shipping: 3.0 },
  [Marketplace.LAZADA]: { admin: 3.5, transaction: 2.0, shipping: 2.5 },
  [Marketplace.TOKOPEDIA]: { admin: 5.5, transaction: 4.0, shipping: 3.5 },
  [Marketplace.OTHER]: { admin: 0, transaction: 0, shipping: 0 },
};

const PriceCalculator: React.FC = () => {
  const [marketplace, setMarketplace] = useState<Marketplace>(Marketplace.SHOPEE);
  const [cogs, setCogs] = useState<string>('');
  const [desiredProfit, setDesiredProfit] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<string>('0');
  const [result, setResult] = useState<PricingResult | null>(null);

  const handleCalculate = () => {
    const modal = parseFloat(cogs) || 0;
    const profitTarget = parseFloat(desiredProfit) || 0;
    const disc = parseFloat(discountPercent) || 0;
    const fees = MARKETPLACE_FEES[marketplace];
    
    const totalFeePct = (fees.admin + fees.transaction + fees.shipping) / 100;
    if (totalFeePct >= 0.9) return;

    const requiredRealPrice = (modal + profitTarget) / (1 - totalFeePct);
    const displayPrice = disc > 0 ? requiredRealPrice / (1 - (disc/100)) : requiredRealPrice;

    setResult({
      sellingPrice: displayPrice,
      totalFees: requiredRealPrice * totalFeePct,
      netProfit: profitTarget,
      feeBreakdown: {
        admin: requiredRealPrice * (fees.admin/100),
        transaction: requiredRealPrice * (fees.transaction/100),
        shipping: requiredRealPrice * (fees.shipping/100),
        marketing: displayPrice - requiredRealPrice,
        affiliate: 0, voucher: 0, bundle: 0
      }
    });
  };

  const chartData = result ? [
    { name: 'Modal', value: parseFloat(cogs), color: '#6366f1' },
    { name: 'Profit', value: result.netProfit, color: '#10b981' },
    { name: 'Biaya', value: result.totalFees, color: '#f43f5e' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100 border border-indigo-50 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white text-center">
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Harga Jual Disarankan</p>
            <h2 className="text-4xl font-extrabold mb-1">
              Rp {Math.ceil(result.sellingPrice).toLocaleString('id-ID')}
            </h2>
            {parseFloat(discountPercent) > 0 && (
              <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold">
                SUDAH TERMASUK DISKON {discountPercent}%
              </span>
            )}
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-50">
            <div className="text-center p-4 bg-emerald-50 rounded-2xl">
              <span className="block text-[10px] text-emerald-600 font-bold uppercase">Profit Bersih</span>
              <span className="text-lg font-bold text-emerald-700">Rp {Math.floor(result.netProfit).toLocaleString('id-ID')}</span>
            </div>
            <div className="text-center p-4 bg-rose-50 rounded-2xl">
              <span className="block text-[10px] text-rose-500 font-bold uppercase">Total Biaya</span>
              <span className="text-lg font-bold text-rose-600">Rp {Math.ceil(result.totalFees).toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="h-40 p-4">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                    {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-5">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marketplace</label>
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
            <select 
              value={marketplace} 
              onChange={(e) => setMarketplace(e.target.value as Marketplace)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-all"
            >
              {Object.values(Marketplace).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modal Produk</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Rp</span>
              <input type="number" value={cogs} onChange={(e) => setCogs(e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cuan Bersih</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Rp</span>
              <input type="number" value={desiredProfit} onChange={(e) => setDesiredProfit(e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tampilan Diskon (%)</label>
          <div className="relative">
            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <button 
          onClick={handleCalculate}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
        >
          <DollarSign className="w-5 h-5 text-yellow-400" />
          HITUNG CUAN
        </button>
      </div>
    </div>
  );
};

export default PriceCalculator;