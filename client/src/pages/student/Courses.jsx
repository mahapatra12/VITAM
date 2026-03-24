import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  Clock, 
  Award,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';

const StudentCourses = () => {
  const [resourceModal, setResourceModal] = useState({ show: false, course: null });
  const [continueModal, setContinueModal] = useState({ show: false, course: null });

  const resources = {
    'AI-401': ['Lecture Slides Week 1–8 (PDF)', 'AIMA Textbook (Russell & Norvig)', 'Lab Manual: Search Algorithms', 'Assignment 3: Constraint Satisfaction', 'Past Papers 2023-2025'],
    'CS-302': ['OS Concepts — Silberschatz PDF', 'Lab Practice: Process Scheduling', 'Video: Memory Management (2 hrs)', 'Quiz Archive: Chapters 1–6', 'Shell Scripting Guide'],
    'AI-402': ['Deep Learning — Goodfellow PDF', 'PyTorch Tutorial Series (8 hrs)', 'Lab 3: CNN Implementation', 'Transformer Architecture Notes', 'Research Papers: Attention Is All You Need'],
    'CS-201': ['CLRS Textbook PDF', 'LeetCode Practice Set (100 problems)', 'Video: Tree Traversal Animations', 'Sorting Algorithm Cheatsheet', 'Final Revision Guide'],
  };
  const courses = [
    { code: "AI-401", name: "Artificial Intelligence", progress: 65, instructor: "Dr. Rajesh Kumar", nextLecture: "Tomorrow, 10:00 AM" },
    { code: "CS-302", name: "Operating Systems", progress: 40, instructor: "Prof. Priya Sharma", nextLecture: "Today, 2:00 PM" },
    { code: "AI-402", name: "Neural Networks", progress: 85, instructor: "Dr. Amit Singh", nextLecture: "Friday, 11:30 AM" },
    { code: "CS-201", name: "Data Structures", progress: 100, instructor: "Ms. Neha Gupta", nextLecture: "Completed" },
  ];

  return (
    <DashboardLayout title="Academic Journey" role="STUDENT">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Curriculum</h2>
          <p className="text-slate-500 font-medium tracking-tight">Managing 4 enrolled courses this semester</p>
        </div>
        <div className="flex gap-3">
          <GlassCard className="!p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-black text-xs">A</div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Target GPA: 3.8</span>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={course.code}
          >
            <GlassCard className="group hover:border-appleBlue/20 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-appleBlue border border-slate-100 group-hover:scale-110 transition-transform">
                    <BookOpen size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-0.5">{course.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{course.instructor}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors"><MoreVertical size={20} /></button>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                  <span className="text-slate-400">Course Progress</span>
                  <span className="text-appleBlue">{course.progress}%</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-appleBlue'}`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={14} className="text-appleBlue" />
                    <span className="text-xs font-bold">{course.nextLecture}</span>
                 </div>
                 {course.progress === 100 && (
                   <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Completed</span>
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setResourceModal({ show: true, course })} className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                    <FileText size={14} /> Resources
                 </button>
                 <button onClick={() => setContinueModal({ show: true, course })} className="flex-1 py-2.5 bg-appleBlue/5 text-appleBlue rounded-xl text-xs font-black uppercase tracking-widest hover:bg-appleBlue/10 transition-all flex items-center justify-center gap-2">
                    <PlayCircle size={14} /> Continue
                 </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Resources Modal */}
      <AnimatePresence>
        {resourceModal.show && resourceModal.course && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95}} className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative">
              <button onClick={() => setResourceModal({show:false,course:null})} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={18}/></button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-appleBlue/10 rounded-2xl flex items-center justify-center"><BookOpen size={20} className="text-appleBlue"/></div>
                <div>
                  <h3 className="font-black text-slate-900">{resourceModal.course.name}</h3>
                  <p className="text-xs text-slate-400 font-bold">{resourceModal.course.code} Resources</p>
                </div>
              </div>
              <div className="space-y-2">
                {(resources[resourceModal.course.code] || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <FileText size={14} className="text-appleBlue"/>
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 group-hover:text-appleBlue transition-colors"/>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue Modal */}
      <AnimatePresence>
        {continueModal.show && continueModal.course && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95}} className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative">
              <button onClick={() => setContinueModal({show:false,course:null})} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={18}/></button>
              <h3 className="font-black text-slate-900 text-lg mb-1">Continue Learning</h3>
              <p className="text-xs font-bold text-appleBlue uppercase tracking-widest mb-6">{continueModal.course.name}</p>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-appleBlue">{continueModal.course.progress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{width:0}} animate={{width:`${continueModal.course.progress}%`}} transition={{duration:0.8}} 
                    className={`h-full rounded-full ${continueModal.course.progress===100?'bg-green-500':'bg-appleBlue'}`}/>
                </div>
              </div>
              {continueModal.course.progress === 100 ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3"/>
                  <p className="font-black text-slate-900 text-lg">Course Completed! 🎉</p>
                  <p className="text-slate-500 text-sm mt-1">You've mastered {continueModal.course.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-bold text-slate-700 text-sm">Next up:</p>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="font-bold text-appleBlue">Continue from last session</p>
                    <p className="text-xs text-slate-500 mt-1">{continueModal.course.nextLecture}</p>
                  </div>
                  <button className="w-full apple-btn-primary py-3 flex items-center justify-center gap-2" onClick={() => setContinueModal({show:false,course:null})}>
                    <PlayCircle size={18}/> Launch Course Session
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default StudentCourses;
