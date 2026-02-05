import React, { useState } from 'react';
import { Marketplace, PricingResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign, Store, Percent, AlertCircle } from 'lucide-react';

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

    // Formula: Price = (Modal + Profit) / (1 - Fee%)
    const requiredRealPrice = (modal + profitTarget) / (1 - totalFeePct);
    
    // If user wants to display a discount, we bump up the price
    // DisplayPrice * (1 - disc%) = RealPrice
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
    { name: 'Modal Produk', value: parseFloat(cogs), color: '#6366f1' }, // Indigo
    { name: 'Profit Bersih', value: result.netProfit, color: '#10b981' }, // Emerald
    { name: 'Biaya Admin', value: result.totalFees, color: '#f43f5e' }, // Rose
  ] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Store className="w-4 h-4" /> Pilih Marketplace
          </label>
          <select 
            value={marketplace} 
            onChange={(e) => setMarketplace(e.target.value as Marketplace)}
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            {Object.values(Marketplace).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Modal Produk (HPP)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-bold">Rp</span>
              <input 
                type="number" 
                value={cogs} 
                onChange={(e) => setCogs(e.target.value)} 
                placeholder="0" 
                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Target Profit Bersih</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-bold">Rp</span>
              <input 
                type="number" 
                value={desiredProfit} 
                onChange={(e) => setDesiredProfit(e.target.value)} 
                placeholder="0" 
                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Percent className="w-4 h-4" /> Rencana Diskon (Opsional)
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={discountPercent} 
              onChange={(e) => setDiscountPercent(e.target.value)} 
              placeholder="0" 
              className="w-24 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
            />
            <span className="text-sm text-gray-500">% (Akan ditampilkan coret)</span>
          </div>
        </div>

        <button 
          onClick={handleCalculate}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold shadow-md active:transform active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Hitung Harga Jual
        </button>
      </div>

      {/* Result Section */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col justify-center">
        {result ? (
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Harga Jual Disarankan</p>
              <h2 className="text-4xl font-extrabold text-indigo-700 my-2">
                Rp {Math.ceil(result.sellingPrice).toLocaleString('id-ID')}
              </h2>
              {parseFloat(discountPercent) > 0 && (
                <div className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                  Diskon {discountPercent}% diterapkan
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
                <span className="block text-xs text-gray-500 mb-1">Profit Bersih</span>
                <span className="block text-lg font-bold text-green-600">
                  Rp {Math.floor(result.netProfit).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
                <span className="block text-xs text-gray-500 mb-1">Total Biaya Admin</span>
                <span className="block text-lg font-bold text-red-500">
                  Rp {Math.ceil(result.totalFees).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={chartData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={40} 
                    outerRadius={60} 
                    paddingAngle={5} 
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
            <AlertCircle className="w-12 h-12 opacity-30" />
            <p className="text-center text-sm">Masukkan modal dan target profit untuk melihat simulasi harga.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceCalculator;