import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, FileText, UploadCloud, ShieldCheck, Database, RefreshCw, X, File, CheckCircle2, ChevronRight, Fingerprint, FolderLock } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';

export default function Vault() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hash, setHash] = useState('');
  const [documents, setDocuments] = useState([
    { id: 1, name: "Institutional_Policy_v13.pdf", size: "2.4 MB", type: "PDF", date: "Today", hash: "0x8fa9...21c4", status: "Verified" },
    { id: 2, name: `${user?.role || 'User'}_Clearance_Form.docx`, size: "845 KB", type: "DOCX", date: "Yesterday", hash: "0x3bc1...99e2", status: "Encrypted" },
    { id: 3, name: "Security_Sync_Log.csv", size: "12 KB", type: "DATA", date: "Mar 18", hash: "0x11a0...44f0", status: "Verified" }
  ]);

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setHash('');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
           setHash('0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''));
           setTimeout(() => {
             setIsUploading(false);
             setDocuments([{
                id: Date.now(),
                name: "Secure_Upload_" + Math.floor(Math.random()*1000) + ".pdf",
                size: (Math.random() * 5 + 0.1).toFixed(1) + " MB",
                type: "PDF",
                date: "Just Now",
                hash: "0x" + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('') + "...a1",
                status: "Encrypted"
             }, ...documents]);
           }, 1000);
        }, 500);
      }
    }, 200);
  };

  return (
    <DashboardLayout title="Institutional Vault" role={user?.role || "STUDENT"}>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 italic">
          <FolderLock size={28} className="text-emerald-500" /> 
          Encrypted Asset Vault
        </h2>
        <p className="text-slate-400 font-medium mt-1 italic uppercase tracking-widest text-[10px]">AES-256 secure document storage mapped specifically for your institutional identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Zone */}
        <div className="lg:col-span-1">
          <GlassCard className="h-full flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                 <ShieldCheck size={18} className="text-emerald-400" />
                 <h3 className="text-sm font-black text-white uppercase tracking-widest italic">End-to-End Upload</h3>
              </div>
              
              <div className="p-6">
                {!isUploading ? (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSimulatedUpload}
                    className="border-2 border-dashed border-emerald-500/30 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-500/5 transition-all group"
                  >
                     <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                       <UploadCloud size={32} />
                     </div>
                     <h4 className="text-white font-black text-lg mb-1 italic">Select File</h4>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center italic">Drag & Drop or click to browse<br/>PDF, DOCX, CSV (Max 50MB)</p>
                  </motion.div>
                ) : (
                  <div className="border border-white/10 bg-black/40 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5">
                        <motion.div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${uploadProgress}%` }} />
                     </div>
                     
                     <div className="relative mb-6">
                       <Fingerprint size={48} className="text-emerald-500 opacity-20" />
                       <motion.div 
                         initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 1.5, ease: "linear" }}
                         className="absolute bottom-0 left-0 right-0 overflow-hidden"
                       >
                         <Fingerprint size={48} className="text-emerald-400" />
                       </motion.div>
                     </div>
                     
                     <div className="text-center w-full">
                       <p className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center justify-center gap-2 italic">
                         {uploadProgress < 100 ? ( <><RefreshCw size={12} className="animate-spin text-emerald-500"/> Encrypting Payload</>) : ( <><CheckCircle2 size={12} className="text-emerald-400" /> Generating Hash</>)}
                       </p>
                       <div className="text-[10px] font-mono text-slate-500 break-all h-8 italic uppercase tracking-widest">{'Awaiting system confirmation...'}</div>
                     </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-emerald-500/10 border-t border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2 rounded-b-3xl italic">
              <Lock size={12} /> Institutional Secure Environment Active
            </div>
          </GlassCard>
        </div>

        {/* Document Ledger */}
        <div className="lg:col-span-2">
          <GlassCard className="h-full">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Database size={18} className="text-blue-400" />
                 <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Internal Asset Directory</h3>
               </div>
               <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full text-white font-bold tracking-widest italic">{documents.length} Files</span>
            </div>
            
            <div className="p-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="p-4 text-[11px] uppercase tracking-[0.2em] font-black text-slate-600 w-1/2 italic">Asset Identification</th>
                      <th className="p-4 text-[11px] uppercase tracking-[0.2em] font-black text-slate-600 italic">Scale</th>
                      <th className="p-4 text-[11px] uppercase tracking-[0.2em] font-black text-slate-600 italic">Temporal/Sync</th>
                      <th className="p-4 text-[11px] uppercase tracking-[0.2em] font-black text-slate-600 italic">Status</th>
                      <th className="p-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {documents.map((doc, idx) => (
                        <motion.tr 
                          key={doc.id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/[0.02] group transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.type === 'PDF' ? 'bg-red-500/10 text-red-500' : doc.type === 'DOCX' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                <FileText size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{doc.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{doc.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs text-slate-400 font-mono">{doc.size}</td>
                          <td className="p-4">
                            <p className="text-xs text-slate-300 font-bold">{doc.date}</p>
                            <p className="text-[10px] text-emerald-500/50 font-mono mt-0.5">{doc.hash}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 w-max ${doc.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                              {doc.status === 'Verified' ? <CheckCircle2 size={10}/> : <Lock size={10}/>} {doc.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
