
import React, { useState, useRef } from 'react';
import { Marketplace, FinancialReport, FinancialInput } from '../types';
import { analyzeFinancialHealth } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';
import { BookOpen, Wallet, TrendingUp, Users, Box, Calculator, Loader2, Bot, Plus, Trash2, AlertCircle, Download, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
    onRequestTopup: () => void;
}

const FinancialJournal: React.FC<Props> = ({ onRequestTopup }) => {
  const { deductCredit } = useUser();
  const [inputs, setInputs] = useState<FinancialInput[]>([
    { marketplace: Marketplace.SHOPEE, revenue: 0, adSpend: 0 },
    { marketplace: Marketplace.TIKTOK, revenue: 0, adSpend: 0 }
  ]);
  
  const [grossMarginPercent, setGrossMarginPercent] = useState<string>(''); 
  const [employeeCost, setEmployeeCost] = useState<string>('');
  const [operationalCost, setOperationalCost] = useState<string>('');
  
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  const updateInput = (index: number, field: keyof FinancialInput, value: string | Marketplace) => {
    const newInputs = [...inputs];
    if (field === 'marketplace') {
      newInputs[index].marketplace = value as Marketplace;
    } else {
      newInputs[index] = { ...newInputs[index], [field]: parseFloat(value as string) || 0 };
    }
    setInputs(newInputs);
  };

  const addInput = () => {
    setInputs([...inputs, { marketplace: Marketplace.TOKOPEDIA, revenue: 0, adSpend: 0 }]);
  };

  const removeInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const calculateReport = () => {
    const totalRevenue = inputs.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalAdSpendRaw = inputs.reduce((acc, curr) => acc + curr.adSpend, 0);
    const totalAdTax = totalAdSpendRaw * 0.11; 
    const totalAdSpendFinal = totalAdSpendRaw + totalAdTax;
    
    const marginPct = parseFloat(grossMarginPercent) || 0;
    const empCost = parseFloat(employeeCost) || 0;
    const opsCost = parseFloat(operationalCost) || 0;

    const grossProfit = totalRevenue * (marginPct / 100);
    const burnRate = totalAdSpendFinal + empCost + opsCost;
    const finalNetProfit = grossProfit - burnRate;

    const newReport: FinancialReport = {
      period: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      inputs,
      grossMarginPercent: marginPct,
      employeeCost: empCost,
      operationalCost: opsCost,
      totalRevenue,
      totalAdSpendRaw,
      totalAdTax,
      totalAdSpendFinal,
      grossProfit,
      finalNetProfit,
      burnRate
    };

    setReport(newReport);
    setAiAnalysis(null); 
  };

  const runAiAnalysis = async () => {
    if (!report) return;
    setLoadingAi(true);
    const canProceed = await deductCredit();
    if (!canProceed) {
        setLoadingAi(false);
        onRequestTopup();
        return;
    }
    try {
      const result = await analyzeFinancialHealth(report);
      setAiAnalysis(result);
    } catch (e) {
      alert("Gagal analisa AI");
    } finally {
      setLoadingAi(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setLoadingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan_Keuangan_${report?.period.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
      console.error("Gagal generate PDF", error);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20 lg:pb-0">
      
      {/* LEFT: FORM INPUTS */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-fit">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-8">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Input Jurnal Harian
        </h2>

        <div className="space-y-8">
          {/* 1. Omset & Iklan */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Wallet className="w-4 h-4 text-emerald-500" /> Pemasukan & Biaya Iklan
            </h3>
            {inputs.map((inp, idx) => (
              <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative group">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Marketplace</label>
                     <select 
                        value={inp.marketplace}
                        onChange={(e) => updateInput(idx, 'marketplace', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                     >
                       {Object.values(Marketplace).map(m => <option key={m} value={m}>{m}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Omset (Revenue)</label>
                     <div className="relative">
                        <span className="absolute left-3 top-3 text-xs text-slate-400">Rp</span>
                        <input 
                          type="number"
                          value={inp.revenue || ''}
                          onChange={(e) => updateInput(idx, 'revenue', e.target.value)}
                          className="w-full pl-8 p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700"
                          placeholder="0"
                        />
                     </div>
                   </div>
                   <div>
                     <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Budget Iklan</label>
                     <div className="relative">
                        <span className="absolute left-3 top-3 text-xs text-slate-400">Rp</span>
                        <input 
                          type="number"
                          value={inp.adSpend || ''}
                          onChange={(e) => updateInput(idx, 'adSpend', e.target.value)}
                          className="w-full pl-8 p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-rose-600"
                          placeholder="0"
                        />
                     </div>
                   </div>
                </div>
                {inputs.length > 1 && (
                  <button 
                    onClick={() => removeInput(idx)}
                    className="absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full shadow-md border border-slate-100 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addInput}
              className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl text-xs font-bold hover:bg-slate-50 hover:border-slate-400 flex items-center justify-center gap-2 transition-all uppercase tracking-wide"
            >
              <Plus className="w-4 h-4" /> Tambah Marketplace
            </button>
          </div>

          {/* 2. Biaya Operasional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                 <Box className="w-4 h-4 text-indigo-500" /> Margin Produk
               </h3>
               <div className="bg-white p-5 border border-slate-200 rounded-2xl">
                 <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Rata-rata Margin Bersih (%)</label>
                 <div className="relative">
                    <input 
                      type="number" 
                      value={grossMarginPercent}
                      onChange={(e) => setGrossMarginPercent(e.target.value)}
                      placeholder="Contoh: 30"
                      className="w-full p-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black"
                    />
                    <span className="absolute right-4 top-4 text-slate-500 font-bold">%</span>
                 </div>
               </div>
             </div>

             <div className="space-y-4">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                 <Users className="w-4 h-4 text-violet-500" /> Biaya Tetap
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Gaji Karyawan</label>
                    <input 
                      type="number" 
                      value={employeeCost}
                      onChange={(e) => setEmployeeCost(e.target.value)}
                      placeholder="0"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Operasional</label>
                    <input 
                      type="number" 
                      value={operationalCost}
                      onChange={(e) => setOperationalCost(e.target.value)}
                      placeholder="0"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                    />
                 </div>
               </div>
             </div>
          </div>
          
          <button 
            onClick={calculateReport}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-[2rem] font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all"
          >
            <Calculator className="w-5 h-5" /> HITUNG LAPORAN
          </button>
        </div>
      </div>

      {/* RIGHT: RESULT & AI */}
      <div className="space-y-6">
        {report && (
          <div className="animate-fade-up space-y-6">
            
            <div className="flex justify-between items-center">
                 <h3 className="text-lg font-black text-slate-800">Preview Laporan</h3>
                 <button 
                    onClick={downloadPDF}
                    disabled={loadingPdf}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                    {loadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    SIMPAN PDF
                </button>
            </div>

            {/* Area yang akan dicetak ke PDF */}
            <div ref={reportRef} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                
                {/* PDF Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-600 rounded-xl">
                         <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-800 tracking-tight">Laporan Keuangan</h3>
                         <p className="text-xs text-slate-500 font-bold uppercase mt-1">Periode: {report.period}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Generated by</p>
                      <p className="text-sm font-black text-indigo-600">SellerPintar AI</p>
                   </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                        <p className="text-xs text-emerald-600 font-black uppercase mb-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4"/> Total Omset
                        </p>
                        <p className="text-2xl font-black text-emerald-800">Rp {report.totalRevenue.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                        <p className="text-xs text-indigo-600 font-black uppercase mb-2">Gross Profit (Margin)</p>
                        <p className="text-2xl font-black text-indigo-800">Rp {report.grossProfit.toLocaleString('id-ID')}</p>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Rincian Burn Rate (Pengeluaran)</h4>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Total Iklan (Saldo)</span>
                        <span className="font-bold text-rose-600">Rp {report.totalAdSpendRaw.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-orange-500" /> Pajak Iklan (PPN 11%)
                        </span>
                        <span className="font-bold text-orange-600">Rp {report.totalAdTax.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="border-t border-dashed border-slate-200 my-1"></div>
                        <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Gaji Karyawan</span>
                        <span className="font-bold text-slate-800">Rp {report.employeeCost.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Biaya Operasional</span>
                        <span className="font-bold text-slate-800">Rp {report.operationalCost.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="bg-rose-50 p-4 rounded-xl flex justify-between items-center mt-2">
                            <span className="text-xs font-black text-rose-800 uppercase">Total Pengeluaran</span>
                            <span className="text-base font-black text-rose-800">Rp {report.burnRate.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>

                {/* NET PROFIT FINAL */}
                <div className={`rounded-3xl p-8 text-white text-center shadow-xl ${report.finalNetProfit >= 0 ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-red-600 to-rose-600'}`}>
                    <p className="text-sm font-bold opacity-90 mb-2 uppercase tracking-widest">PROFIT BERSIH (NET PROFIT)</p>
                    <h3 className="text-4xl font-black">Rp {report.finalNetProfit.toLocaleString('id-ID')}</h3>
                    {report.finalNetProfit < 0 && <p className="text-xs mt-3 bg-white/20 inline-block px-4 py-1.5 rounded-full font-bold">⚠️ Bisnis Anda sedang merugi</p>}
                </div>
            </div>

            {/* AI Analysis Section */}
            {!aiAnalysis ? (
              <button 
                onClick={runAiAnalysis}
                disabled={loadingAi}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[2rem] font-black text-sm shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
              >
                {loadingAi ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    CFO AI Sedang Menganalisa...
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5" />
                    ANALISA KESEHATAN BISNIS (AI) - 1 KREDIT
                  </>
                )}
              </button>
            ) : (
              <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 animate-fade-in">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-indigo-900">Analisa CFO Virtual</h3>
                 </div>
                 <div className="prose prose-sm prose-indigo max-w-none text-slate-700 leading-relaxed">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                 </div>
                 <button 
                   onClick={() => setAiAnalysis(null)}
                   className="mt-6 text-xs font-black text-indigo-600 hover:underline uppercase tracking-wide"
                 >
                   Tutup Analisa
                 </button>
              </div>
            )}
            
          </div>
        )}
      </div>

    </div>
  );
};

export default FinancialJournal;
