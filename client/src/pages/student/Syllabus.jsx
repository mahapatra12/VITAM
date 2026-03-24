import { BookOpen, FileText, Download, Layers, ShieldCheck, ChevronRight, Search, Zap, CheckCircle2, Sparkles, X, Eye, Users, MessageSquare, Activity } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../utils/api';

const SubjectCard = ({ subject, onStudy }) => {
  const [completedUnits, setCompletedUnits] = useState([1]);
  const units = [1, 2, 3, 4, 5];
  const progress = (completedUnits.length / units.length) * 100;

  const toggleUnit = (unit) => {
    setCompletedUnits(prev => 
      prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
    );
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-[#0a0a0a] rounded-[40px] border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden group"
    >
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-appleBlue/5 rounded-full blur-3xl group-hover:bg-appleBlue/10 transition-colors" />
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 rounded-2xl bg-appleBlue/10 text-appleBlue">
          <BookOpen size={24} />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-appleBlue uppercase tracking-widest">{Math.round(progress)}% Mastery</span>
           <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} className="h-full bg-appleBlue" />
           </div>
        </div>
      </div>
      
      <h3 className="text-xl font-black text-apple-text-primary dark:text-white tracking-tight mb-6 group-hover:text-appleBlue transition-colors uppercase italic">{subject.name}</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-2">
           {units.map(u => (
             <button 
               key={u}
               onClick={() => toggleUnit(u)}
               className={`h-10 rounded-xl border flex items-center justify-center transition-all ${completedUnits.includes(u) ? 'bg-appleBlue border-appleBlue text-white shadow-[0_0_10px_#0071e3]' : 'bg-white/5 border-white/5 text-white/20 hover:border-white/20'}`}
             >
               <span className="text-[10px] font-black">U{u}</span>
             </button>
           ))}
        </div>

        <div className="space-y-3">
          {(subject.materials || ['Introduction.pdf', 'Module_Analysis.idx']).map((mat, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-black/10 transition-all cursor-pointer group/mat">
              <div className="flex items-center gap-3">
                <FileText size={14} className="text-appleBlue/40" />
                <span className="text-xs font-bold text-apple-text-primary dark:text-white/60 group-hover/mat:text-white transition-colors">{mat}</span>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => onStudy(mat, subject.name)} className="p-2 hover:bg-appleBlue/10 rounded-lg text-appleBlue opacity-0 group-hover/mat:opacity-100 transition-all">
                    <Eye size={14} />
                 </button>
                 <Download size={14} className="text-apple-text-secondary dark:text-white/10 group-hover/mat:text-appleBlue transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => onStudy(subject.materials?.[0] || "Module_V1.pdf", subject.name)}
        className="w-full mt-10 py-5 bg-appleBlue text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-appleBlue/20 hover:scale-[1.02] transition-all"
      >
         Initiate Deep Study
      </button>
    </motion.div>
  );
};

const Syllabus = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studyItem, setStudyItem] = useState(null); // { name, subject }

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const res = await api.get('/student/academics');
        setSyllabus(res.data.syllabus || []);
      } catch (err) {
        setSyllabus([
          { name: "Advanced Algorithms", materials: ["Intro_to_Algos.pdf", "Complexity.docx"] },
          { name: "Quantum Computing Foundations", materials: ["Qubits_101.pdf", "Entanglement.idx"] },
          { name: "Global Security Systems", materials: ["Sovereign_Sec.pdf"] },
          { name: "Institutional Logic", materials: ["Logic_Core.pdf"] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, []);

  return (
    <DashboardLayout title="Course Syllabus" role="STUDENT">
      <div className="relative min-h-screen p-4 md:p-10 space-y-12 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-appleBlue rounded-full animate-pulse shadow-[0_0_10px_#0071e3]" />
                <span className="text-[11px] font-black uppercase tracking-[0.8em] text-apple-text-secondary dark:text-white/40">Repository: v4.2.0-Alpha</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-apple-text-primary dark:text-white tracking-tight">Academic <span className="text-appleBlue text-appleBlue">Syllabus</span></h1>
              <p className="text-sm font-bold text-apple-text-secondary dark:text-white/20 uppercase tracking-[0.4em] max-w-xl">
                Access your course modules, learning materials, and study resources.
              </p>
           </div>
           
           <div className="relative group w-full md:w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-apple-text-secondary dark:text-white/20 group-focus-within:text-appleBlue transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Locate Module..." 
                className="w-full bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[25px] h-16 pl-16 pr-8 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-appleBlue/40 transition-all shadow-xl"
              />
           </div>
        </div>

        {/* Global Summary & Nexus Trigger */}
        <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[50px] relative overflow-hidden flex flex-col md:flex-row items-center gap-12 group cursor-default shadow-2xl">
           <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layers size={120} className="text-appleBlue" />
           </div>
           
           <div className="flex items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-appleBlue rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-appleBlue/20">
                 <ShieldCheck size={36} />
              </div>
              <div className="space-y-1">
                 <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic">Institutional <span className="text-appleBlue">Registry</span></h4>
                 <p className="text-[10px] font-black uppercase tracking-widest text-appleBlue/60">Node Verified // SYNCED</p>
              </div>
           </div>
           
           <div className="h-[1px] md:h-12 w-full md:w-[1px] bg-white/5 relative z-10" />
           
           <div className="flex gap-10 relative z-10 flex-1">
              <div className="text-center md:text-left">
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Saturation</p>
                 <p className="text-xl font-black text-white italic">42% Complete</p>
              </div>
              <button className="ml-auto px-8 py-4 bg-appleBlue text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-appleBlue/20 flex items-center gap-4">
                 <Users size={14} />
                 Enter Study Nexus
              </button>
           </div>
        </div>

        {/* Syllabus Nexus Matrix */}
        <div className="p-10 bg-[#050505] border border-white/10 rounded-[50px] relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-appleBlue/5 to-transparent pointer-events-none" />
           <div className="flex justify-between items-center mb-10">
              <div className="space-y-1">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Nexus Peer Presence</h3>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Real-time collaborative synthesis indicators</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">128 Scholars Active</span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'Neural Nets', active: 14, state: 'Critical' },
                { name: 'Algorithmic Synthesis', active: 28, state: 'Peak' },
                { name: 'Quantum Core', active: 8, state: 'Emerging' },
                { name: 'Cyber Sentinel', active: 18, state: 'High' }
              ].map((n, i) => (
                <div key={i} className="space-y-4 p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-appleBlue/20 transition-all cursor-pointer group/peer">
                   <div className="flex justify-between items-start">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(p => (
                          <div key={p} className="w-8 h-8 rounded-full border-2 border-[#050505] bg-appleBlue/20 flex items-center justify-center text-[7px] font-black text-appleBlue">
                            S{p}
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-[#050505] bg-white/10 flex items-center justify-center text-[7px] font-black text-white/40">
                          +{n.active - 3}
                        </div>
                      </div>
                      <Activity size={14} className="text-appleBlue opacity-20 group-hover/peer:opacity-100 transition-opacity" />
                   </div>
                   <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover/peer:text-white transition-colors">{n.name}</h4>
                   <div className="flex items-center gap-3">
                      <MessageSquare size={10} className="text-appleBlue/40" />
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Flow: {n.state}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Syllabus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {syllabus.map((subject, i) => (
            <SubjectCard key={i} subject={subject} onStudy={(name, sub) => setStudyItem({ name, sub })} />
          ))}
        </div>

        {/* Study Mode Overlay */}
        <AnimatePresence>
          {studyItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl flex flex-col"
            >
               <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                     <div className="p-4 bg-appleBlue rounded-2xl text-white">
                        <BookOpen size={24} />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest italic">{studyItem.sub}</h2>
                        <p className="text-[10px] font-black text-appleBlue uppercase tracking-[0.4em]">{studyItem.name}</p>
                     </div>
                  </div>
                  <button onClick={() => setStudyItem(null)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all">
                     <X size={24} />
                  </button>
               </div>

               <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                  <div className="lg:col-span-8 p-10 flex flex-col items-center justify-center space-y-10 group overflow-y-auto">
                     <div className="w-full max-w-4xl h-[80vh] bg-[#0a0a0a] rounded-[50px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-20 text-center space-y-10 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-appleBlue/20">
                           <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 60 }} className="h-full bg-appleBlue" />
                        </div>
                        <FileText size={80} className="text-appleBlue opacity-20" />
                        <div>
                           <h3 className="text-3xl font-black text-white mb-4">MATERIAL PREVIEW UNAVAILABLE</h3>
                           <p className="text-sm font-bold text-white/20 uppercase tracking-widest italic">Institutional sandbox restricted: Use 'Download' for full access.</p>
                        </div>
                        <div className="flex gap-4">
                           <button className="px-10 py-5 bg-appleBlue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl">Download Manifold</button>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-4 border-l border-white/5 p-10 space-y-10 bg-black/20 overflow-y-auto">
                     <div className="p-8 bg-appleBlue/5 border border-appleBlue/20 rounded-[40px] space-y-6">
                        <div className="flex items-center gap-4 text-appleBlue">
                           <Sparkles size={20} />
                           <h4 className="text-[10px] font-black uppercase tracking-[0.4em]">AI Synthesis</h4>
                        </div>
                        <p className="text-xs font-bold text-white/60 leading-relaxed italic">
                           "This module covers the fundamental architectures of {studyItem.sub}, focusing on high-speed optimization and recursive structures. Key takeaways include the application of Institutional Logic and Sovereign Security protocols."
                        </p>
                     </div>

                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20">Contextual Meta</h4>
                        {[
                          { label: 'Complexity', value: 'High' },
                          { label: 'Relevance', value: 'Critical' },
                          { label: 'Time to Mastery', value: '45 mins' },
                        ].map((m, i) => (
                          <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-transparent hover:border-white/10 transition-all">
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{m.label}</span>
                             <span className="text-xs font-black text-white italic">{m.value}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default Syllabus;
