import React, { useState } from 'react';
import { CalculationMode } from './types';
import PriceCalculator from './components/PriceCalculator';
import RoasCalculator from './components/RoasCalculator';
import AiAdvisor from './components/AiAdvisor';
import ProductCreator from './components/ProductCreator';
import DashboardHome from './components/DashboardHome';
import { Calculator, Target, Bot, Sparkles, TrendingUp, User, Home } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<CalculationMode>(CalculationMode.DASHBOARD);

  const NavItem = ({ active, onClick, icon: Icon, label }: any) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-300 ${
        active ? 'text-indigo-600' : 'text-slate-400'
      }`}
    >
      <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-indigo-50 scale-110' : 'bg-transparent'}`}>
        <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={`text-[9px] mt-1 font-bold tracking-tight ${active ? 'opacity-100' : 'opacity-70'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl shadow-slate-200">
      {/* Dynamic Header */}
      <header className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white pt-10 pb-16 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1.5 opacity-80 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Seller Pintar AI</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {mode === CalculationMode.DASHBOARD && "Beranda"}
              {mode === CalculationMode.PRICING && "Cek Profit"}
              {mode === CalculationMode.ROAS && "Audit Iklan"}
              {mode === CalculationMode.CREATOR && "Magic Content"}
              {mode === CalculationMode.ANALYSIS && "Market Insight"}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 -mt-8 relative z-20 pb-24 overflow-y-auto no-scrollbar">
        <div className="animate-fade-up">
          {mode === CalculationMode.DASHBOARD && <DashboardHome onChangeMode={setMode} />}
          {mode === CalculationMode.PRICING && <PriceCalculator />}
          {mode === CalculationMode.ROAS && <RoasCalculator />}
          {mode === CalculationMode.CREATOR && <ProductCreator />}
          {mode === CalculationMode.ANALYSIS && <AiAdvisor />}
        </div>
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe z-50 max-w-md mx-auto">
        <div className="flex justify-around items-center h-16 px-2">
           <NavItem 
            active={mode === CalculationMode.DASHBOARD} 
            onClick={() => setMode(CalculationMode.DASHBOARD)} 
            icon={Home} 
            label="BERANDA" 
          />
          <NavItem 
            active={mode === CalculationMode.PRICING} 
            onClick={() => setMode(CalculationMode.PRICING)} 
            icon={Calculator} 
            label="HARGA" 
          />
          <NavItem 
            active={mode === CalculationMode.ROAS} 
            onClick={() => setMode(CalculationMode.ROAS)} 
            icon={Target} 
            label="IKLAN" 
          />
          <NavItem 
            active={mode === CalculationMode.CREATOR} 
            onClick={() => setMode(CalculationMode.CREATOR)} 
            icon={Sparkles} 
            label="KONTEN" 
          />
          <NavItem 
            active={mode === CalculationMode.ANALYSIS} 
            onClick={() => setMode(CalculationMode.ANALYSIS)} 
            icon={Bot} 
            label="INSIGHT" 
          />
        </div>
      </nav>
    </div>
  );
};

export default App;