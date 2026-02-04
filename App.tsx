import React, { useState } from 'react';
import { CalculationMode } from './types';
import PriceCalculator from './components/PriceCalculator';
import RoasCalculator from './components/RoasCalculator';
import AiAdvisor from './components/AiAdvisor';
import ProductCreator from './components/ProductCreator';
import { Calculator, Target, Bot, Sparkles, TrendingUp } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<CalculationMode>(CalculationMode.PRICING);

  const NavItem = ({ active, onClick, icon: Icon, label }: any) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-3 transition-all duration-300 ${
        active 
          ? 'text-indigo-600 -translate-y-1' 
          : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-indigo-50' : 'bg-transparent'}`}>
        <Icon className={`w-6 h-6 ${active ? 'fill-indigo-600/20' : ''}`} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={`text-[10px] mt-1 font-medium ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-24">
      {/* Modern Header with Gradient */}
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-xl shadow-indigo-900/20 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-100">Seller Pintar</span>
            </div>
            <h1 className="text-2xl font-bold leading-tight">
              {mode === CalculationMode.PRICING && "Hitung Profit"}
              {mode === CalculationMode.ROAS && "Hitung Iklan"}
              {mode === CalculationMode.CREATOR && "Buat Konten"}
              {mode === CalculationMode.ANALYSIS && "Analisa Toko"}
            </h1>
            <p className="text-indigo-100 text-sm mt-1 opacity-80">
              {mode === CalculationMode.PRICING && "Optimalkan harga jualmu."}
              {mode === CalculationMode.ROAS && "Jangan sampai boncos."}
              {mode === CalculationMode.CREATOR && "AI Copywriting instan."}
              {mode === CalculationMode.ANALYSIS && "Audit performa tokomu."}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="text-xs font-medium">v1.2</span>
          </div>
        </div>
      </header>

      {/* Main Content Container - Pull up to overlap header */}
      <main className="px-4 -mt-8 relative z-20 max-w-xl mx-auto">
        <div className="animate-fade-in-up">
          {mode === CalculationMode.PRICING && <PriceCalculator />}
          {mode === CalculationMode.ROAS && <RoasCalculator />}
          {mode === CalculationMode.CREATOR && <ProductCreator />}
          {mode === CalculationMode.ANALYSIS && <AiAdvisor />}
        </div>
      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/60 pb-safe z-50">
        <div className="flex justify-around items-center max-w-xl mx-auto px-2">
          <NavItem 
            active={mode === CalculationMode.PRICING} 
            onClick={() => setMode(CalculationMode.PRICING)} 
            icon={Calculator} 
            label="Harga" 
          />
          <NavItem 
            active={mode === CalculationMode.ROAS} 
            onClick={() => setMode(CalculationMode.ROAS)} 
            icon={Target} 
            label="Iklan" 
          />
          <NavItem 
            active={mode === CalculationMode.CREATOR} 
            onClick={() => setMode(CalculationMode.CREATOR)} 
            icon={Sparkles} 
            label="Produk" 
          />
          <NavItem 
            active={mode === CalculationMode.ANALYSIS} 
            onClick={() => setMode(CalculationMode.ANALYSIS)} 
            icon={Bot} 
            label="Advisor" 
          />
        </div>
      </div>
    </div>
  );
};

export default App;