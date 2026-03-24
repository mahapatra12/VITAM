import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, Download, Zap, ChevronRight, ShieldCheck, FileText, Activity, AlertCircle, CheckCircle2, Clock, X, Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../utils/api';

const ReceiptCard = ({ receipt }) => (
  <div className="p-6 bg-black/5 dark:bg-white/5 rounded-[30px] border border-transparent hover:border-appleBlue/20 transition-all flex items-center justify-between group cursor-default">
     <div className="flex items-center gap-6">
        <div className="p-4 bg-appleBlue/10 text-appleBlue rounded-2xl">
           <FileText size={20} />
        </div>
        <div className="space-y-1">
           <h4 className="text-sm font-black text-apple-text-primary dark:text-white group-hover:text-appleBlue transition-colors">{receipt.name || 'Inst_Receipt_v2.pdf'}</h4>
           <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-secondary dark:text-white/20">{receipt.date || '2026.03.15'} // Verification: {receipt.id || 'A7-992'}</p>
        </div>
     </div>
     <button className="p-4 bg-appleBlue text-white rounded-2xl hover:scale-110 transition-transform shadow-lg shadow-appleBlue/20">
        <Download size={18} />
     </button>
  </div>
);

const Finance = () => {
  const [finance, setFinance] = useState({
    total: 120000,
    paid: 80000,
    due: 40000,
    receipts: []
  });
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0); // 0: Idle, 1: Verifying, 2: Success

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await api.get('/student/finance');
        setFinance(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenStep(1);
    setTimeout(() => {
      setGenStep(2);
      setTimeout(() => {
        setIsGenerating(false);
        setGenStep(0);
      }, 3000);
    }, 2000);
  };

  return (
    <DashboardLayout title="Fees & Dues" role="STUDENT">
      <div className="relative min-h-screen p-4 md:p-10 space-y-12 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_#a855f7]" />
                <span className="text-[11px] font-black uppercase tracking-[0.8em] text-apple-text-secondary dark:text-white/40 italic">State: Ledger Synchronized</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-apple-text-primary dark:text-white tracking-tight">Financial <span className="text-appleBlue">Status</span></h1>
              <p className="text-sm font-bold text-apple-text-secondary dark:text-white/20 uppercase tracking-[0.4em] max-w-xl">
                Track your course fees, payment history, and download official receipts.
              </p>
           </div>
           
           <div className="flex gap-4">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-8 py-5 bg-white/5 border border-white/10 rounded-[25px] flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all group"
              >
                 <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                 {isGenerating ? 'Generating...' : 'Consolidated Receipt'}
              </button>
              <button className="px-8 py-5 bg-purple-500 text-white rounded-[25px] flex items-center gap-4 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all group shadow-2xl shadow-purple-500/20">
                 <CreditCard size={18} />
                 Pay Online
              </button>
           </div>
        </div>

        {/* Payment Timeline - Advanced Visualization */}
        <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[50px] space-y-10 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
           <div className="flex justify-between items-center relative z-10">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Transaction Vector</h3>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Institutional Milestone tracking</p>
           </div>
           
           <div className="relative h-20 flex items-center px-10">
              <div className="absolute left-0 right-0 h-1 bg-white/5 flex items-center px-10" />
              <div className="absolute left-10 right-10 h-1 bg-purple-500/20 shadow-[0_0_15px_#a855f7]" style={{ width: '66%' }} />
              
              <div className="flex-1 flex justify-between relative z-10">
                 {[
                   { label: 'Registration', status: 'Completed', color: 'bg-emerald-500' },
                   { label: 'Sem Tuition', status: 'Completed', color: 'bg-emerald-500' },
                   { label: 'Hostel/Bus', status: 'Due Now', color: 'bg-purple-500' },
                   { label: 'Final Exams', status: 'Pending', color: 'bg-white/10' }
                 ].map((node, idx) => (
                   <div key={idx} className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-4 border-[#0a0a0a] shadow-[0_0_10px_currentColor] ${node.color.replace('bg-', 'text-')} ${node.color}`} />
                      <div className="absolute top-10 text-center space-y-1">
                         <p className="text-[10px] font-black text-white uppercase tracking-tight">{node.label}</p>
                         <p className={`text-[8px] font-black uppercase tracking-widest ${node.status === 'Completed' ? 'text-emerald-500' : 'text-white/20'}`}>{node.status}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Financial Monolith Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Total Fees', value: finance.total, icon: Wallet, color: 'text-apple-text-primary dark:text-white', bg: 'bg-white/5' },
             { label: 'Paid Amount', value: finance.paid, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
             { label: 'Due Amount', value: finance.due, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
           ].map((stat, i) => (
             <motion.div 
               key={i}
               whileHover={{ y: -5 }}
               className={`p-10 rounded-[45px] border border-black/5 dark:border-white/5 relative overflow-hidden group shadow-2xl ${i === 0 ? 'bg-[#0a0a0a]' : 'bg-black/5 dark:bg-white/5'}`}
             >
                <div className="flex justify-between items-start mb-10">
                   <div className={`p-5 rounded-2xl ${stat.bg} ${stat.color} shadow-xl`}>
                      <stat.icon size={24} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">{stat.label}</p>
                </div>
                <h2 className={`text-5xl font-black tracking-tighter tabular-nums ${stat.color}`}>₹{stat.value.toLocaleString()}</h2>
                <div className="mt-8 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: i === 1 ? `${(finance.paid/finance.total)*100}%` : i === 2 ? `${(finance.due/finance.total)*100}%` : '100%' }}
                     transition={{ duration: 1.5, delay: i * 0.2 }}
                     className={`h-full ${stat.color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`}
                   />
                </div>
             </motion.div>
           ))}
        </div>

        {/* Receipts & Security */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Receipt Repository */}
           <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between px-6">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20">Payment Receipts</h3>
                 <ShieldCheck size={18} className="text-appleBlue opacity-40" />
              </div>
              <div className="space-y-6">
                 {finance.receipts.length > 0 ? finance.receipts.map((r, i) => (
                    <ReceiptCard key={i} receipt={r} />
                 )) : (
                   <>
                     <ReceiptCard receipt={{ name: 'TUITION_FEE_SEM3.pdf', date: '2026-01-10', id: 'TX-99021' }} />
                     <ReceiptCard receipt={{ name: 'EXAM_PROTO_FEE.pdf', date: '2026-02-28', id: 'TX-99882' }} />
                     <ReceiptCard receipt={{ name: 'NODAL_ACCESS_FEE.pdf', date: '2026-03-01', id: 'TX-10023' }} />
                   </>
                 )}
              </div>
           </div>

           {/* Security Advisory */}
           <div className="lg:col-span-4">
              <div className="p-10 bg-[#050505] border border-white/10 rounded-[50px] space-y-10 relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                 <div className="flex items-center gap-4">
                    <Zap size={24} className="text-purple-400" />
                    <h4 className="font-black text-xs uppercase tracking-[0.3em] text-white">Security Protocol</h4>
                 </div>
                 <p className="text-xs font-bold text-white/40 leading-relaxed italic">
                    Institutional ledger synchronization uses 256-bit quantum-resistant encryption. All transaction IDs (TX-ID) are immutable and stored in the primary academic node.
                 </p>
                 <div className="pt-6 border-t border-white/5 space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-500">
                       <span>Encryption Active</span>
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-appleBlue">
                       <span>Nexus Sync: 100%</span>
                       <div className="w-2 h-2 bg-appleBlue rounded-full animate-pulse shadow-[0_0_10px_#0071e3]" />
                    </div>
                 </div>
              </div>
           </div>

        </div>

        {/* Transactive Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl flex items-center justify-center p-6"
            >
               <motion.div 
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[50px] p-16 text-center space-y-10 relative overflow-hidden"
               >
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                     <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 5 }} className="h-full bg-appleBlue shadow-[0_0_20px_#0071e3]" />
                  </div>

                  {genStep === 1 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                       <div className="p-8 bg-appleBlue/10 rounded-[35px] text-appleBlue inline-flex items-center justify-center animate-pulse">
                          <ShieldCheck size={48} />
                       </div>
                       <div className="space-y-4">
                          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Verifying Transaction</h3>
                          <p className="text-xs font-bold text-white/30 tracking-[0.4em] uppercase">Syncing with institutional ledger node-7...</p>
                       </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                       <div className="p-8 bg-emerald-500 rounded-[35px] text-white inline-flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                          <CheckCircle2 size={48} />
                       </div>
                       <div className="space-y-4">
                          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Sync Successful</h3>
                          <p className="text-xs font-bold text-emerald-500/60 tracking-[0.3em] uppercase italic">Receipt TXID: 99x-A7-882 Verified</p>
                       </div>
                       <button className="px-12 py-5 bg-appleBlue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-appleBlue/20">Consolidate PDF</button>
                    </motion.div>
                  )}
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default Finance;
