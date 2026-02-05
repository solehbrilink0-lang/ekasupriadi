import React, { useState, useRef } from 'react';
import { analyzeShopStrategy, ShopData, AnalysisResult } from '../services/geminiService';
import { Bot, Loader2, ImagePlus, Box, Store, Tag, TrendingUp, AlertCircle, RefreshCcw, Truck, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AiAdvisor: React.FC = () => {
  // State Input Form
  const [shopName, setShopName] = useState('');
  const [productType, setProductType] = useState('');
  const [dailyCapacity, setDailyCapacity] = useState(''); // Replaced productCount
  const [stockCapacity, setStockCapacity] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [marketplace, setMarketplace] = useState('Shopee');
  const [shopStatus, setShopStatus] = useState<'NEW' | 'ESTABLISHED'>('NEW'); // New State
  
  // Image State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  // System State
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultString = reader.result as string;
        setSelectedImage(resultString);
        const matches = resultString.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          setMimeType(matches[1]);
          setBase64Data(matches[2]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = async () => {
    // Validasi sederhana
    if (!shopName || !productType) {
      alert("Mohon isi Nama Toko dan Jenis Produk minimal.");
      return;
    }
    
    setLoading(true);
    setResult(null);
    setErrorMsg(null);
    
    const shopData: ShopData = {
      shopName,
      productType,
      dailyCapacity, // Sending daily capacity
      stockCapacity,
      profitMargin,
      marketplace,
      shopStatus
    };

    try {
      const data = await analyzeShopStrategy(shopData, base64Data, mimeType);
      setResult(data);
    } catch (error: any) {
      setErrorMsg(error.message || "Gagal menganalisa strategi.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setErrorMsg(null);
  };

  // --- RENDER FORM ---
  if (!result) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Bot className="w-6 h-6" />
            AI Business Consultant
          </h2>
          <p className="text-xs text-indigo-100 mt-1 opacity-90">
            Isi data toko Anda, AI akan merancang strategi cuan spesifik.
          </p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          <div className="space-y-5">
            
            {/* 1. Identitas Toko */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Store className="w-4 h-4 text-violet-500" /> Identitas Toko
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                   <label className="text-xs font-semibold text-slate-500 mb-1 block">Nama Toko</label>
                   <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Contoh: Berkah Fashion Official"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Marketplace</label>
                        <select 
                            value={marketplace}
                            onChange={(e) => setMarketplace(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            >
                            <option value="Shopee">Shopee</option>
                            <option value="TikTok Shop">TikTok Shop</option>
                            <option value="Lazada">Lazada</option>
                            <option value="Tokopedia">Tokopedia</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Status Toko</label>
                        <select 
                            value={shopStatus}
                            onChange={(e) => setShopStatus(e.target.value as 'NEW' | 'ESTABLISHED')}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            >
                            <option value="NEW">Baru Buka</option>
                            <option value="ESTABLISHED">Sudah Berjalan</option>
                        </select>
                    </div>
                </div>
              </div>
            </div>

            {/* 2. Detail Produk & Stok */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Box className="w-4 h-4 text-pink-500" /> Produk & Operasional
              </h3>
              
              <div>
                 <label className="text-xs font-semibold text-slate-500 mb-1 block">Jenis Produk</label>
                 <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="Contoh: Hijab Instan, Snack Kering"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                     Kapasitas Kirim <Truck className="w-3 h-3 text-slate-400"/>
                  </label>
                  <input
                    type="number"
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(e.target.value)}
                    placeholder="50 paket/hari"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">Mampu packing brp per hari?</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Total Stok Tersedia</label>
                  <input
                    type="number"
                    value={stockCapacity}
                    onChange={(e) => setStockCapacity(e.target.value)}
                    placeholder="1000 pcs"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                 <label className="text-xs font-semibold text-slate-500 mb-1 block">Target Profit Margin (%)</label>
                 <div className="relative">
                   <input
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                    placeholder="25"
                    className="w-full pl-3 pr-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-sm">%</span>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1 italic">*Keuntungan bersih yang diinginkan per produk</p>
              </div>
            </div>

            {/* 3. Upload Foto */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-indigo-500" /> Contoh Produk (Opsional)
              </h3>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  selectedImage ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'
                }`}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">Tap untuk upload foto</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <p className="text-[10px] text-slate-400">AI akan menilai kualitas visual produk Anda.</p>
            </div>

          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <button
            onClick={handleAnalysis}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
            {loading ? "AI Sedang Berpikir..." : "Minta Saran Strategi"}
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER RESULT ---
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[650px]">
      <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Laporan Strategi
        </h2>
        <button 
          onClick={resetForm}
          className="text-xs font-semibold text-slate-500 flex items-center gap-1 hover:text-indigo-600 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCcw className="w-3 h-3" /> Ulangi
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 custom-scrollbar">
        <div className="animate-fade-in space-y-6">
          
          {/* Header Summary */}
          <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
             <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
             <h3 className="text-xl font-bold mb-1">{shopName}</h3>
             <div className="flex flex-wrap items-center gap-2 text-indigo-200 text-xs mt-2">
                <span className="bg-indigo-800 px-2 py-1 rounded flex items-center gap-1"><Tag className="w-3 h-3"/> {productType}</span>
                <span className="bg-indigo-800 px-2 py-1 rounded flex items-center gap-1"><Store className="w-3 h-3"/> {marketplace}</span>
                <span className={`px-2 py-1 rounded flex items-center gap-1 font-bold ${shopStatus === 'NEW' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                    <Award className="w-3 h-3"/> {shopStatus === 'NEW' ? 'Toko Baru' : 'Toko Lama'}
                </span>
             </div>
          </div>

          {/* AI Content */}
          <div className="prose prose-sm prose-indigo max-w-none bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-indigo-700 mt-6 mb-3 flex items-center gap-2" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-slate-600" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 text-slate-600 leading-relaxed" {...props} />,
              }}
            >
              {result.text}
            </ReactMarkdown>
          </div>

          {/* Call to Action for Calculator */}
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
             <div>
               <h4 className="text-sm font-bold text-orange-800">Jangan Lupa Hitung Profit!</h4>
               <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                 AI sudah memberikan strategi. Sekarang pastikan harga jual Anda aman dari potongan admin {marketplace}. Gunakan menu <strong>"Harga"</strong> di bawah untuk simulasi.
               </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AiAdvisor;