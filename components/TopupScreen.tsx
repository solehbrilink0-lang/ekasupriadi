
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { functions } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { Coins, Zap, Crown, Loader2, CreditCard, CheckCircle2, ShieldCheck, Wallet, AlertCircle } from 'lucide-react';

const TopupScreen: React.FC = () => {
  const { user, addCredits } = useUser();
  const [processing, setProcessing] = useState<string | null>(null);

  const packages = [
    { 
        id: 'starter', 
        name: 'Paket Pemula', 
        credits: 50, 
        price: 25000, 
        color: 'bg-white border-slate-200', 
        icon: Coins,
        benefit: 'Full Akses Semua Fitur AI'
    },
    { 
        id: 'pro', 
        name: 'Paket Juragan', 
        credits: 150, 
        price: 59000, 
        color: 'bg-indigo-50 border-indigo-200', 
        popular: true, 
        icon: Zap,
        benefit: 'Full Akses Semua Fitur AI'
    },
    { 
        id: 'sultan', 
        name: 'Paket Sultan', 
        credits: 500, 
        price: 149000, 
        color: 'bg-yellow-50 border-yellow-200', 
        icon: Crown,
        benefit: 'Full Akses Semua Fitur AI'
    },
  ];

  const handleMidtransPayment = async (pkg: any) => {
    // 1. Cek Login
    if (!user || user.id === 'guest') {
        alert("Silakan login terlebih dahulu untuk melakukan Topup.");
        return;
    }

    setProcessing(pkg.id);

    try {
        // 2. Panggil Cloud Function 'createTransaction'
        // NOTE: Karena Anda belum bisa deploy backend, ini mungkin akan error di console.
        // Jika error, kode catch di bawah akan menangkapnya.
        const createTransactionFn = httpsCallable(functions, 'createTransaction');
        
        const response = await createTransactionFn({
            price: pkg.price,
            packageId: pkg.id,
            packageName: pkg.name,
            credits: pkg.credits
        });

        const data = response.data as { token: string; error?: string };

        if (data.error) {
            alert(`Gagal: ${data.error}`);
            setProcessing(null);
            return;
        }

        // 3. Munculkan Pop-up Pembayaran (Snap)
        if (window.snap) {
            window.snap.pay(data.token, {
                onSuccess: (result: any) => {
                    console.log("Payment Success!", result);
                    addCredits(pkg.credits); 
                    alert(`Pembayaran Berhasil! ${pkg.credits} Koin ditambahkan.`);
                    setProcessing(null);
                },
                onPending: (result: any) => {
                    console.log("Payment Pending", result);
                    alert("Menunggu pembayaran Anda...");
                    setProcessing(null);
                },
                onError: (result: any) => {
                    console.error("Payment Error", result);
                    alert("Pembayaran gagal atau dibatalkan.");
                    setProcessing(null);
                },
                onClose: () => {
                    console.log("Customer closed the popup without finishing the payment");
                    setProcessing(null);
                }
            });
        } else {
            alert("Sistem pembayaran belum siap (Snap.js belum termuat). Silakan refresh halaman.");
            setProcessing(null);
        }

    } catch (error: any) {
        console.error("Topup Error:", error);
        
        // --- SIMULASI MODE (FALLBACK) ---
        // Karena backend belum dideploy, kita buat simulasi agar Anda bisa melihat UI-nya bekerja.
        const confirmSimulasi = confirm("Koneksi ke backend gagal (karena belum dideploy). Apakah Anda ingin mensimulasikan Topup Sukses untuk tes UI?");
        if (confirmSimulasi) {
             addCredits(pkg.credits);
             alert(`[MODE TES] ${pkg.credits} Koin ditambahkan ke akun.`);
        } else {
             alert(`Terjadi kesalahan koneksi: ${error.message}`);
        }
        
        setProcessing(null);
    }
  };

  return (
    <div className="space-y-8 pb-24 lg:pb-0 animate-fade-up">
      
      {/* Header Saldo */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl max-w-4xl mx-auto border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
        <div className="relative z-10">
            <p className="text-indigo-300 text-xs font-black uppercase tracking-[0.3em] mb-4">Saldo Koin Aktif</p>
            <div className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">{user?.credits}</div>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs bg-white/5 w-fit mx-auto px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Payment Secured by Midtrans
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-800 px-2 flex items-center gap-2 uppercase tracking-widest">
            <CreditCard className="w-4 h-4 text-indigo-600" /> Pilihan Paket Topup
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
                <div key={pkg.id} className={`p-8 rounded-[2.5rem] border-2 transition-all duration-300 shadow-sm ${pkg.color} relative overflow-hidden group hover:shadow-xl hover:-translate-y-1`}>
                    {pkg.popular && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black px-6 py-1.5 rotate-45 translate-x-5 translate-y-3 uppercase shadow-lg z-10">
                            Best Value
                        </div>
                    )}
                    
                    <div className="flex flex-col h-full">
                        <div className="mb-6">
                            <h4 className="font-black text-slate-800 text-xl">{pkg.name}</h4>
                            <div className="flex items-center gap-1.5 text-slate-500 mt-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold uppercase tracking-tight">{pkg.benefit}</span>
                            </div>
                        </div>
                        
                        <div className="mb-8">
                            <div className="text-4xl font-black text-slate-800 mb-1">Rp {pkg.price / 1000}k</div>
                            <div className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-white/50 w-fit px-3 py-1 rounded-lg border border-indigo-100">{pkg.credits} KOIN</div>
                        </div>

                        <div className="mt-auto">
                            <button 
                                onClick={() => handleMidtransPayment(pkg)}
                                disabled={!!processing}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-slate-200 active:scale-[0.98]"
                            >
                                {processing === pkg.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                                {processing === pkg.id ? "MEMPROSES..." : "BAYAR VIA MIDTRANS"}
                            </button>
                            <div className="mt-3 flex justify-center gap-2 opacity-40 grayscale">
                                {/* Placeholder Icons for Midtrans Payment Methods */}
                                <div className="h-4 w-8 bg-slate-400 rounded"></div>
                                <div className="h-4 w-8 bg-slate-400 rounded"></div>
                                <div className="h-4 w-8 bg-slate-400 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-4 max-w-4xl mx-auto">
         <div className="bg-indigo-600 p-2 rounded-xl shrink-0">
             <ShieldCheck className="w-5 h-5 text-white" />
         </div>
         <div>
            <h4 className="text-xs font-black text-indigo-900 uppercase mb-1">Pembayaran Aman & Otomatis</h4>
            <p className="text-xs text-indigo-800 leading-relaxed font-medium">
            Transaksi diproses otomatis oleh Midtrans Payment Gateway (Support QRIS, GoPay, ShopeePay, Transfer Bank, Alfamart). Saldo koin akan bertambah instan setelah pembayaran sukses.
            </p>
         </div>
      </div>
    </div>
  );
};

export default TopupScreen;