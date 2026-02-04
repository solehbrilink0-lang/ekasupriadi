import React, { useState, useRef } from 'react';
import { generateProductListing } from '../services/geminiService';
import { Marketplace, ProductListingResult } from '../types';
import { Camera, Sparkles, Copy, Check, Loader2, ImagePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ProductCreator: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [marketplace, setMarketplace] = useState<Marketplace>(Marketplace.SHOPEE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductListingResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleGenerate = async () => {
    if (!productName || !base64Data) {
      alert("Mohon isi nama produk dan upload foto produk.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await generateProductListing(base64Data, mimeType, productName, marketplace);
      setResult(data);
    } catch (error) {
      alert("Gagal membuat konten. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        
        {/* Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative overflow-hidden group border-2 border-dashed rounded-2xl h-56 flex flex-col items-center justify-center cursor-pointer transition-all ${
            selectedImage ? 'border-orange-300 bg-orange-50' : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50'
          }`}
        >
          {selectedImage ? (
            <>
               <img src={selectedImage} alt="Preview" className="h-full w-full object-cover opacity-80" />
               <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium">
                 Ganti Foto
               </div>
            </>
          ) : (
            <div className="text-center text-gray-400 p-4">
              <div className="bg-orange-100 p-3 rounded-full inline-block mb-3">
                 <ImagePlus className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Tap untuk upload foto</p>
              <p className="text-xs mt-1 text-gray-400">Pastikan foto jelas & terang</p>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        </div>

        <div className="mt-4 space-y-4">
           <div>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Nama Produk</label>
             <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Contoh: Gamis Wanita Terbaru"
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
           </div>
           
           <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Platform</label>
            <div className="flex gap-2 mt-1 overflow-x-auto pb-2 no-scrollbar">
              {Object.values(Marketplace).slice(0,4).map(m => (
                <button
                  key={m}
                  onClick={() => setMarketplace(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-all ${marketplace === m ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {m}
                </button>
              ))}
            </div>
           </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading || !base64Data || !productName}
          className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-yellow-200" />}
          {loading ? "Sedang Meracik..." : "Buat Deskripsi Magic"}
        </button>
      </div>

      {result && (
        <div className="space-y-4 animate-fade-in pb-8">
           <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                 <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">JUDUL OPTIMASI</span>
                 <button onClick={() => copyToClipboard(result.seoTitle, 'title')}>
                   {copiedField === 'title' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                 </button>
              </div>
              <p className="font-medium text-gray-800 leading-snug">{result.seoTitle}</p>
           </div>
           
           <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">DESKRIPSI</span>
                 <button onClick={() => copyToClipboard(result.seoDescription, 'desc')}>
                   {copiedField === 'desc' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                 </button>
              </div>
              <div className="prose prose-sm prose-slate max-w-none text-gray-600">
                <ReactMarkdown>{result.seoDescription}</ReactMarkdown>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductCreator;