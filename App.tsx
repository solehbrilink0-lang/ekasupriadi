
import React, { useState, Suspense, lazy } from 'react';
import { CalculationMode, PricingResult } from './types';
import { UserProvider, useUser } from './contexts/UserContext';
import { Calculator, Target, Bot, Sparkles, Home, BookOpen, TrendingUp, Loader2, Coins, Menu, X } from 'lucide-react';

// Lazy loading components for faster initial load
const DashboardHome = lazy(() => import('./components/DashboardHome'));
const PriceCalculator = lazy(() => import('./components/PriceCalculator'));
const RoasCalculator = lazy(() => import('./components/RoasCalculator'));
const AiAdvisor = lazy(() => import('./components/AiAdvisor'));
const ProductCreator = lazy(() => import('./components/ProductCreator'));
const FinancialJournal = lazy(() => import('./components/FinancialJournal'));
const TopupScreen = lazy(() => import('./components/TopupScreen'));

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full w-full min-h-[50vh] animate-fade-up">
    <div className="bg-white p-4 rounded-full shadow-lg mb-4">
       <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Memuat Aplikasi...</span>
  </div>
);

const AppContent: React.FC = () => {
  const { user } = useUser();
  const [mode, setMode] = useState<CalculationMode>(CalculationMode.DASHBOARD);
  const [sharedPricingResult, setSharedPricingResult] = useState<PricingResult | null>(null);

  const navItems = [
    { mode: CalculationMode.DASHBOARD, icon: Home, label: "HOME" },
    { mode: CalculationMode.PRICING, icon: Calculator, label: "HARGA" },
    { mode: CalculationMode.JOURNAL, icon: BookOpen, label: "JURNAL" },
    { mode: CalculationMode.ROAS, icon: Target, label: "IKLAN" },
    { mode: CalculationMode.CREATOR, icon: Sparkles, label: "KONTEN" },
    { mode: CalculationMode.ANALYSIS, icon: Bot, label: "AI" },
  ];

  const NavItemMobile = ({ active, onClick, icon: Icon, label }: any) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-300 ${
        active ? 'text-indigo-600 -translate-y-1' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className={`p-2 rounded-2xl transition-all duration-300 ${
        active ? 'bg-indigo-50 shadow-sm' : 'bg-transparent'
      }`}>
        <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : ''}`} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={`text-[9px] mt-1 font-extrabold tracking-tight transition-opacity duration-300 ${
        active ? 'opacity-100' : 'opacity-70'
      }`}>
        {label}
      </span>
    </button>
  );

  const NavItemDesktop = ({ active, onClick, icon: Icon, label }: any) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
        active 
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-x-1' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'text-white scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-indigo-500'}`} strokeWidth={2.5} />
      <span className={`text-xs font-bold tracking-wide transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-80'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-screen sticky top-0 z-40 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 mb-10 px-2 group cursor-default">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transition-transform duration-500 group-hover:rotate-12">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">SellerPintar</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI Tools v2.2</p>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
           {navItems.map((item) => (
             <NavItemDesktop 
               key={item.mode}
               active={mode === item.mode}
               onClick={() => setMode(item.mode)}
               icon={item.icon}
               label={item.label === 'HOME' ? 'BERANDA' : item.label}
             />
           ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-50">
          <button 
            onClick={() => setMode(CalculationMode.TOPUP)}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-0.5"
          >
             <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  <Coins className="w-4 h-4 text-amber-300" />
               </div>
               <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Saldo Koin</p>
                  <p className="text-lg font-black leading-none">{user?.credits || 0}</p>
               </div>
             </div>
             <div className="bg-indigo-500 text-[9px] font-bold px-3 py-1.5 rounded-lg text-white group-hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-900/20">
               TOPUP
             </div>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header (Mobile & Desktop) */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 px-6 py-4 flex justify-between items-center md:bg-white/50 md:py-6 transition-all duration-300">
          <div className="md:hidden flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
               <TrendingUp className="w-4 h-4 text-white" />
             </div>
             <span className="text-sm font-black text-slate-800 tracking-tight">SellerPintar</span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-xl font-black text-slate-800 tracking-tight animate-fade-up">
              {mode === CalculationMode.DASHBOARD && "Dashboard & Market Insight"}
              {mode === CalculationMode.PRICING && "Kalkulator Harga & Profit"}
              {mode === CalculationMode.ROAS && "Audit Iklan & Strategi ROAS"}
              {mode === CalculationMode.CREATOR && "Magic Content Generator"}
              {mode === CalculationMode.ANALYSIS && "AI Business Consultant"}
              {mode === CalculationMode.JOURNAL && "Jurnal Keuangan Harian"}
              {mode === CalculationMode.TOPUP && "Isi Ulang Koin Kredit"}
            </h2>
          </div>

          <button 
            onClick={() => setMode(CalculationMode.TOPUP)}
            className="md:hidden bg-slate-900 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-slate-200 hover:scale-105 transition-transform"
          >
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-black">{user?.credits || 0}</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            <Suspense fallback={<LoadingFallback />}>
               {/* Key prop ensures fresh animation on mode switch */}
               <div key={mode} className="animate-fade-up">
                {mode === CalculationMode.DASHBOARD && <DashboardHome onChangeMode={setMode} />}
                {mode === CalculationMode.PRICING && (
                  <PriceCalculator onCalculate={(res) => setSharedPricingResult(res)} />
                )}
                {mode === CalculationMode.ROAS && <RoasCalculator />}
                {mode === CalculationMode.CREATOR && (
                  <ProductCreator pricingResult={sharedPricingResult} />
                )}
                {mode === CalculationMode.ANALYSIS && <AiAdvisor />}
                {mode === CalculationMode.JOURNAL && (
                  <FinancialJournal onRequestTopup={() => setMode(CalculationMode.TOPUP)} />
                )}
                {mode === CalculationMode.TOPUP && <TopupScreen />}
              </div>
            </Suspense>
          </div>
        </main>

        {/* --- MOBILE NAVIGATION --- */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200/60 px-6 pb-safe z-50 h-[80px] flex items-center justify-between shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
           {navItems.map((item) => (
             <NavItemMobile 
               key={item.mode}
               active={mode === item.mode}
               onClick={() => setMode(item.mode)}
               icon={item.icon}
               label={item.label}
             />
           ))}
        </nav>

      </div>
    </div>
  );
};

const App: React.FC = () => (
  <UserProvider>
    <AppContent />
  </UserProvider>
);

export default App;
