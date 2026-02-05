import React, { useState } from 'react';
import { CalculationMode } from './types';
import PriceCalculator from './components/PriceCalculator';
import RoasCalculator from './components/RoasCalculator';
import AiAdvisor from './components/AiAdvisor';
import ProductCreator from './components/ProductCreator';
import { Calculator, Target, Bot, Sparkles, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<CalculationMode>(CalculationMode.PRICING);

  const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
        active 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                SellerPintar
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              <NavButton 
                active={mode === CalculationMode.PRICING} 
                onClick={() => setMode(CalculationMode.PRICING)} 
                icon={Calculator} 
                label="Hitung Harga" 
              />
              <NavButton 
                active={mode === CalculationMode.ROAS} 
                onClick={() => setMode(CalculationMode.ROAS)} 
                icon={Target} 
                label="Simulasi Iklan" 
              />
              <NavButton 
                active={mode === CalculationMode.CREATOR} 
                onClick={() => setMode(CalculationMode.CREATOR)} 
                icon={Sparkles} 
                label="Buat Konten" 
              />
              <NavButton 
                active={mode === CalculationMode.ANALYSIS} 
                onClick={() => setMode(CalculationMode.ANALYSIS)} 
                icon={Bot} 
                label="AI Advisor" 
              />
            </div>
          </div>
        </div>
        
        {/* Mobile Nav Scrollable */}
        <div className="md:hidden border-t border-gray-100 overflow-x-auto py-2 px-4 flex gap-2 no-scrollbar">
           <button 
             onClick={() => setMode(CalculationMode.PRICING)}
             className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${mode === CalculationMode.PRICING ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
           >
             Harga
           </button>
           <button 
             onClick={() => setMode(CalculationMode.ROAS)}
             className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${mode === CalculationMode.ROAS ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
           >
             Iklan
           </button>
           <button 
             onClick={() => setMode(CalculationMode.CREATOR)}
             className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${mode === CalculationMode.CREATOR ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
           >
             Konten
           </button>
           <button 
             onClick={() => setMode(CalculationMode.ANALYSIS)}
             className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${mode === CalculationMode.ANALYSIS ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
           >
             Advisor
           </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === CalculationMode.PRICING && "Kalkulator Harga & Profit"}
              {mode === CalculationMode.ROAS && "Simulasi ROAS & Budget Iklan"}
              {mode === CalculationMode.CREATOR && "Generator Konten Produk AI"}
              {mode === CalculationMode.ANALYSIS && "Analisa Toko & Kompetitor"}
            </h1>
            <p className="text-gray-500 mt-1">
              {mode === CalculationMode.PRICING && "Hitung harga jual yang tepat agar tidak boncos kena biaya admin marketplace."}
              {mode === CalculationMode.ROAS && "Tentukan budget iklan maksimal dan target ROAS agar tetap profit."}
              {mode === CalculationMode.CREATOR && "Buat judul dan deskripsi produk yang SEO friendly dalam hitungan detik."}
              {mode === CalculationMode.ANALYSIS && "Dapatkan insight mendalam tentang performa toko atau kompetitor Anda."}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] p-1">
            <div className="p-4 sm:p-6">
              {mode === CalculationMode.PRICING && <PriceCalculator />}
              {mode === CalculationMode.ROAS && <RoasCalculator />}
              {mode === CalculationMode.CREATOR && <ProductCreator />}
              {mode === CalculationMode.ANALYSIS && <AiAdvisor />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;