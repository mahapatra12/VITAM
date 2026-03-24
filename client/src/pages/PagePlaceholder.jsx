import DashboardLayout from '../layouts/DashboardLayout';
import { GlassCard } from '../components/ui/DashboardComponents';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

const PagePlaceholder = ({ title, role }) => {
  return (
    <DashboardLayout title={title} role={role}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div 
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="w-24 h-24 rounded-3xl bg-appleBlue/10 flex items-center justify-center text-appleBlue mb-6"
        >
          <Construction size={48} />
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{title}</h2>
        <p className="text-slate-500 font-medium max-w-md">
          Bhai, main is feature par kaam kar raha hoon! This module will be live in the next update. Stay tuned for advanced AI logic here.
        </p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <GlassCard className="opacity-50" />
          <GlassCard className="opacity-50" />
          <GlassCard className="opacity-50" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PagePlaceholder;
