import React, { useState, useRef } from 'react';
import { generateProductListing } from '../services/geminiService';
import { Marketplace, ProductListingResult } from '../types';
import { Camera, Sparkles, Upload, Copy, Check, Loader2, ImagePlus } from 'lucide-react';
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
        // Extract base64 data and mime type
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Pembuat Produk Otomatis
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Foto Produk</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  selectedImage ? 'border-indigo-300 bg-gray-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                }`}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImagePlus className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Klik untuk upload foto</p>
                    <p className="text-xs mt-1">Format: JPG, PNG</p>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk (Singkat)</label>
              <input 
                type="text" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Contoh: Sepatu Sneakers Pria"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Marketplace</label>
              <select 
                value={marketplace} 
                onChange={(e) => setMarketplace(e.target.value as Marketplace)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-indigo-500"
              >
                {Object.values(Marketplace).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !base64Data || !productName}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sedang Meracik Konten...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Buat Judul & Deskripsi SEO
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          <div className="flex flex-col h-full">
            {result ? (
              <div className="space-y-4 animate-fade-in">
                {/* SEO Title */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Judul SEO</label>
                    <button 
                      onClick={() => copyToClipboard(result.seoTitle, 'title')}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'title' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-gray-800 font-medium text-lg leading-snug">{result.seoTitle}</p>
                </div>

                {/* Recommendation */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Strategi Cuan
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">{result.discountStrategy}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">Saran Diskon:</span>
                    <span className="bg-white px-2 py-1 rounded border border-orange-200 text-orange-600 font-bold text-sm">
                      {result.suggestedDiscountPercentage}%
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-colors flex-1">
                   <div className="flex justify-between items-start mb-2">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Deskripsi Produk</label>
                    <button 
                      onClick={() => copyToClipboard(result.seoDescription, 'desc')}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Copy"
                    >
                      {copiedField === 'desc' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="prose prose-sm prose-gray max-w-none h-64 overflow-y-auto custom-scrollbar">
                    <ReactMarkdown>{result.seoDescription}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <Camera className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-center max-w-xs">
                  Upload foto produk Anda, AI kami akan menganalisa gambar dan membuatkan konten jualan yang menarik.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreator;