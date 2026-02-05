import React, { useState, useEffect } from 'react';
import { Marketplace, PricingResult } from '../types';
import { ChevronDown, DollarSign, Store, Percent, Box, Gift, Ticket, Share2, Package, CheckCircle2, Zap, Truck } from 'lucide-react';

// --- CONFIGURATION ---
// Data estimasi fee berdasarkan kebijakan terbaru (Safe Estimates agar tidak rugi)
const MARKETPLACE_CONFIG = {
  [Marketplace.SHOPEE]: {
    transactionFee: 4.0, // Biaya Transaksi/Layanan
    tiers: [
      { id: 'NON_STAR', label: 'Non-Star (Regular)', admin: 4.0 }, 
      { id: 'STAR', label: 'Star / Star+', admin: 6.5 }, 
      { id: 'MALL', label: 'Shopee Mall', admin: 8.5 } 
    ],
    programs: {
      freeShipping: { label: 'Gratis Ongkir Xtra', value: 5.6 }, // Max 10rb biasanya, tapi kita ambil % aman
      cashback: { label: 'Cashback Xtra', value: 1.4 }
    }
  },
  [Marketplace.TOKOPEDIA]: {
    transactionFee: 0, // Tokped biasanya include di admin atau biaya layanan Rp1.000 (flat) ke buyer, kita simpan 0 atau kecil
    tiers: [
      { id: 'REGULAR', label: 'Regular Merchant', admin: 3.8 },
      { id: 'POWER', label: 'Power Merchant', admin: 4.5 },
      { id: 'PRO', label: 'Power Merchant Pro', admin: 5.5 },
      { id: 'OFFICIAL', label: 'Official Store', admin: 6.5 }
    ],
    programs: {
      freeShipping: { label: 'Bebas Ongkir (Wajib PM)', value: 4.0 },
      cashback: { label: 'Diskon/Cashback Xtra', value: 0 } // Tokped lebih sering main voucher toko manual
    }
  },
  [Marketplace.TIKTOK]: {
    transactionFee: 3.0, // Payment Fee
    tiers: [
      { id: 'REGULAR', label: 'Regular Seller', admin: 4.5 }, 
      { id: 'OFFICIAL', label: 'Official / Mall', admin: 6.0 }
    ],
    programs: {
      freeShipping: { label: 'Xtra Shipping (FSP)', value: 4.0 },
      cashback: { label: 'Mall/Campaign Fee', value: 0 } 
    }
  },
  [Marketplace.LAZADA]: {
    transactionFee: 2.0, // Payment Fee
    tiers: [
      { id: 'REGULAR', label: 'Regular Seller', admin: 3.5 },
      { id: 'SUPER', label: 'Super Seller', admin: 4.5 },
      { id: 'MALL', label: 'LazMall', admin: 6.0 }
    ],
    programs: {
      freeShipping: { label: 'Free Shipping Max', value: 5.0 },
      cashback: { label: 'Cashback Everyday', value: 3.0 }
    }
  },
  [Marketplace.OTHER]: {
    transactionFee: 0,
    tiers: [{ id: 'DEFAULT', label: 'Default', admin: 0 }],
    programs: {
      freeShipping: { label: 'Program Ongkir', value: 0 },
      cashback: { label: 'Program Cashback', value: 0 }
    }
  }
};

type InputType = 'PERCENT' | 'NOMINAL';

// --- UI COMPONENTS (Outside) ---
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

