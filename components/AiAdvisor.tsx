
import React, { useState, useRef } from 'react';
import { analyzeShopStrategy, ShopData, AnalysisResult } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';
import { Bot, Loader2, Store, TrendingUp, RefreshCcw, Coins, Camera, DollarSign, Package, Tag, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AiAdvisor: React.FC = () => {
  const { deductCredit } = useUser();
  const [shopName, setShopName] = useState('');
  const [productType, setProductType] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [netProfit, setNetProfit] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAnalysis = async () => {
    if (!shopName || !productType) {
      alert("Minimal isi Nama Toko dan Kategori Produk.");
      return;
    }
    
    setLoading(true);
    
    // Potong Koin
    const success = await deductCredit();
    if (!success) {
      alert("Koin Anda tidak cukup. Silakan topup dulu.");
      setLoading(false);
      return;
    }

    try {
      const shopData: ShopData = {
        shopName,
        productType,
        dailyCapacity: '10',
        stockCapacity: '100',
        profitMargin: '20',
        marketplace: 'Shopee',
        shopStatus: 'NEW',
        sellingPrice: parseFloat(sellingPrice) || 0,
        netProfit: parseFloat(netProfit) || 0
      };

      const base64Data = image ? image.split(',')[1] : null;
      const data = await analyzeShopStrategy(shopData, base64Data, mimeType);
      setResult(data);
    } catch (e) {
      alert("Gagal analisa AI. Koin tidak terpotong jika sistem error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm space-y-4 mt-4 border border-slate-100">
      {!result ? (
        <>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" /> Market Insight AI
            </h2>
            <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
              <Coins className="w-3 h-3 text-indigo-600" />
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">1 Koin</span>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed mb-4 px-1">
            Dapatkan analisa market-fit mendalam dengan data visual dan finansial produk Anda.
          </p>

          <div className="space-y-4">
            {/* Image Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center overflow-hidden cursor-pointer relative group transition-all hover:bg-slate-100"
            >
              {image ? (
                <>
                  <img src={image} className="w-full h-full object-cover" alt="Product Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <Camera className="text-white w-8 h-8" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-white rounded-xl shadow-sm mb-2">
                    <Camera className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Foto Produk (Opsional)</p>
                  <p className="text-[8px] text-slate-300 font-bold mt-1">Agar AI bisa analisa kualitas branding visual</p>
                </>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {/* Shop Details */}
            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Nama Toko" 
                  value={shopName} 
                  onChange={e => setShopName(e.target.value)} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Kategori (e.g. Skin Care)" 
                  value={productType} 
                  onChange={e => setProductType(e.target.value)} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">Harga</span>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={sellingPrice} 
                  onChange={e => setSellingPrice(e.target.value)} 
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none" 
                />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">Profit</span>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={netProfit} 
                  onChange={e => setNetProfit(e.target.value)} 
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-emerald-600 outline-none" 
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleAnalysis}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 mt-2 rounded-[1.5rem] font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "MULAI ANALISA MENDALAM"}
          </button>
        </>
      ) : (
        <div className="space-y-5 animate-fade-up">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-indigo-600 text-xs uppercase tracking-widest flex items-center gap-2">
               <Bot className="w-4 h-4" /> Hasil Konsultasi AI
            </h3>
            <button onClick={() => setResult(null)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
               <RefreshCcw className="w-4 h-4 text-slate-500"/>
            </button>
          </div>

          {image && (
            <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-100">
               <img src={image} className="w-full h-full object-cover grayscale-[0.5] opacity-80" alt="Analyzed" />
            </div>
          )}

          <div className="prose prose-sm prose-indigo bg-slate-50 p-6 rounded-[2rem] max-h-96 overflow-y-auto no-scrollbar border border-slate-100 text-[13px] leading-relaxed font-medium">
            <ReactMarkdown>{result.text}</ReactMarkdown>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
             <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
             <p className="text-[9px] font-bold text-amber-800 leading-relaxed uppercase">
               Analisa ini mempertimbangkan visual branding, rasio margin, dan tren kategori produk di Marketplace saat ini.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAdvisor;
