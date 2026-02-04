import React, { useState } from 'react';
import { CalculationMode } from './types';
import PriceCalculator from './components/PriceCalculator';
import RoasCalculator from './components/RoasCalculator';
import AiAdvisor from './components/AiAdvisor';
import ProductCreator from './components/ProductCreator';
import { Calculator, Target, Bot, ShoppingBag, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<CalculationMode>(CalculationMode.PRICING);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-lg">
               <ShoppingBag className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">SellerPintar</h1>
              <p className="text-xs text-indigo-200">Anti Boncos Club</p>
            </div>
          </div>
          <div className="hidden md:block text-xs bg-indigo-800 px-3 py-1 rounded-full text-indigo-200 border border-indigo-600">
            Versi Beta 1.1
          </div>
        </div>
      </header>

      {/* Mobile Navigation Tabs (Top) */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[72px] z-40 md:static md:top-auto overflow-x-auto">
        <div className="max-w-5xl mx-auto flex min-w-max md:min-w-0">
          <button
            onClick={() => setMode(CalculationMode.PRICING)}
            className={`flex-1 py-4 px-2 text-sm font-medium flex flex-col md:flex-row items-center justify-center gap-2 border-b-2 transition-colors ${
              mode === CalculationMode.PRICING 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calculator className="w-5 h-5" />
            Hitung Harga
          </button>
          <button
            onClick={() => setMode(CalculationMode.ROAS)}
            className={`flex-1 py-4 px-2 text-sm font-medium flex flex-col md:flex-row items-center justify-center gap-2 border-b-2 transition-colors ${
              mode === CalculationMode.ROAS 
                ? 'border-pink-600 text-pink-600 bg-pink-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Target className="w-5 h-5" />
            Hitung Iklan
          </button>
          <button
            onClick={() => setMode(CalculationMode.CREATOR)}
            className={`flex-1 py-4 px-2 text-sm font-medium flex flex-col md:flex-row items-center justify-center gap-2 border-b-2 transition-colors ${
              mode === CalculationMode.CREATOR 
                ? 'border-orange-500 text-orange-600 bg-orange-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Buat Produk
          </button>
          <button
            onClick={() => setMode(CalculationMode.ANALYSIS)}
            className={`flex-1 py-4 px-2 text-sm font-medium flex flex-col md:flex-row items-center justify-center gap-2 border-b-2 transition-colors ${
              mode === CalculationMode.ANALYSIS 
                ? 'border-violet-600 text-violet-600 bg-violet-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bot className="w-5 h-5" />
            Analisa Toko
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6">
        <div className="animate-fade-in">
          {mode === CalculationMode.PRICING && <PriceCalculator />}
          {mode === CalculationMode.ROAS && <RoasCalculator />}
          {mode === CalculationMode.CREATOR && <ProductCreator />}
          {mode === CalculationMode.ANALYSIS && <AiAdvisor />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SellerPintar. Dibuat untuk UMKM Indonesia.</p>
          <p className="text-xs mt-1">Disclaimer: Perhitungan estimasi. Selalu cek kebijakan biaya terbaru di masing-masing marketplace.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;