
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Marketplace, PricingResult } from '../types';
import { 
  DollarSign, Loader2, AlertCircle, Percent, ChevronDown, 
  ChevronUp, Package, Truck, Tag, ReceiptText, ShieldAlert, ArrowRight, MousePointerClick, Crown, Store, Medal, Users
} from 'lucide-react';

// --- DATA STRUCTURES ---

const MARKETPLACE_DEFAULTS = {
  [Marketplace.SHOPEE]: { 
    transaction: 1.0, 
    gox: 4.0, 
    cbx: 1.4, 
    goxLabel: 'Gratis Ongkir Xtra',
    cbxLabel: 'Cashback Xtra'
  },
  [Marketplace.TIKTOK]: { 
    transaction: 1.0, 
    gox: 4.0, 
    cbx: 0,
    goxLabel: 'Xtra Shipping',
    cbxLabel: 'Program Cashback'
  },
  [Marketplace.TOKOPEDIA]: { 
    transaction: 0, 
    gox: 4.0, 
    cbx: 0,
    goxLabel: 'Bebas Ongkir',
    cbxLabel: 'Voucher Tokopedia'
  },
  [Marketplace.LAZADA]: { 
    transaction: 1.8, 
    gox: 5.0, 
    cbx: 0,
    goxLabel: 'Gratis Ongkir Max',
    cbxLabel: 'Bonus Dadakan'
  },
  [Marketplace.OTHER]: { 
    transaction: 0, 
    gox: 0, 
    cbx: 0,
    goxLabel: 'Program Ongkir',
    cbxLabel: 'Program Cashback'
  }
};

const SELLER_TIERS = {
  [Marketplace.SHOPEE]: [
    { id: 'non-star', label: 'Non-Star', rate: 4.0, icon: Store, desc: '< 50 Order' },
    { id: 'star', label: 'Star / Star+', rate: 6.5, icon: Medal, desc: 'Rata-rata' },
    { id: 'mall', label: 'Shopee Mall', rate: 8.5, icon: Crown, desc: 'Brand Resmi' }
  ],
  [Marketplace.TOKOPEDIA]: [
    { id: 'regular', label: 'Regular', rate: 3.8, icon: Store, desc: 'Merchant Baru' },
    { id: 'pm', label: 'Power M.', rate: 4.5, icon: Medal, desc: 'Power Merchant' },
    { id: 'pm-pro', label: 'PM Pro', rate: 5.5, icon: Medal, desc: 'Pro (Rata-rata)' },
    { id: 'official', label: 'Official', rate: 6.5, icon: Crown, desc: 'Official Store' }
  ],
  [Marketplace.TIKTOK]: [
    { id: 'regular', label: 'Regular', rate: 3.2, icon: Store, desc: 'Seller Biasa' },
    { id: 'power', label: 'Power/Star', rate: 5.0, icon: Medal, desc: 'Program Star' },
    { id: 'mall', label: 'TikTok Mall', rate: 6.0, icon: Crown, desc: 'Official Mall' }
  ],
  [Marketplace.LAZADA]: [
    { id: 'regular', label: 'Regular', rate: 3.0, icon: Store, desc: 'Seller Biasa' },
    { id: 'super', label: 'Super/LazTop', rate: 5.0, icon: Medal, desc: 'Seller Pilihan' },
    { id: 'mall', label: 'LazMall', rate: 7.0, icon: Crown, desc: 'Brand Resmi' }
  ],
  [Marketplace.OTHER]: [
    { id: 'default', label: 'Default', rate: 0, icon: Store, desc: 'Manual' }
  ]
};

