import React, { useState, useEffect } from 'react';
import { Marketplace, PricingResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Calculator, Info, Tag, Users, Package } from 'lucide-react';

const MARKETPLACE_FEES = {
  [Marketplace.SHOPEE]: { admin: 6.5, transaction: 4.0, shipping: 4.0 }, // Approx Star+
  [Marketplace.TIKTOK]: { admin: 4.0, transaction: 3.0, shipping: 3.0 },
  [Marketplace.LAZADA]: { admin: 3.5, transaction: 2.0, shipping: 2.5 },
  [Marketplace.TOKOPEDIA]: { admin: 5.5, transaction: 4.0, shipping: 3.5 },
  [Marketplace.OTHER]: { admin: 0, transaction: 0, shipping: 0 },
};

const PriceCalculator: React.FC = () => {
  const [marketplace, setMarketplace] = useState<Marketplace>(Marketplace.SHOPEE);
  const [cogs, setCogs] = useState<string>(''); // Cost of Goods Sold (Modal)
  const [desiredProfit, setDesiredProfit] = useState<string>(''); // In IDR
  const [discountPercent, setDiscountPercent] = useState<string>('0');
  
  // Fee percentages (editable)
  const [adminFeePct, setAdminFeePct] = useState<string>(MARKETPLACE_FEES[Marketplace.SHOPEE].admin.toString());
  const [transFeePct, setTransFeePct] = useState<string>(MARKETPLACE_FEES[Marketplace.SHOPEE].transaction.toString());
  const [shipFeePct, setShipFeePct] = useState<string>(MARKETPLACE_FEES[Marketplace.SHOPEE].shipping.toString());

  // New Marketing Plans
  const [affiliatePct, setAffiliatePct] = useState<string>('0');
  
  const [voucherVal, setVoucherVal] = useState<string>('0');
  const [voucherType, setVoucherType] = useState<'percent' | 'nominal'>('nominal');
  
  const [bundleVal, setBundleVal] = useState<string>('0');
  const [bundleType, setBundleType] = useState<'percent' | 'nominal'>('percent');

  const [result, setResult] = useState<PricingResult | null>(null);

  useEffect(() => {
    // Reset defaults when marketplace changes
    const defaults = MARKETPLACE_FEES[marketplace];
    setAdminFeePct(defaults.admin.toString());
    setTransFeePct(defaults.transaction.toString());
    setShipFeePct(defaults.shipping.toString());
  }, [marketplace]);

  const handleCalculate = () => {
    const modal = parseFloat(cogs) || 0;
    const profitTarget = parseFloat(desiredProfit) || 0;
    const disc = parseFloat(discountPercent) || 0;
    
    // Fees
    const adminPct = parseFloat(adminFeePct) / 100;
    const transPct = parseFloat(transFeePct) / 100;
    const shipPct = parseFloat(shipFeePct) / 100;
    
    // Marketing
    const affPct = parseFloat(affiliatePct) / 100;
    
    const vVal = parseFloat(voucherVal) || 0;
    const bVal = parseFloat(bundleVal) || 0;

    if (modal === 0) return;

    // Calculation Logic
    // We want to find RealPrice (Selling Price after Core Discount)
    // Such that: RealPrice - AllCosts = Modal + TargetProfit
    
    // Percentage Costs based on RealPrice
    let totalPctCosts = adminPct + transPct + shipPct + affPct;
    
    // Add Voucher/Bundle to Pct Costs if they are percentages
    if (voucherType === 'percent') totalPctCosts += (vVal / 100);
    if (bundleType === 'percent') totalPctCosts += (bVal / 100);

    // Fixed Costs (Nominal)
    let totalNominalCosts = 0;
    if (voucherType === 'nominal') totalNominalCosts += vVal;
    if (bundleType === 'nominal') totalNominalCosts += bVal;

    // Safety check
    if (totalPctCosts >= 0.95) {
      alert("Total potongan (Fee + Marketing) terlalu besar (> 95%). Tidak mungkin profit!");
      return;
    }

    // Formula: RealPrice * (1 - TotalPctCosts) - TotalNominalCosts = Modal + Profit
    // RealPrice * (1 - TotalPctCosts) = Modal + Profit + TotalNominalCosts
    const requiredRealPrice = (modal + profitTarget + totalNominalCosts) / (1 - totalPctCosts);
    
    // Display Price (Harga Coret Awal)
    const displayPrice = disc > 0 && disc < 100 
      ? requiredRealPrice / (1 - (disc / 100)) 
      : requiredRealPrice;

    // Breakdown Values
    const adminAmount = requiredRealPrice * adminPct;
    const transAmount = requiredRealPrice * transPct;
    const shipAmount = requiredRealPrice * shipPct;
    const affAmount = requiredRealPrice * affPct;
    
    const voucherAmount = voucherType === 'percent' ? requiredRealPrice * (vVal / 100) : vVal;
    const bundleAmount = bundleType === 'percent' ? requiredRealPrice * (bVal / 100) : bVal;

    const totalMpFees = adminAmount + transAmount + shipAmount;
    const totalMarketingCosts = affAmount + voucherAmount + bundleAmount;

    setResult({
      sellingPrice: displayPrice,
      totalFees: totalMpFees + totalMarketingCosts, // Total deductions from Revenue
      netProfit: requiredRealPrice - (totalMpFees + totalMarketingCosts) - modal, // Should match profitTarget
      feeBreakdown: {
        admin: adminAmount,
        transaction: transAmount,
        shipping: shipAmount,
        marketing: displayPrice - requiredRealPrice, // This is the "Diskon Toko" gap
        affiliate: affAmount,
        voucher: voucherAmount,
        bundle: bundleAmount
      }
    });
  };

  const chartData = result ? [
    { name: 'Modal', value: parseFloat(cogs), color: '#3b82f6' }, // Blue
    { name: 'Profit', value: result.netProfit, color: '#22c55e' }, // Green
    { name: 'Biaya MP', value: (result.feeBreakdown.admin + result.feeBreakdown.transaction + result.feeBreakdown.shipping), color: '#ef4444' }, // Red
    { name: 'Marketing', value: (result.feeBreakdown.affiliate + result.feeBreakdown.voucher + result.feeBreakdown.bundle), color: '#f97316' }, // Orange
  ] : [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-indigo-600" />
          Kalkulator Harga & Marketing Plan
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">1. Modal & Profit</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Marketplace</label>
                <select 
                  value={marketplace} 
                  onChange={(e) => setMarketplace(e.target.value as Marketplace)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.values(Marketplace).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modal (HPP)</label>
                  <input 
                    type="number" 
                    value={cogs}
                    onChange={(e) => setCogs(e.target.value)}
                    placeholder="50000"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Profit</label>
                  <input 
                    type="number" 
                    value={desiredProfit}
                    onChange={(e) => setDesiredProfit(e.target.value)}
                    placeholder="15000"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Marketplace Fees */}
            <div className="space-y-4 p-4 bg-red-50/30 rounded-xl border border-red-100">
               <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide flex items-center gap-2">
                 <Info className="w-4 h-4" /> 2. Potongan Wajib (%)
               </h3>
               <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Admin Fee</label>
                  <input type="number" value={adminFeePct} onChange={(e) => setAdminFeePct(e.target.value)} className="w-full p-2 bg-white border rounded text-sm"/>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Layanan/Xtra</label>
                  <input type="number" value={shipFeePct} onChange={(e) => setShipFeePct(e.target.value)} className="w-full p-2 bg-white border rounded text-sm"/>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Transaksi</label>
                  <input type="number" value={transFeePct} onChange={(e) => setTransFeePct(e.target.value)} className="w-full p-2 bg-white border rounded text-sm"/>
                </div>
              </div>
            </div>

            {/* Marketing Plan */}
            <div className="space-y-4 p-4 bg-orange-50/30 rounded-xl border border-orange-100">
              <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-2">
                 <Tag className="w-4 h-4" /> 3. Marketing & Promosi (Opsional)
              </h3>
              
              {/* Affiliate */}
              <div className="flex items-center gap-4">
                <div className="w-1/3">
                   <label className="text-xs text-gray-600 block mb-1 flex items-center gap-1">
                     <Users className="w-3 h-3" /> Affiliator (%)
                   </label>
                   <input type="number" value={affiliatePct} onChange={(e) => setAffiliatePct(e.target.value)} className="w-full p-2 bg-white border rounded text-sm"/>
                </div>
                <p className="text-xs text-gray-400 mt-4">Komisi untuk affiliator (TikTok/Shopee Video)</p>
              </div>

              {/* Voucher */}
              <div>
                 <label className="text-xs text-gray-600 block mb-1 flex items-center gap-1">
                   <Tag className="w-3 h-3" /> Budget Voucher Toko
                 </label>
                 <div className="flex gap-2">
                   <input 
                      type="number" 
                      value={voucherVal} 
                      onChange={(e) => setVoucherVal(e.target.value)} 
                      className="flex-1 p-2 bg-white border rounded text-sm"
                      placeholder="Contoh: 5000"
                   />
                   <select 
                      value={voucherType} 
                      onChange={(e) => setVoucherType(e.target.value as any)}
                      className="w-24 p-2 bg-white border rounded text-sm"
                   >
                     <option value="nominal">Rp</option>
                     <option value="percent">%</option>
                   </select>
                 </div>
              </div>

               {/* Bundle */}
               <div>
                 <label className="text-xs text-gray-600 block mb-1 flex items-center gap-1">
                   <Package className="w-3 h-3" /> Budget Bundle / Kombo
                 </label>
                 <div className="flex gap-2">
                   <input 
                      type="number" 
                      value={bundleVal} 
                      onChange={(e) => setBundleVal(e.target.value)} 
                      className="flex-1 p-2 bg-white border rounded text-sm"
                      placeholder="Contoh: 3"
                   />
                   <select 
                      value={bundleType} 
                      onChange={(e) => setBundleType(e.target.value as any)}
                      className="w-24 p-2 bg-white border rounded text-sm"
                   >
                     <option value="percent">%</option>
                     <option value="nominal">Rp</option>
                   </select>
                 </div>
                 <p className="text-xs text-gray-400 mt-1">Estimasi diskon tambahan jika beli banyak.</p>
              </div>
            </div>

            {/* Store Front Discount */}
             <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
                <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-2">4. Diskon Tampilan</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rencana Diskon Coret (%)</label>
                  <input 
                    type="number" 
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="50"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Hanya untuk tampilan (Gimmick), tidak mengurangi profit.</p>
                </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              Hitung Harga Rekomendasi
            </button>
          </div>

          {/* Results */}
          <div className="flex flex-col">
            {result ? (
              <div className="bg-white p-6 rounded-xl border border-gray-200 h-full flex flex-col shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Harga Jual (Sebelum Diskon)</h3>
                  <div className="text-4xl font-extrabold text-indigo-600">
                    Rp {Math.ceil(result.sellingPrice).toLocaleString('id-ID')}
                  </div>
                  {parseFloat(discountPercent) > 0 && (
                     <div className="mt-2 text-sm bg-indigo-50 inline-block px-3 py-1 rounded-full text-indigo-700 font-medium">
                       Harga Tayang setelah Diskon {discountPercent}%: Rp {Math.ceil(result.sellingPrice * (1 - parseFloat(discountPercent)/100)).toLocaleString('id-ID')}
                     </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <span className="block text-gray-500 text-xs">Profit Bersih</span>
                        <span className="block font-bold text-green-600 text-lg">Rp {Math.floor(result.netProfit).toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500 text-xs">Total Biaya & Marketing</span>
                        <span className="block font-bold text-red-500 text-lg">Rp {Math.ceil(result.totalFees).toLocaleString('id-ID')}</span>
                    </div>
                </div>
                
                <div className="h-64 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `Rp ${Math.ceil(value).toLocaleString('id-ID')}`} />
                      <Legend verticalAlign="bottom"/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 text-xs border-t pt-4 border-gray-200">
                   <p className="font-semibold text-gray-700 mb-2">Rincian Potongan (Per Pcs):</p>
                   <div className="flex justify-between"><span>Admin & Layanan Marketplace</span> <span>Rp {(result.feeBreakdown.admin + result.feeBreakdown.transaction + result.feeBreakdown.shipping).toLocaleString('id-ID')}</span></div>
                   <div className="flex justify-between text-orange-600"><span>Komisi Affiliator</span> <span>Rp {result.feeBreakdown.affiliate.toLocaleString('id-ID')}</span></div>
                   <div className="flex justify-between text-orange-600"><span>Budget Voucher</span> <span>Rp {result.feeBreakdown.voucher.toLocaleString('id-ID')}</span></div>
                   <div className="flex justify-between text-orange-600"><span>Budget Bundle</span> <span>Rp {result.feeBreakdown.bundle.toLocaleString('id-ID')}</span></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                <Calculator className="w-12 h-12 mb-2 opacity-50" />
                <p>Lengkapi data di kiri untuk kalkulasi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;