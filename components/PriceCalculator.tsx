import React, { useState, useEffect } from 'react';
import { Marketplace, PricingResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Info, Tag, Users, Package, ChevronDown, DollarSign, Store } from 'lucide-react';

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
  
  const [adminFeePct, setAdminFeePct] = useState<string>(MARKETPLACE_FEES[Marketplace.SHOPEE].admin.toString());
  const [transFeePct, setTransFeePct] = useState<string>(MARKETPLACE_FEES[Marketplace.SHOPEE].transaction.toString());
  const [shipFeePct, setShipFeePct] = useState<string>(MARKETPLACE_FEES[Marketplace.SHOPEE].shipping.toString());

  const [affiliatePct, setAffiliatePct] = useState<string>('0');
  const [voucherVal, setVoucherVal] = useState<string>('0');
  const [voucherType, setVoucherType] = useState<'percent' | 'nominal'>('nominal');
  const [bundleVal, setBundleVal] = useState<string>('0');
  const [bundleType, setBundleType] = useState<'percent' | 'nominal'>('percent');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [result, setResult] = useState<PricingResult | null>(null);

  useEffect(() => {
    const defaults = MARKETPLACE_FEES[marketplace];
    setAdminFeePct(defaults.admin.toString());
    setTransFeePct(defaults.transaction.toString());
    setShipFeePct(defaults.shipping.toString());
  }, [marketplace]);

  const handleCalculate = () => {
    const modal = parseFloat(cogs) || 0;
    const profitTarget = parseFloat(desiredProfit) || 0;
    const disc = parseFloat(discountPercent) || 0;
    
    const adminPct = parseFloat(adminFeePct) / 100;
    const transPct = parseFloat(transFeePct) / 100;
    const shipPct = parseFloat(shipFeePct) / 100;
    const affPct = parseFloat(affiliatePct) / 100;
    
    const vVal = parseFloat(voucherVal) || 0;
    const bVal = parseFloat(bundleVal) || 0;

    if (modal === 0) return;

    let totalPctCosts = adminPct + transPct + shipPct + affPct;
    if (voucherType === 'percent') totalPctCosts += (vVal / 100);
    if (bundleType === 'percent') totalPctCosts += (bVal / 100);

    let totalNominalCosts = 0;
    if (voucherType === 'nominal') totalNominalCosts += vVal;
    if (bundleType === 'nominal') totalNominalCosts += bVal;

    if (totalPctCosts >= 0.95) return;

    const requiredRealPrice = (modal + profitTarget + totalNominalCosts) / (1 - totalPctCosts);
    const displayPrice = disc > 0 && disc < 100 
      ? requiredRealPrice / (1 - (disc / 100)) 
      : requiredRealPrice;

    const adminAmount = requiredRealPrice * adminPct;
    const transAmount = requiredRealPrice * transPct;
    const shipAmount = requiredRealPrice * shipPct;
    const affAmount = requiredRealPrice * affPct;
    const voucherAmount = voucherType === 'percent' ? requiredRealPrice * (vVal / 100) : vVal;
    const bundleAmount = bundleType === 'percent' ? requiredRealPrice * (bVal / 100) : bVal;

    setResult({
      sellingPrice: displayPrice,
      totalFees: adminAmount + transAmount + shipAmount + affAmount + voucherAmount + bundleAmount,
      netProfit: requiredRealPrice - (adminAmount + transAmount + shipAmount + affAmount + voucherAmount + bundleAmount) - modal,
      feeBreakdown: {
        admin: adminAmount,
        transaction: transAmount,
        shipping: shipAmount,
        marketing: displayPrice - requiredRealPrice,
        affiliate: affAmount,
        voucher: voucherAmount,
        bundle: bundleAmount
      }
    });
  };

  const chartData = result ? [
    { name: 'Modal', value: parseFloat(cogs), color: '#3b82f6' },
    { name: 'Profit', value: result.netProfit, color: '#10b981' },
    { name: 'Biaya', value: result.totalFees, color: '#f43f5e' },
  ] : [];

  const InputGroup = ({ label, children }: any) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{label}</label>
      {children}
    </div>
  );

  const StyledInput = (props: any) => (
    <div className="relative">
      {props.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{props.prefix}</span>}
      <input 
        {...props}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${props.prefix ? 'pl-9' : ''}`}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Result Card - Show First if Available */}
      {result && (
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 overflow-hidden relative animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <p className="text-indigo-100 text-sm font-medium mb-1">Harga Jual Rekomendasi</p>
            <div className="text-4xl font-extrabold tracking-tight mb-2">
              Rp {Math.ceil(result.sellingPrice).toLocaleString('id-ID')}
            </div>
            {parseFloat(discountPercent) > 0 && (
              <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs">
                <Tag className="w-3 h-3" />
                Termasuk Diskon {discountPercent}%
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                <span className="block text-green-600 text-xs font-bold uppercase mb-1">Cuan Bersih</span>
                <span className="block text-green-700 text-lg font-bold">Rp {Math.floor(result.netProfit).toLocaleString('id-ID')}</span>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                <span className="block text-red-500 text-xs font-bold uppercase mb-1">Total Biaya</span>
                <span className="block text-red-600 text-lg font-bold">Rp {Math.ceil(result.totalFees).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex h-32 items-center justify-center">
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
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="ml-4 space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Modal</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Profit</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Biaya</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <InputGroup label="Marketplace">
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />
            <select 
              value={marketplace} 
              onChange={(e) => setMarketplace(e.target.value as Marketplace)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none text-gray-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            >
              {Object.values(Marketplace).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </InputGroup>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Modal (HPP)">
            <StyledInput type="number" placeholder="50000" value={cogs} onChange={(e:any) => setCogs(e.target.value)} />
          </InputGroup>
          <InputGroup label="Target Cuan">
             <StyledInput type="number" placeholder="10000" value={desiredProfit} onChange={(e:any) => setDesiredProfit(e.target.value)} />
          </InputGroup>
        </div>
        
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-center text-xs font-medium text-indigo-600 py-2 mb-2 flex items-center justify-center gap-1 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          {showAdvanced ? "Sembunyikan Opsi Lanjutan" : "Tampilkan Biaya & Marketing"}
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div className="animate-fade-in space-y-4 mb-4 pt-2 border-t border-slate-100">
             {/* Admin Fees */}
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Potongan Admin (%)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                    <label className="text-[10px] text-gray-400 block mb-1">Admin</label>
                    <input type="number" value={adminFeePct} onChange={(e) => setAdminFeePct(e.target.value)} className="w-full text-center font-bold text-gray-700 outline-none text-sm" />
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                    <label className="text-[10px] text-gray-400 block mb-1">Trx</label>
                    <input type="number" value={transFeePct} onChange={(e) => setTransFeePct(e.target.value)} className="w-full text-center font-bold text-gray-700 outline-none text-sm" />
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                    <label className="text-[10px] text-gray-400 block mb-1">Xtra</label>
                    <input type="number" value={shipFeePct} onChange={(e) => setShipFeePct(e.target.value)} className="w-full text-center font-bold text-gray-700 outline-none text-sm" />
                  </div>
                </div>
             </div>

             {/* Marketing */}
             <div className="space-y-3">
               <InputGroup label="Diskon Tampilan (%)">
                  <StyledInput type="number" placeholder="50" value={discountPercent} onChange={(e:any) => setDiscountPercent(e.target.value)} />
               </InputGroup>
               
               <InputGroup label="Komisi Affiliator (%)">
                  <StyledInput type="number" placeholder="10" value={affiliatePct} onChange={(e:any) => setAffiliatePct(e.target.value)} />
               </InputGroup>
             </div>
          </div>
        )}

        <button 
          onClick={handleCalculate}
          className="w-full py-4 mt-2 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg shadow-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <DollarSign className="w-5 h-5 text-yellow-400" />
          Hitung Sekarang
        </button>
      </div>
    </div>
  );
};

export default PriceCalculator;