const PriceCalculator: React.FC<{ onCalculate?: (result: PricingResult) => void }> = ({ onCalculate }) => {
  const [marketplace, setMarketplace] = useState<Marketplace>(Marketplace.SHOPEE);
  const [sellerTierIndex, setSellerTierIndex] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  // --- INPUTS ---
  const [cogs, setCogs] = useState(''); 
  const [packingCost, setPackingCost] = useState(''); 
  const [opCost, setOpCost] = useState(''); 
  const [desiredProfit, setDesiredProfit] = useState(''); 
  
  // Marketing Costs (Nominal / Percent)
  const [voucherSeller, setVoucherSeller] = useState(''); 
  const [voucherType, setVoucherType] = useState<'NOMINAL' | 'PERCENT'>('NOMINAL');
  
  const [bundleDiscount, setBundleDiscount] = useState(''); 
  const [bundleType, setBundleType] = useState<'NOMINAL' | 'PERCENT'>('NOMINAL');

  // Affiliate Cost
  const [affiliatePercent, setAffiliatePercent] = useState('');

  const [strikePriceRatio, setStrikePriceRatio] = useState('50'); 

  // --- TOGGLES PROGRAM ---
  const [useGox, setUseGox] = useState(true);
  const [useCbx, setUseCbx] = useState(true);
  
  const [result, setResult] = useState<PricingResult | null>(null);

  useEffect(() => {
    const tiers = SELLER_TIERS[marketplace];
    const defaultIndex = tiers.length > 1 ? 1 : 0;
    setSellerTierIndex(defaultIndex);
  }, [marketplace]);

  const config = useMemo(() => MARKETPLACE_DEFAULTS[marketplace], [marketplace]);
  const currentTier = useMemo(() => SELLER_TIERS[marketplace][sellerTierIndex] || SELLER_TIERS[marketplace][0], [marketplace, sellerTierIndex]);

  const calculate = useCallback(() => {
    if (!cogs || !desiredProfit) return;
    setLoading(true);
    
    const valCogs = parseFloat(cogs) || 0;
    const valPacking = parseFloat(packingCost) || 0;
    const valOp = parseFloat(opCost) || 0;
    const valProfit = parseFloat(desiredProfit) || 0;
    
    const valVoucherInput = parseFloat(voucherSeller) || 0;
    const valBundleInput = parseFloat(bundleDiscount) || 0;
    const valAffiliatePct = parseFloat(affiliatePercent) || 0;
    
    let marketingNominal = 0;
    let marketingPercent = 0;

    if (voucherType === 'NOMINAL') marketingNominal += valVoucherInput;
    else marketingPercent += valVoucherInput;

    if (bundleType === 'NOMINAL') marketingNominal += valBundleInput;
    else marketingPercent += valBundleInput;

    const numerator = valCogs + valPacking + valOp + valProfit + marketingNominal;
    let totalPctFees = currentTier.rate + config.transaction;
    if (useGox) totalPctFees += config.gox;
    if (useCbx) totalPctFees += config.cbx;
    
    const denominator = 1 - ((totalPctFees + marketingPercent + valAffiliatePct) / 100);

    if (denominator <= 0) {
      alert("Biaya persentase terlalu tinggi! Cek kembali input Anda.");
      setLoading(false);
      return;
    }

    const sellingPrice = numerator / denominator;
    const markupPct = parseFloat(strikePriceRatio) || 0;
    const displayPrice = sellingPrice * (1 + (markupPct / 100));
    
    const realMarketingCost = marketingNominal + (sellingPrice * (marketingPercent / 100));
    const realAffiliateCost = sellingPrice * (valAffiliatePct / 100);

    const finalResult: PricingResult = {
      sellingPrice,
      displayPrice,
      netProfit: valProfit,
      totalFees: sellingPrice * (totalPctFees / 100),
      breakdown: {
        admin: sellingPrice * (currentTier.rate / 100),
        transaction: sellingPrice * (config.transaction / 100),
        program: sellingPrice * ((useGox ? config.gox : 0) + (useCbx ? config.cbx : 0)) / 100,
        affiliate: realAffiliateCost,
        marketing: realMarketingCost,
        operational: valPacking + valOp,
        cogs: valCogs
      }
    };

    // Simulate smoother loading feel
    setTimeout(() => {
      setResult(finalResult);
      if (onCalculate) onCalculate(finalResult);
      setLoading(false);
    }, 500);
  }, [cogs, packingCost, opCost, desiredProfit, voucherSeller, voucherType, bundleDiscount, bundleType, affiliatePercent, marketplace, useGox, useCbx, strikePriceRatio, config, currentTier, onCalculate]);

  const TypeToggle = ({ type, setType }: { type: 'NOMINAL' | 'PERCENT', setType: (t: 'NOMINAL' | 'PERCENT') => void }) => (
    <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200">
       <button 
         onClick={() => setType('NOMINAL')}
         className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all duration-300 ${type === 'NOMINAL' ? 'bg-white text-slate-800 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
       >
         Rp
       </button>
       <button 
         onClick={() => setType('PERCENT')}
         className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all duration-300 ${type === 'PERCENT' ? 'bg-white text-rose-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
       >
         %
       </button>
    </div>
  );

  return (
    <div className="pt-4 pb-20 lg:pb-0 flex flex-col lg:flex-row gap-8 items-start">
      
      {/* LEFT COLUMN: INPUTS */}
      <div className="w-full lg:w-3/5 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 space-y-8 order-2 lg:order-1 transition-all">
        
        {/* Marketplace & Seller Type Selector */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
             <Truck className="w-4 h-4 text-indigo-500" /> Platform & Jenis Seller
           </h4>
           
           <div className="flex flex-wrap gap-2">
            {Object.values(Marketplace).map(m => (
                <button 
                key={m}
                onClick={() => setMarketplace(m)}
                className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-300 border uppercase tracking-tighter ${
                    marketplace === m 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                      : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                }`}
                >
                {m}
                </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {SELLER_TIERS[marketplace].map((tier, idx) => {
               const TierIcon = tier.icon;
               const isSelected = idx === sellerTierIndex;
               return (
                 <button
                   key={tier.id}
                   onClick={() => setSellerTierIndex(idx)}
                   className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                     isSelected 
                       ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20 scale-[1.02]' 
                       : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-indigo-100'
                   }`}
                 >
                   <TierIcon className={`w-5 h-5 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
                   <span className="text-[10px] font-black text-center leading-none uppercase">{tier.label}</span>
                   <span className={`text-[9px] font-bold transition-colors ${isSelected ? 'text-indigo-500' : 'text-slate-300'}`}>
                     Admin {tier.rate}%
                   </span>
                 </button>
               )
             })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section 1: Produksi */}
            <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Package className="w-4 h-4 text-slate-400" /> Modal & Operasional
            </h4>
            <div className="space-y-3">
                <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase transition-colors group-focus-within:text-indigo-500">HPP Produk</span>
                    <input 
                    inputMode="numeric"
                    placeholder="0"
                    value={cogs}
                    onChange={(e) => setCogs(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-28 pr-6 py-4 text-sm font-black text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase transition-colors group-focus-within:text-slate-500">Packing</span>
                        <input 
                        inputMode="numeric"
                        placeholder="0"
                        value={packingCost}
                        onChange={(e) => setPackingCost(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-20 pr-4 py-4 text-sm font-black text-slate-600 focus:bg-white focus:border-slate-300 outline-none transition-all duration-300"
                        />
                    </div>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase transition-colors group-focus-within:text-slate-500">Gaji/Ops</span>
                        <input 
                        inputMode="numeric"
                        placeholder="0"
                        value={opCost}
                        onChange={(e) => setOpCost(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-20 pr-4 py-4 text-sm font-black text-slate-600 focus:bg-white focus:border-slate-300 outline-none transition-all duration-300"
                        />
                    </div>
                </div>
            </div>
            </div>

            {/* Section 4: Target Profit */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Target Untung Bersih
                </h4>
                <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase transition-colors group-focus-within:text-emerald-500">Ingin Cuan (Net)</span>
                    <input 
                        inputMode="numeric"
                        placeholder="0"
                        value={desiredProfit}
                        onChange={(e) => setDesiredProfit(e.target.value)}
                        className="w-full bg-emerald-50/50 border-2 border-transparent rounded-3xl pl-36 pr-6 py-5 text-lg font-black text-emerald-600 focus:bg-emerald-50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all duration-300"
                    />
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                     <p className="text-[10px] text-emerald-800 leading-relaxed font-bold">
                        Tip: Masukkan nominal bersih yang ingin Anda kantongi per pcs setelah semua biaya.
                     </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section 2: Promo Marketplace */}
            <div className="space-y-3 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 hover:bg-indigo-50 transition-colors duration-300">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Percent className="w-3.5 h-3.5" /> Program {marketplace}
            </h4>
            <div className="flex flex-col gap-5">
                <label className="flex items-center justify-between cursor-pointer group select-none">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${useGox ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-200 text-slate-400'}`}>
                        <Truck className="w-5 h-5" />
                        </div>
                        <div>
                        <p className="text-xs font-black text-slate-700 leading-none">{config.goxLabel}</p>
                        <p className="text-[9px] font-bold text-indigo-500 mt-1 uppercase">Beban Seller {config.gox}%</p>
                        </div>
                    </div>
                    <input type="checkbox" checked={useGox} onChange={() => setUseGox(!useGox)} className="sr-only" />
                    <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${useGox ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${useGox ? 'translate-x-6' : 'translate-x-1'}`}></div>
                    </div>
                </label>

                {config.cbx > 0 && (
                    <label className="flex items-center justify-between cursor-pointer group select-none">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${useCbx ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-200 text-slate-400'}`}>
                            <Percent className="w-5 h-5" />
                            </div>
                            <div>
                            <p className="text-xs font-black text-slate-700 leading-none">{config.cbxLabel}</p>
                            <p className="text-[9px] font-bold text-indigo-500 mt-1 uppercase">Beban Seller {config.cbx}%</p>
                            </div>
                        </div>
                        <input type="checkbox" checked={useCbx} onChange={() => setUseCbx(!useCbx)} className="sr-only" />
                        <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${useCbx ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${useCbx ? 'translate-x-6' : 'translate-x-1'}`}></div>
                        </div>
                    </label>
                )}
            </div>
            </div>

            {/* Section 3: Diskon Toko & Markup */}
            <div className="space-y-6">
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Tag className="w-4 h-4 text-rose-500" /> Beban Diskon & Afiliasi
                    </h4>
                    <div className="space-y-3">
                        {/* Vouchers */}
                        <div className="relative bg-slate-50 border border-slate-100 rounded-2xl p-1 flex items-center focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-300 transition-all duration-300">
                            <span className="absolute left-4 text-[9px] font-black text-slate-300 uppercase z-10">Voucher</span>
                            <input 
                            inputMode="numeric"
                            placeholder="0"
                            value={voucherSeller}
                            onChange={(e) => setVoucherSeller(e.target.value)}
                            className="w-full bg-transparent border-none pl-20 pr-2 py-3 text-sm font-black text-rose-600 outline-none placeholder:text-slate-300"
                            />
                            <TypeToggle type={voucherType} setType={setVoucherType} />
                        </div>

                        {/* Bundles */}
                        <div className="relative bg-slate-50 border border-slate-100 rounded-2xl p-1 flex items-center focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-300 transition-all duration-300">
                            <span className="absolute left-4 text-[9px] font-black text-slate-300 uppercase z-10">Bundle</span>
                            <input 
                            inputMode="numeric"
                            placeholder="0"
                            value={bundleDiscount}
                            onChange={(e) => setBundleDiscount(e.target.value)}
                            className="w-full bg-transparent border-none pl-20 pr-2 py-3 text-sm font-black text-rose-600 outline-none placeholder:text-slate-300"
                            />
                            <TypeToggle type={bundleType} setType={setBundleType} />
                        </div>
                        
                        {/* Affiliate Input */}
                        <div className="relative bg-slate-50 border border-slate-100 rounded-2xl p-1 flex items-center focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-300 transition-all duration-300">
                            <span className="absolute left-4 text-[9px] font-black text-slate-300 uppercase z-10 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Affiliate
                            </span>
                            <input 
                            inputMode="numeric"
                            placeholder="0"
                            value={affiliatePercent}
                            onChange={(e) => setAffiliatePercent(e.target.value)}
                            className="w-full bg-transparent border-none pl-20 pr-2 py-3 text-sm font-black text-rose-600 outline-none placeholder:text-slate-300"
                            />
                            <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 border border-slate-200">
                                <span className="px-3 py-1 bg-white text-rose-600 shadow-sm rounded-md text-[9px] font-black">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                     <div className="flex justify-between items-center px-1">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <MousePointerClick className="w-3.5 h-3.5 text-slate-400" /> Markup Harga Coret
                        </h4>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                            +{strikePriceRatio}%
                        </span>
                    </div>
                    <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    step="5"
                    value={strikePriceRatio}
                    onChange={(e) => setStrikePriceRatio(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:bg-slate-300 transition-colors"
                    />
                </div>
            </div>
        </div>

        <button 
          onClick={calculate}
          disabled={loading || !cogs || !desiredProfit}
          className="w-full bg-slate-900 active:scale-[0.98] text-white py-5 rounded-[2rem] font-black text-sm shadow-xl hover:shadow-2xl hover:bg-black flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ReceiptText className="w-5 h-5 group-hover:scale-110 transition-transform" />}
          HITUNG HARGA & POTONGAN
        </button>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
           <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
           <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">
             Biaya Admin disesuaikan untuk Kategori A (Umum). Untuk kategori khusus (Elektronik/Fashion Tertentu) mungkin ada selisih 0.5% - 1.0%.
           </p>
        </div>
      </div>

      {/* RIGHT COLUMN: RESULT (Sticky) */}
      {result ? (
        <div className="w-full lg:w-2/5 order-1 lg:order-2 lg:sticky lg:top-28 animate-fade-up">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden border border-white/5 group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-indigo-500/30 transition-colors duration-700"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Harga Jual Bersih (Net)</span>
                        <span className="bg-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-indigo-900/50">
                            {marketplace}
                        </span>
                    </div>
                    <div className="text-5xl font-black mb-2 tracking-tight animate-scale-in">
                        Rp {Math.ceil(result.sellingPrice).toLocaleString('id-ID')}
                    </div>
                    
                    {/* Strike Price Display */}
                    <div className="flex items-center gap-2 mb-8 opacity-60 bg-white/5 w-fit px-4 py-1.5 rounded-full border border-white/10">
                        <span className="text-xs font-bold line-through">Rp {Math.ceil(result.displayPrice).toLocaleString('id-ID')}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-[10px] font-black text-rose-400">-{strikePriceRatio}%</span>
                        <span className="text-[9px] uppercase font-bold tracking-widest ml-1">(Harga Coret)</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors duration-300">
                            <p className="text-[9px] font-black uppercase opacity-40 mb-1">Profit Real</p>
                            <p className="text-lg font-black text-emerald-400">Rp {result.netProfit.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors duration-300">
                            <p className="text-[9px] font-black uppercase opacity-40 mb-1">Total Potongan</p>
                            <p className="text-lg font-black text-rose-400">Rp {Math.ceil(result.totalFees + result.breakdown.marketing + result.breakdown.affiliate).toLocaleString('id-ID')}</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-white/10 pt-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Rincian Biaya</h4>
                        <div className="flex justify-between text-xs font-bold hover:bg-white/5 p-1 rounded-lg transition-colors">
                            <span className="opacity-60">Biaya Admin ({currentTier.label} - {currentTier.rate}%)</span>
                            <span>Rp {Math.ceil(result.breakdown.admin).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold hover:bg-white/5 p-1 rounded-lg transition-colors">
                            <span className="opacity-60">Biaya Transaksi ({config.transaction}%)</span>
                            <span>Rp {Math.ceil(result.breakdown.transaction).toLocaleString('id-ID')}</span>
                        </div>
                        {useGox && (
                            <div className="flex justify-between text-xs font-bold hover:bg-white/5 p-1 rounded-lg transition-colors">
                                <span className="opacity-60">{config.goxLabel} ({config.gox}%)</span>
                                <span>Rp {Math.ceil(result.sellingPrice * (config.gox/100)).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {useCbx && config.cbx > 0 && (
                            <div className="flex justify-between text-xs font-bold hover:bg-white/5 p-1 rounded-lg transition-colors">
                                <span className="opacity-60">{config.cbxLabel} ({config.cbx}%)</span>
                                <span>Rp {Math.ceil(result.sellingPrice * (config.cbx/100)).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {result.breakdown.affiliate > 0 && (
                            <div className="flex justify-between text-xs font-bold text-indigo-300 hover:bg-white/5 p-1 rounded-lg transition-colors">
                                <span className="opacity-80">Komisi Afiliasi ({parseFloat(affiliatePercent)}%)</span>
                                <span>Rp {Math.ceil(result.breakdown.affiliate).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xs font-bold hover:bg-white/5 p-1 rounded-lg transition-colors">
                            <span className="opacity-60">Packing & Operasional</span>
                            <span>Rp {result.breakdown.operational.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-rose-300 hover:bg-white/5 p-1 rounded-lg transition-colors">
                            <span className="opacity-80">Beban Diskon Toko</span>
                            <span>Rp {Math.ceil(result.breakdown.marketing).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
         <div className="hidden lg:flex w-full lg:w-2/5 order-2 items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 min-h-[400px] animate-fade-up">
             <div className="text-center opacity-40">
                 <ReceiptText className="w-16 h-16 mx-auto mb-4 text-slate-400 animate-pulse" />
                 <h3 className="text-xl font-black text-slate-800">Hasil Perhitungan</h3>
                 <p className="text-sm font-bold">Isi form di sebelah kiri untuk melihat detail harga.</p>
             </div>
         </div>
      )}
    </div>
  );
};

export default PriceCalculator;
