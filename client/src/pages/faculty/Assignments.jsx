import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, Users, AlertCircle, CheckCircle2, Clock, 
  ChevronRight, Layout, LayoutList, GripHorizontal
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import AIChat from '../../components/AIChat';

const INITIAL_ASSIGNMENTS = [
  { id: 1, title: 'AI Ethics - Case Study', course: 'AI-401', dueDate: '2026-03-20', sub: 45, max: 52, status: 'Active' },
  { id: 2, title: 'Mini Project Phase 1', course: 'CS-302', dueDate: '2026-03-15', sub: 52, max: 52, status: 'Completed' },
  { id: 3, title: 'Neural Networks Lab 3', course: 'AI-402', dueDate: '2026-03-25', sub: 12, max: 52, status: 'Pending' },
  { id: 4, title: 'System Architecture Diagram', course: 'CS-304', dueDate: '2026-03-22', sub: 30, max: 52, status: 'Active' },
];

export default function FacultyAssignments() {
  const [viewMode, setViewMode] = useState('grid');
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30', lightBg: 'bg-emerald-500/10', hover: 'hover:border-emerald-500/50' };
      case 'Active': return { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', lightBg: 'bg-blue-500/10', hover: 'hover:border-blue-500/50' };
      case 'Pending': return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30', lightBg: 'bg-amber-500/10', hover: 'hover:border-amber-500/50' };
      default: return { bg: 'bg-slate-500', text: 'text-slate-400', border: 'border-slate-500/30', lightBg: 'bg-slate-500/10', hover: 'hover:border-slate-500/50' };
    }
  };

  return (
    <DashboardLayout title="Assignment Management" role="FACULTY">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Course Lab & Work</h2>
          <p className="text-slate-400 font-medium mt-1">Kanban task matrix for monitoring student submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800/80 rounded-xl p-1 border border-slate-700">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              <Layout size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              <LayoutList size={16} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Plus size={16} /> New Assignment
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
        <AnimatePresence>
          {assignments.map((task, i) => {
            const color = getStatusColor(task.status);
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                key={task.id}
                className={viewMode === 'list' ? "w-full" : ""}
              >
                <GlassCard className={`relative group cursor-pointer ${color.hover} transition-all ${viewMode==='list' ? 'flex items-center justify-between p-4' : ''}`}>
                  {/* Kanban Top Action Handle */}
                  {viewMode === 'grid' && (
                    <div className="absolute top-4 right-4 text-slate-600 group-hover:text-slate-400 transition-colors">
                      <GripHorizontal size={18} />
                    </div>
                  )}

                  <div className={viewMode === 'list' ? "flex items-center gap-6" : ""}>
                    <div className="mb-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border tracking-widest ${color.lightBg} ${color.text} ${color.border}`}>
                        {task.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white mb-1 group-hover:text-blue-400 transition-colors">{task.title}</h3>
                      <p className="text-xs text-slate-400 font-mono font-bold mb-4">{task.course}</p>
                    </div>

                    <div className={viewMode === 'list' ? "flex items-center gap-8 ml-8" : "space-y-3"}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-medium flex items-center gap-2"><Calendar size={14}/> Due Date</span>
                        <span className="text-white font-bold">{task.dueDate}</span>
                      </div>
                      
                      <div className={viewMode === 'grid' ? "w-full space-y-2" : "flex flex-col w-48"}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 font-medium flex items-center gap-2"><Users size={14}/> Returns</span>
                          <span className="text-white font-bold">{task.sub} / {task.max}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color.bg}`} style={{ width: `${(task.sub/task.max)*100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {viewMode === 'list' && (
                    <button className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-slate-700">
                      <ChevronRight size={18} />
                    </button>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AIChat role="faculty" />
    </DashboardLayout>
  );
}