const ProgramToggle = ({ label, percent, active, onToggle, icon: Icon }: any) => (
  <button 
    onClick={onToggle}
    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
      active 
        ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
        : 'bg-white border-slate-100 opacity-80 hover:opacity-100'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-left">
        <div className={`text-xs font-bold ${active ? 'text-indigo-900' : 'text-slate-500'}`}>{label}</div>
        <div className={`text-[10px] ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
          Biaya: {percent}%
        </div>
      </div>
    </div>
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${active ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
      {active && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
    </div>
  </button>
);

const PriceCalculator: React.FC = () => {
  // --- STATE ---
  const [marketplace, setMarketplace] = useState<Marketplace>(Marketplace.SHOPEE);
  
  // New States for Advanced Fees
  const [sellerTierId, setSellerTierId] = useState<string>(''); // Holds ID of tier
  const [useFreeShipping, setUseFreeShipping] = useState<boolean>(false);
  const [useCashback, setUseCashback] = useState<boolean>(false);

  // 1. Dasar
  const [cogs, setCogs] = useState<string>('');
  const [desiredProfit, setDesiredProfit] = useState<string>('');
  
  // 2. Operasional
  const [packingCost, setPackingCost] = useState<string>('');
  const [otherCost, setOtherCost] = useState<string>('');

  // 3. Marketing & Promo
  const [affiliatePercent, setAffiliatePercent] = useState<string>('');
  const [displayDiscount, setDisplayDiscount] = useState<string>('');
  
  // Voucher Toko
  const [voucherType, setVoucherType] = useState<InputType>('NOMINAL');
  const [voucherValue, setVoucherValue] = useState<string>('');

  // Bundle
  const [bundleType, setBundleType] = useState<InputType>('NOMINAL');
  const [bundleValue, setBundleValue] = useState<string>('');

  const [result, setResult] = useState<PricingResult | null>(null);

  // Initialize tier when marketplace changes
  useEffect(() => {
    const config = MARKETPLACE_CONFIG[marketplace];
    if (config && config.tiers.length > 0) {
      setSellerTierId(config.tiers[0].id); // Default to first tier (usually Regular)
      setUseFreeShipping(false);
      setUseCashback(false);
    }
  }, [marketplace]);

  // --- LOGIC ---
  const handleCalculate = () => {
    // 1. Get Base Config
    const config = MARKETPLACE_CONFIG[marketplace];
    const tier = config.tiers.find(t => t.id === sellerTierId) || config.tiers[0];
    
    const feeAdmin = tier.admin;
    const feeTrans = config.transactionFee;
    
    // 2. Get Program Fees
    const feeFreeShipping = useFreeShipping ? config.programs.freeShipping.value : 0;
    const feeCashback = useCashback ? config.programs.cashback.value : 0;

    const totalProgramFee = feeFreeShipping + feeCashback;

    // 3. Parse Inputs
    const valCogs = parseFloat(cogs) || 0;
    const valProfit = parseFloat(desiredProfit) || 0;
    const valPacking = parseFloat(packingCost) || 0;
    const valOther = parseFloat(otherCost) || 0;
    const valAffiliate = parseFloat(affiliatePercent) || 0;
    const valDisplayDisc = parseFloat(displayDiscount) || 0;
    const valVoucher = parseFloat(voucherValue) || 0;
    const valBundle = parseFloat(bundleValue) || 0;

    // --- FORMULA REVERSE CALCULATION ---
    // Total % Deductions based on SELLING PRICE
    let totalPercentDeduction = feeAdmin + feeTrans + totalProgramFee + valAffiliate;
    if (voucherType === 'PERCENT') totalPercentDeduction += valVoucher;
    if (bundleType === 'PERCENT') totalPercentDeduction += valBundle;
    
    // Total Nominal Deductions (Costs + Profit)
    let totalNominalDeduction = valCogs + valPacking + valOther + valProfit;
    if (voucherType === 'NOMINAL') totalNominalDeduction += valVoucher;
    if (bundleType === 'NOMINAL') totalNominalDeduction += valBundle;

    if (totalPercentDeduction >= 95) {
      alert("Total potongan persentase terlalu besar (di atas 95%).");
      return;
    }

    // Selling Price = TotalNominal / (1 - TotalPercent/100)
    const sellingPrice = totalNominalDeduction / (1 - (totalPercentDeduction / 100));

    // Display Price
    const displayPrice = valDisplayDisc > 0 
      ? sellingPrice / (1 - (valDisplayDisc / 100)) 
      : sellingPrice;

    // Breakdown
    const getVal = (pct: number) => sellingPrice * (pct / 100);
    
    const moneyAdmin = getVal(feeAdmin);
    const moneyTrans = getVal(feeTrans);
    const moneyProgram = getVal(totalProgramFee);
    const moneyAffiliate = getVal(valAffiliate);
    
    let moneyMarketing = 0;
    moneyMarketing += voucherType === 'PERCENT' ? getVal(valVoucher) : valVoucher;
    moneyMarketing += bundleType === 'PERCENT' ? getVal(valBundle) : valBundle;

    setResult({
      sellingPrice,
      displayPrice,
      netProfit: valProfit,
      totalFees: moneyAdmin + moneyTrans + moneyProgram + moneyAffiliate + moneyMarketing,
      breakdown: {
        admin: moneyAdmin,
        transaction: moneyTrans,
        program: moneyProgram,
        affiliate: moneyAffiliate,
        marketing: moneyMarketing,
        operational: valPacking + valOther,
        cogs: valCogs
      }
    });
  };

  // Helper to get current config for UI display
  const currentConfig = MARKETPLACE_CONFIG[marketplace];
  const currentTier = currentConfig.tiers.find(t => t.id === sellerTierId) || currentConfig.tiers[0];
  const currentProgramFee = (useFreeShipping ? currentConfig.programs.freeShipping.value : 0) + 
                            (useCashback ? currentConfig.programs.cashback.value : 0);
  const totalAdminPercent = currentTier.admin + currentConfig.transactionFee + currentProgramFee;

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. SECTION: RESULT */}
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
                <span className="text-sm font-bold text-rose-600">Rp {Math.ceil(result.totalFees).toLocaleString('id-ID')}</span>
             </div>
           </div>

           {/* Breakdown Details */}
           <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
             <h4 className="text-xs font-bold text-slate-500 mb-3">Rincian Potongan ({Math.ceil(result.totalFees / result.sellingPrice * 100)}%)</h4>
             <div className="space-y-2 text-xs text-slate-600">
               <div className="flex justify-between">
                 <span>Admin {currentTier.label}</span>
                 <span className="font-semibold text-rose-500">- Rp {Math.ceil(result.breakdown.admin).toLocaleString('id-ID')}</span>
               </div>
               <div className="flex justify-between">
                 <span>Biaya Transaksi/Layanan</span>
                 <span className="font-semibold text-rose-500">- Rp {Math.ceil(result.breakdown.transaction).toLocaleString('id-ID')}</span>
               </div>
               {result.breakdown.program > 0 && (
                 <div className="flex justify-between">
                   <span>Program Xtra (Ongkir/Cashback)</span>
                   <span className="font-semibold text-rose-500">- Rp {Math.ceil(result.breakdown.program).toLocaleString('id-ID')}</span>
                 </div>
               )}
               {result.breakdown.affiliate > 0 && (
                 <div className="flex justify-between">
                   <span>Komisi Afiliasi</span>
                   <span className="font-semibold text-orange-500">- Rp {Math.ceil(result.breakdown.affiliate).toLocaleString('id-ID')}</span>
                 </div>
               )}
             </div>
           </div>
        </div>
      )}

      {/* 2. SECTION: SETTINGS */}
      <div className="space-y-6">
        
        {/* Marketplace & Tier Configuration */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Store className="w-4 h-4 text-indigo-600" />
             Pengaturan Toko
          </h3>
          
          <div className="space-y-4">
            {/* Marketplace Selector */}
            <div className="bg-slate-50 p-2 rounded-2xl flex items-center border border-slate-200">
                <select 
                  value={marketplace} 
                  onChange={(e) => setMarketplace(e.target.value as Marketplace)}
                  className="flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none px-3 py-1 cursor-pointer"
                >
                  {Object.values(Marketplace).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="w-5 h-5 text-slate-400 mr-2 pointer-events-none" />
            </div>

            {/* Seller Tier Selector */}
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tipe Seller / Status</label>
               <div className="bg-slate-50 p-2 rounded-2xl flex items-center border border-slate-200">
                  <select 
                    value={sellerTierId}
                    onChange={(e) => setSellerTierId(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none px-3 py-1 cursor-pointer"
                  >
                    {currentConfig.tiers.map((t) => (
                      <option key={t.id} value={t.id}>{t.label} (Admin {t.admin}%)</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 mr-2 pointer-events-none" />
               </div>
            </div>

            {/* Program Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-2">
               <ProgramToggle 
                  label={currentConfig.programs.freeShipping.label}
                  percent={currentConfig.programs.freeShipping.value}
                  active={useFreeShipping}
                  onToggle={() => setUseFreeShipping(!useFreeShipping)}
                  icon={Truck}
               />
               <ProgramToggle 
                  label={currentConfig.programs.cashback.label}
                  percent={currentConfig.programs.cashback.value}
                  active={useCashback}
                  onToggle={() => setUseCashback(!useCashback)}
                  icon={Zap}
               />
            </div>
            
            {/* Total Admin Summary */}
            <div className="bg-indigo-50 rounded-xl p-3 flex justify-between items-center border border-indigo-100">
              <span className="text-xs font-bold text-indigo-800">Total Potongan Marketplace</span>
              <span className="text-sm font-black text-indigo-600">{totalAdminPercent.toFixed(1)}%</span>
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