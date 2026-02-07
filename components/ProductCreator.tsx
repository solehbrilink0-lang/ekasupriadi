
import React, { useState, useRef, useEffect } from 'react';
import { generateProductListing } from '../services/geminiService';
import { Marketplace, ProductListingResult, PricingResult } from '../types';
import { useUser } from '../contexts/UserContext';
import { Sparkles, Loader2, Camera, Upload, Target, DollarSign, Image as ImageIcon, CheckCircle2, Copy, ShoppingBag, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ProductCreator: React.FC<{ pricingResult: PricingResult | null }> = ({ pricingResult }) => {
  const { deductCredit } = useUser();
  
  const [productName, setProductName] = useState('');
  const [marketplace, setMarketplace] = useState<Marketplace>(Marketplace.SHOPEE);
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [profitPerItem, setProfitPerItem] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductListingResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pricingResult) {
      setSellingPrice(Math.ceil(pricingResult.sellingPrice).toString());
      setProfitPerItem(Math.ceil(pricingResult.netProfit).toString());
    }
  }, [pricingResult]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!productName || !image || !sellingPrice || !profitPerItem) {
      alert("Lengkapi Nama, Foto, Harga Jual, dan Target Profit.");
      return;
    }

    setLoading(true);
    const success = await deductCredit();
    if (!success) {
      alert("Koin Anda tidak cukup. Silakan isi ulang.");
      setLoading(false);
      return;
    }

    try {
      const base64Data = image.split(',')[1];
      const data = await generateProductListing(
        base64Data,
        mimeType || 'image/jpeg',
        productName,
        marketplace,
        parseInt(sellingPrice),
        parseInt(profitPerItem)
      );
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Gagal memproses AI. Coba lagi dalam beberapa saat.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Teks berhasil disalin!");
  };

  return (
    <div className="pt-4 pb-20 lg:pb-0 flex flex-col lg:flex-row gap-8 items-start">
      
      {/* INPUT FORM */}
      <div className={`w-full ${result ? 'lg:w-2/5' : 'lg:w-full max-w-2xl mx-auto'} transition-all`}>
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600" /> Magic Content AI
             </h2>
             <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">1 Koin</span>
          </div>

          <div className="space-y-5">
            {/* Foto Produk */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden cursor-pointer relative group transition-all hover:border-indigo-300 hover:bg-slate-100"
            >
              {image ? (
                <>
                  <img src={image} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <Camera className="text-white w-10 h-10" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-5 bg-white rounded-2xl shadow-sm mb-3">
                    <Camera className="w-8 h-8 text-indigo-500" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ambil Foto Produk</p>
                </>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {/* Input Nama & Marketplace */}
            <div className="space-y-3">
               <input 
                type="text" 
                placeholder="Nama Produk" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
               />
               
               <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                 {Object.values(Marketplace).map(m => (
                    <button 
                      key={m}
                      onClick={() => setMarketplace(m)}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-bold whitespace-nowrap border transition-all ${
                        marketplace === m ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">HARGA</span>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-4 py-4 text-sm font-bold text-slate-700"
                  />
               </div>
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">PROFIT</span>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={profitPerItem}
                    onChange={(e) => setProfitPerItem(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-4 py-4 text-sm font-bold text-emerald-600"
                  />
               </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !image}
              className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              MAGIC GENERATE KONTEN
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS SECTION */}
      {result && (
        <div className="w-full lg:w-3/5 space-y-8 animate-fade-up">
           {/* Section 1: Generated Images */}
           <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest px-2 flex items-center gap-2">
                 <ImageIcon className="w-4 h-4 text-indigo-600" /> 5 Rekomendasi Foto AI
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                 {result.generatedImages.map((img, i) => (
                    <div key={i} className="w-72 h-72 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden shrink-0 relative group snap-center">
                       <img src={img} className="w-full h-full object-cover" alt={`variant-${i}`} />
                       <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-[8px] px-3 py-1.5 rounded-full uppercase font-black">
                         Varian {i+1}
                       </div>
                       <a href={img} download={`foto-produk-${i}.png`} className="absolute bottom-4 right-4 bg-white text-indigo-600 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <CheckCircle2 className="w-5 h-5" />
                       </a>
                    </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section 2: ROAS & Budget Iklan */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                             <Target className="w-5 h-5 text-rose-500" />
                         </div>
                         <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Target ROAS</p>
                             <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Minimum safe limit</p>
                         </div>
                    </div>
                    <h4 className="text-4xl font-black text-slate-800 mb-2">{result.adsStrategy.targetRoas}x</h4>
                </div>

                <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-lg h-full">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/60 uppercase leading-none">Budget Harian</p>
                            <p className="text-[9px] text-indigo-200 mt-0.5 font-bold">Testing awal 7 hari</p>
                        </div>
                     </div>
                     <h4 className="text-3xl font-black">Rp {result.adsStrategy.dailyBudgetRecommendation.toLocaleString('id-ID')}</h4>
                </div>
           </div>

           {/* Section 3: Targeting & Strategy */}
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600" /> Strategi Market-Fit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 bg-slate-50 rounded-[2rem]">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Target Audiens</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{result.adsStrategy.audienceTargeting}</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-[2rem]">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Strategi Diskon</p>
                    <p className="text-sm font-bold text-indigo-600">{result.discountStrategy}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Saran Potongan: {result.suggestedDiscountPercentage}%</p>
                 </div>
              </div>
           </div>

           {/* Section 4: SEO Copywriting */}
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">SEO Optimized Copy</h3>
                 <button onClick={() => setResult(null)} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase hover:bg-indigo-100 transition-colors">Buat Baru</button>
              </div>
              
              <div className="space-y-6">
                 <div className="bg-slate-50 p-6 rounded-[2rem] relative group border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Judul Produk</p>
                    <p className="text-sm md:text-base font-bold text-slate-800 pr-10 leading-snug">{result.seoTitle}</p>
                    <button onClick={() => copyToClipboard(result.seoTitle)} className="absolute top-6 right-6 p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"><Copy className="w-4 h-4"/></button>
                 </div>
                 
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Deskripsi & Keyword</p>
                    <div className="prose prose-sm prose-indigo max-w-none text-xs md:text-sm leading-relaxed text-slate-600">
                       <ReactMarkdown>{result.seoDescription}</ReactMarkdown>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductCreator;
