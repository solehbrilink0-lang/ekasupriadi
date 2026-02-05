import React, { useState, useEffect } from 'react';
import { Marketplace, PricingResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronDown, DollarSign, Store, Percent, Box, Gift, Ticket, Share2, Package, Info } from 'lucide-react';

const MARKETPLACE_FEES = {
  [Marketplace.SHOPEE]: { admin: 6.5, transaction: 4.0, shipping: 4.0 }, // Approx 14.5% total
  [Marketplace.TIKTOK]: { admin: 4.0, transaction: 3.0, shipping: 3.0 },
  [Marketplace.LAZADA]: { admin: 3.5, transaction: 2.0, shipping: 2.5 },
  [Marketplace.TOKOPEDIA]: { admin: 5.5, transaction: 4.0, shipping: 3.5 },
  [Marketplace.OTHER]: { admin: 0, transaction: 0, shipping: 0 },
};

type InputType = 'PERCENT' | 'NOMINAL';

const PriceCalculator: React.FC = () => {
  // --- STATE ---
  const [marketplace, setMarketplace] = useState<Marketplace>(Marketplace.SHOPEE);
  
  // 1. Dasar
  const [cogs, setCogs] = useState<string>(''); // Modal
  const [desiredProfit, setDesiredProfit] = useState<string>(''); // Profit Bersih
  
  // 2. Operasional
  const [packingCost, setPackingCost] = useState<string>('');
  const [otherCost, setOtherCost] = useState<string>('');

  // 3. Marketing & Promo
  const [affiliatePercent, setAffiliatePercent] = useState<string>('');
  const [displayDiscount, setDisplayDiscount] = useState<string>(''); // Harga Coret %
  
  // Voucher Toko
  const [voucherType, setVoucherType] = useState<InputType>('NOMINAL');
  const [voucherValue, setVoucherValue] = useState<string>('');

  // Bundle / Flexi Combo
  const [bundleType, setBundleType] = useState<InputType>('NOMINAL');
  const [bundleValue, setBundleValue] = useState<string>('');

  const [result, setResult] = useState<PricingResult | null>(null);

  // --- LOGIC ---
  const handleCalculate = () => {
    // Parse Inputs
    const valCogs = parseFloat(cogs) || 0;
    const valProfit = parseFloat(desiredProfit) || 0;
    const valPacking = parseFloat(packingCost) || 0;
    const valOther = parseFloat(otherCost) || 0;
    
    // Percentages (0-100)
    const fees = MARKETPLACE_FEES[marketplace];
    const feeAdmin = fees.admin;
    const feeTrans = fees.transaction;
    const feeShip = fees.shipping;
    const valAffiliate = parseFloat(affiliatePercent) || 0;
    const valDisplayDisc = parseFloat(displayDiscount) || 0;

    // Voucher & Bundle logic
    const valVoucher = parseFloat(voucherValue) || 0;
    const valBundle = parseFloat(bundleValue) || 0;

    // --- FORMULA REVERSE CALCULATION ---
    // Target: We want NetProfit AFTER all deductions.
    // Price = Selling Price (Paid by buyer)
    // Expenses = Cogs + Packing + Other
    // Deductions from Price = Admin% + Trans% + Ship% + Affiliate%
    // Promo Deductions = Voucher + Bundle (can be % or Fixed)
    
    // Equation:
    // Price - (Price * TotalFee%) - (VoucherCost) - (BundleCost) - Expenses = Profit
    
    // Grouping Percentage Deductions (based on Selling Price)
    let totalPercentDeduction = feeAdmin + feeTrans + feeShip + valAffiliate;
    if (voucherType === 'PERCENT') totalPercentDeduction += valVoucher;
    if (bundleType === 'PERCENT') totalPercentDeduction += valBundle;
    
    // Grouping Nominal Deductions
    let totalNominalDeduction = valCogs + valPacking + valOther + valProfit;
    if (voucherType === 'NOMINAL') totalNominalDeduction += valVoucher;
    if (bundleType === 'NOMINAL') totalNominalDeduction += valBundle;

    // Safety check
    if (totalPercentDeduction >= 95) {
      alert("Total potongan persentase terlalu besar (di atas 95%). Cek kembali input Anda.");
      return;
    }

    // Calculate Selling Price (Harga Jual Tayang yang dibayar user)
    // Price * (1 - TotalPercent/100) = TotalNominal
    // Price = TotalNominal / (1 - TotalPercent/100)
    const sellingPrice = totalNominalDeduction / (1 - (totalPercentDeduction / 100));

    // Calculate Display Price (Harga Coret)
    // DisplayPrice * (1 - Disc%) = SellingPrice
    // DisplayPrice = SellingPrice / (1 - Disc%)
    const displayPrice = valDisplayDisc > 0 
      ? sellingPrice / (1 - (valDisplayDisc / 100)) 
      : sellingPrice;

    // Calculate Breakdown Values
    const getVal = (pct: number) => sellingPrice * (pct / 100);
    
    const moneyAdmin = getVal(feeAdmin + feeTrans + feeShip);
    const moneyAffiliate = getVal(valAffiliate);
    
    let moneyMarketing = 0;
    moneyMarketing += voucherType === 'PERCENT' ? getVal(valVoucher) : valVoucher;
    moneyMarketing += bundleType === 'PERCENT' ? getVal(valBundle) : valBundle;

    setResult({
      sellingPrice,
      displayPrice,
      netProfit: valProfit,
      totalFees: moneyAdmin + moneyAffiliate + moneyMarketing,
      breakdown: {
        admin: getVal(feeAdmin),
        transaction: getVal(feeTrans),
        shipping: getVal(feeShip),
        affiliate: moneyAffiliate,
        marketing: moneyMarketing,
        operational: valPacking + valOther,
        cogs: valCogs
      }
    });
  };

  const chartData = result ? [
    { name: 'Modal', value: result.breakdown.cogs, color: '#64748b' }, // Slate
    { name: 'Profit', value: result.netProfit, color: '#10b981' }, // Emerald
    { name: 'MP Fees', value: result.breakdown.admin + result.breakdown.transaction + result.breakdown.shipping, color: '#f43f5e' }, // Rose
    { name: 'Marketing', value: result.breakdown.affiliate + result.breakdown.marketing, color: '#f59e0b' }, // Amber
    { name: 'Ops', value: result.breakdown.operational, color: '#6366f1' }, // Indigo
  ] : [];

  const currentFees = MARKETPLACE_FEES[marketplace];
  const totalFeePercent = currentFees.admin + currentFees.transaction + currentFees.shipping;

  // --- UI COMPONENTS ---
  const InputToggle = ({ label, icon: Icon, value, setValue, type, setType, placeholder }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
        <div className="pl-3 py-3 flex items-center justify-center text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
        <input 
          type="number" 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 px-2 py-3 outline-none" 
        />
        <div className="flex border-l border-slate-200">
          <button 
            onClick={() => setType('PERCENT')}
            className={`px-3 text-xs font-bold transition-colors ${type === 'PERCENT' ? 'bg-indigo-100 text-indigo-700' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
          >
            %
          </button>
          <button 
            onClick={() => setType('NOMINAL')}
            className={`px-3 text-xs font-bold transition-colors ${type === 'NOMINAL' ? 'bg-indigo-100 text-indigo-700' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Rp
          </button>
        </div>
      </div>
    </div>
  );

  const SimpleInput = ({ label, icon: Icon, value, setValue, prefix = "Rp", placeholder }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {Icon ? <Icon className="w-4 h-4" /> : <span className="text-[10px] font-bold">{prefix}</span>}
        </div>
        <input 
          type="number" 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          placeholder={placeholder} 
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. SECTION: RESULT (Sticky Top-ish feel or Prominent) */}
      {result && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-indigo-50 overflow-hidden relative animate-fade-up">
           <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
           
           <div className="p-8 pb-6 text-center">
             <div className="inline-flex flex-col items-center">
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Harga Jual Final</span>
               <div className="text-5xl font-black text-slate-800 tracking-tight">
                 <span className="text-2xl text-slate-400 font-bold mr-1">Rp</span>
                 {Math.ceil(result.sellingPrice).toLocaleString('id-ID')}
               </div>
               
               {result.displayPrice > result.sellingPrice && (
                 <div className="mt-2 inline-block px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-bold line-through decoration-2">
                   Rp {Math.ceil(result.displayPrice).toLocaleString('id-ID')}
                 </div>
               )}
             </div>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-3 gap-2 px-6 pb-6">
             <div className="bg-emerald-50 p-3 rounded-2xl text-center">
                <span className="block text-[10px] text-emerald-600 font-bold uppercase mb-1">Profit</span>
                <span className="text-sm font-bold text-emerald-700">Rp {Math.floor(result.netProfit).toLocaleString('id-ID')}</span>
             </div>
             <div className="bg-indigo-50 p-3 rounded-2xl text-center">
                <span className="block text-[10px] text-indigo-600 font-bold uppercase mb-1">Modal+Ops</span>
                <span className="text-sm font-bold text-indigo-700">Rp {(result.breakdown.cogs + result.breakdown.operational).toLocaleString('id-ID')}</span>
             </div>
             <div className="bg-rose-50 p-3 rounded-2xl text-center">
                <span className="block text-[10px] text-rose-500 font-bold uppercase mb-1">Total Potongan</span>
                <span className="text-sm font-bold text-rose-600">Rp {Math.ceil(result.totalFees + result.breakdown.admin + result.breakdown.transaction + result.breakdown.shipping).toLocaleString('id-ID')}</span>
             </div>
           </div>

           {/* Breakdown Details */}
           <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
             <h4 className="text-xs font-bold text-slate-500 mb-3">Rincian Potongan Marketplace</h4>
             <div className="space-y-2 text-xs text-slate-600">
               <div className="flex justify-between">
                 <span>Admin & Layanan ({MARKETPLACE_FEES[marketplace].admin + MARKETPLACE_FEES[marketplace].transaction + MARKETPLACE_FEES[marketplace].shipping}%)</span>
                 <span className="font-semibold text-rose-500">- Rp {Math.ceil(result.breakdown.admin + result.breakdown.transaction + result.breakdown.shipping).toLocaleString('id-ID')}</span>
               </div>
               {result.breakdown.affiliate > 0 && (
                 <div className="flex justify-between">
                   <span>Komisi Afiliasi</span>
                   <span className="font-semibold text-orange-500">- Rp {Math.ceil(result.breakdown.affiliate).toLocaleString('id-ID')}</span>
                 </div>
               )}
               {(result.breakdown.marketing > 0) && (
                 <div className="flex justify-between">
                   <span>Voucher & Bundle</span>
                   <span className="font-semibold text-orange-500">- Rp {Math.ceil(result.breakdown.marketing).toLocaleString('id-ID')}</span>
                 </div>
               )}
             </div>
           </div>
        </div>
      )}

      {/* 2. SECTION: INPUTS */}
      <div className="space-y-6">
        
        {/* Marketplace Selector */}
        <div>
          <div className="bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                <Store className="w-5 h-5" />
              </div>
              <select 
                value={marketplace} 
                onChange={(e) => setMarketplace(e.target.value as Marketplace)}
                className="flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none px-3 appearance-none cursor-pointer"
              >
                {Object.values(Marketplace).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="w-5 h-5 text-slate-300 mr-3 pointer-events-none" />
          </div>
          
          {/* Fee Information Display */}
          <div className="grid grid-cols-4 gap-2 mt-3 px-1">
            <div className="bg-slate-100 p-2 rounded-xl text-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Admin</div>
              <div className="text-xs font-bold text-slate-700">{currentFees.admin}%</div>
            </div>
            <div className="bg-slate-100 p-2 rounded-xl text-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Trans</div>
              <div className="text-xs font-bold text-slate-700">{currentFees.transaction}%</div>
            </div>
            <div className="bg-slate-100 p-2 rounded-xl text-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Layanan</div>
              <div className="text-xs font-bold text-slate-700">{currentFees.shipping}%</div>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-2 rounded-xl text-center">
              <div className="text-[9px] font-bold text-rose-400 uppercase tracking-tighter">Total</div>
              <div className="text-xs font-bold text-rose-600">{totalFeePercent}%</div>
            </div>
          </div>
        </div>

        {/* Group A: Biaya Dasar */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <Box className="w-4 h-4 text-indigo-500" />
            Biaya Dasar & Profit
          </h3>
          <div className="grid grid-cols-2 gap-4">
             <SimpleInput label="Modal Produk (HPP)" value={cogs} setValue={setCogs} placeholder="50000" />
             <SimpleInput label="Target Profit Bersih" value={desiredProfit} setValue={setDesiredProfit} placeholder="20000" />
          </div>
        </div>

        {/* Group B: Biaya Operasional */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
          <h3 className="text-sm font-bold text-violet-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-violet-500" />
            Biaya Operasional (Opsional)
          </h3>
          <div className="grid grid-cols-2 gap-4">
             <SimpleInput label="Biaya Packing" value={packingCost} setValue={setPackingCost} placeholder="2000" />
             <SimpleInput label="Biaya Lainnya" value={otherCost} setValue={setOtherCost} placeholder="1000" />
          </div>
        </div>

        {/* Group C: Marketing & Promo */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
          <h3 className="text-sm font-bold text-pink-900 mb-4 flex items-center gap-2">
            <Gift className="w-4 h-4 text-pink-500" />
            Marketing & Promo (Opsional)
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <SimpleInput 
                label="Komisi Affiliate (%)" 
                icon={Share2} 
                value={affiliatePercent} 
                setValue={setAffiliatePercent} 
                placeholder="5" 
              />
               <SimpleInput 
                label="Tampilan Diskon (%)" 
                icon={Percent} 
                value={displayDiscount} 
                setValue={setDisplayDiscount} 
                placeholder="50" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputToggle 
                label="Voucher Toko" 
                icon={Ticket} 
                value={voucherValue} 
                setValue={setVoucherValue} 
                type={voucherType} 
                setType={setVoucherType} 
                placeholder="Contoh: 5000"
              />
              <InputToggle 
                label="Promo Bundle" 
                icon={Gift} 
                value={bundleValue} 
                setValue={setBundleValue} 
                type={bundleType} 
                setType={setBundleType} 
                placeholder="Contoh: 2"
              />
            </div>
            <p className="text-[10px] text-slate-400 italic mt-2">
              *Masukkan angka 0 jika tidak ada strategi promo.
            </p>
          </div>
        </div>

        <button 
          onClick={handleCalculate}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <DollarSign className="w-5 h-5 text-yellow-400" />
          HITUNG HARGA JUAL
        </button>

      </div>
    </div>
  );
};

export default PriceCalculator;