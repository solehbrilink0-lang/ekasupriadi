import React, { useState } from 'react';
import { RoasResult } from '../types';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

const RoasCalculator: React.FC = () => {
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [profitPerItem, setProfitPerItem] = useState<string>('');
  const [targetSales, setTargetSales] = useState<string>('100');
  const [maxCpa, setMaxCpa] = useState<string>(''); // Cost Per Acquisition (Biaya Iklan per produk)
  
  const [result, setResult] = useState<RoasResult | null>(null);

  const handleCalculate = () => {
    const price = parseFloat(sellingPrice) || 0;
    const profit = parseFloat(profitPerItem) || 0;
    const sales = parseFloat(targetSales) || 0;
    const cpa = parseFloat(maxCpa) || 0; // Max budget user willing to spend to sell 1 item

    if (price === 0 || sales === 0) return;

    // Logic
    const revenue = price * sales;
    const totalAdBudget = cpa * sales;
    const profitBeforeAds = profit * sales;
    
    // ROAS = Revenue / AdSpend
    const requiredRoas = totalAdBudget > 0 ? revenue / totalAdBudget : 0;
    
    // Net after ads
    const netProfitAfterAds = profitBeforeAds - totalAdBudget;

    setResult({
      revenue,
      totalAdBudget,
      requiredRoas,
      profitBeforeAds,
      netProfitAfterAds
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-pink-600" />
        Kalkulator ROAS & Budget Iklan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual Produk (Final)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">Rp</span>
              <input 
                type="number" 
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                placeholder="100000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profit Bersih per Produk (Sebelum Iklan)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">Rp</span>
              <input 
                type="number" 
                value={profitPerItem}
                onChange={(e) => setProfitPerItem(e.target.value)}
                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                placeholder="30000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Gunakan angka dari menu "Hitung Harga" sebelumnya.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maksimal Biaya Iklan per Produk (CPA)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">Rp</span>
              <input 
                type="number" 
                value={maxCpa}
                onChange={(e) => setMaxCpa(e.target.value)}
                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                placeholder="5000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Berapa rupiah Anda rela rugi profit demi 1 penjualan?</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Penjualan (Pcs)</label>
            <input 
              type="number" 
              value={targetSales}
              onChange={(e) => setTargetSales(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              placeholder="100"
            />
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Hitung Budget & ROAS
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col justify-center">
          {result ? (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Target ROAS Minimum</p>
                <div className="text-5xl font-extrabold text-pink-600 my-2">
                  {result.requiredRoas.toFixed(2)}x
                </div>
                <p className="text-sm text-gray-600">
                  Setting iklan Anda minimal harus mencapai angka ini agar budget terserap sesuai target.
                </p>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                   <span className="text-gray-600">Total Budget Iklan</span>
                   <span className="font-bold text-gray-900">Rp {result.totalAdBudget.toLocaleString('id-ID')}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                   <span className="text-gray-600">Estimasi Omzet</span>
                   <span className="font-bold text-indigo-600">Rp {result.revenue.toLocaleString('id-ID')}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-green-50 border border-green-100 rounded-lg shadow-sm">
                   <span className="text-green-800 font-medium">Sisa Profit Bersih</span>
                   <span className="font-bold text-green-700">Rp {result.netProfitAfterAds.toLocaleString('id-ID')}</span>
                 </div>
              </div>

              {result.netProfitAfterAds <= 0 && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>Hati-hati! Dengan biaya iklan (CPA) sebesar ini, profit Anda habis atau minus. Kurangi budget iklan atau naikkan harga.</p>
                </div>
              )}
            </div>
          ) : (
             <div className="text-center text-gray-400">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Masukkan data simulasi iklan Anda.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoasCalculator;