import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { TrendingUp, ShieldCheck, Gift, AlertTriangle, Copy, Loader2, Globe, XCircle, User } from 'lucide-react';
import { firebaseConfig } from '../firebaseConfig';

const LoginScreen: React.FC = () => {
  const { login, loginAsGuest } = useUser();
  const [loading, setLoading] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !firebaseConfig.apiKey || 
      firebaseConfig.apiKey.includes("ISI_DENGAN")
    ) {
      console.warn("Firebase Config missing or incomplete.");
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setDomainError(null);
    setGeneralError(null);
    
    try {
      await login();
    } catch (error: any) {
      console.error("Login Error:", error);
      
      const errorCode = error?.code || "";
      const errorMessage = error?.message || "";
      const errorString = String(error);

      // 1. Check for Unauthorized Domain Error
      if (
        errorCode === 'auth/unauthorized-domain' ||
        errorMessage.includes('auth/unauthorized-domain') || 
        errorString.includes('auth/unauthorized-domain') ||
        errorMessage.includes('unauthorized domain')
      ) {
        const currentDomain = window.location.hostname || "localhost";
        setDomainError(currentDomain);
        return;
      }
      
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
         return; 
      }

      if (errorCode === 'auth/operation-not-allowed') {
        setGeneralError("Google Sign-In belum diaktifkan di Firebase Console.");
        return;
      }

      setGeneralError(errorMessage || "Gagal terhubung ke server login.");
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10 text-center animate-fade-up border border-slate-100">
        
        {/* Logo Section */}
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">SellerPintar AI</h1>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed px-2">
          Optimalkan profit toko marketplace Anda dengan kecerdasan buatan. 
          Daftar sekarang dan dapatkan <span className="font-bold text-indigo-600">50 Koin Kredit</span> sebagai modal awal analisa.
        </p>

        {/* --- ERROR STATE: UNAUTHORIZED DOMAIN --- */}
        {domainError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl text-left animate-fade-up ring-4 ring-amber-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-800 text-xs uppercase tracking-wide">Domain Belum Diizinkan</h3>
            </div>
            <p className="text-[11px] text-slate-700 mb-3 leading-relaxed font-medium">
              Firebase memblokir domain <strong>{domainError}</strong>. Jangan khawatir, Anda tetap bisa menggunakan aplikasi ini.
            </p>
            <button 
              onClick={loginAsGuest}
              className="w-full bg-amber-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200"
            >
              <User className="w-4 h-4" /> Masuk via Mode Tamu Saja
            </button>
          </div>
        )}

        {/* --- ERROR STATE: GENERAL --- */}
        {generalError && (
           <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-2xl text-left animate-fade-up flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-rose-700 text-xs uppercase tracking-wide mb-1">Login Gagal</h3>
                <p className="text-[11px] text-rose-600 leading-relaxed">{generalError}</p>
              </div>
           </div>
        )}

        {/* Feature Pill / Offer */}
        {!domainError && !generalError && (
          <div className="bg-indigo-50 p-4 rounded-2xl flex items-center gap-3 text-left mb-8 border border-indigo-100 transition-all hover:shadow-md">
            <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm">
               <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900 text-xs tracking-tight uppercase">Welcome Package Available</h3>
              <p className="text-[10px] text-indigo-600 leading-normal mt-0.5">
                Login dengan Google untuk klaim paket Starter.
              </p>
            </div>
          </div>
        )}

        {!domainError && (
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group mb-4 ${
               generalError ? 'bg-slate-700 hover:bg-slate-800 shadow-slate-200' : 'bg-slate-900 hover:bg-black shadow-slate-200'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menghubungkan...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Masuk dengan Google
              </>
            )}
          </button>
        )}

        <div className="relative flex items-center gap-2 py-2 mb-4 opacity-70">
           <div className="h-px bg-slate-200 flex-1"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase">ATAU</span>
           <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <button 
          onClick={loginAsGuest}
          className="w-full bg-white text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95"
        >
           <User className="w-4 h-4 text-slate-400" />
           Masuk sebagai Tamu
        </button>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3" />
          <span>Secure & Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;