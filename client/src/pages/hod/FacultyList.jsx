import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, GraduationCap, Award, Brain } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard } from '../../components/ui/DashboardComponents';
import AdvancedDataGrid from '../../components/ui/AdvancedDataGrid';

const FACULTY_LIST = [
  { id: 'FAC-701', name: 'Dr. Sarah Thomas', dept: 'CSE', specialization: 'Machine Learning', exp: '12 Yrs', rating: 4.8 },
  { id: 'FAC-702', name: 'Prof. Anirudh Singh', dept: 'CSE', specialization: 'Network Sec', exp: '8 Yrs', rating: 4.5 },
  { id: 'FAC-703', name: 'Dr. Venkat R', dept: 'CSE', specialization: 'Data Science', exp: '15 Yrs', rating: 4.9 },
  { id: 'FAC-704', name: 'K. Lakshmi', dept: 'CSE', specialization: 'Algorithms', exp: '5 Yrs', rating: 4.2 },
  { id: 'FAC-705', name: 'S. Naidu', dept: 'CSE', specialization: 'Cloud Computing', exp: '10 Yrs', rating: 4.4 },
  { id: 'FAC-706', name: 'Dr. B. Prasad', dept: 'CSE', specialization: 'AI / Robotics', exp: '18 Yrs', rating: 4.9 },
  { id: 'FAC-707', name: 'M. Kavitha', dept: 'CSE', specialization: 'Web Tech', exp: '4 Yrs', rating: 4.1 },
  { id: 'FAC-708', name: 'P. Ravi', dept: 'CSE', specialization: 'Software Engg', exp: '7 Yrs', rating: 4.3 },
];

const COLUMNS = [
  { key: 'id', label: 'Emp ID', render: (val) => <span className="font-mono text-xs text-slate-400 font-bold">{val}</span> },
  { key: 'name', label: 'Professor Name', render: (val, row) => (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <GraduationCap size={16} />
      </div>
      <div>
        <p className="font-bold text-white text-sm">{val}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{row.dept} Department</p>
      </div>
    </div>
  )},
  { key: 'specialization', label: 'Core Specialization', render: (val) => (
    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700 font-black text-[10px] tracking-wider uppercase">
      {val}
    </span>
  )},
  { key: 'exp', label: 'Experience' },
  { key: 'rating', label: 'Student Rating', render: (val) => (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(star => (
          <span key={star} className={`text-[10px] ${star <= Math.round(val) ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
        ))}
      </div>
      <span className="text-white font-black text-sm">{val}</span>
    </div>
  )},
];

export default function FacultyList() {
  return (
    <DashboardLayout title="Department Roster" role="HOD">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Faculty Intelligence</h2>
        <p className="text-slate-400 font-medium mt-1">Resource allocation, professor ratings, and spec tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Faculty" value="28" icon={Users} color="bg-blue-500" />
        <StatCard title="Avg Experience" value="9.4" icon={BookOpen} color="bg-purple-500" trend="Years" />
        <StatCard title="PhDs Holders" value="12" icon={GraduationCap} color="bg-emerald-500" trend="+2 this year" />
        <StatCard title="Avg Rating" value="4.5" icon={Award} color="bg-amber-500" trend="Out of 5" />
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <AdvancedDataGrid 
          title="Senior & Junior Faculty Map"
          subtitle="Sort by performance rating or search by specialization"
          columns={COLUMNS}
          data={FACULTY_LIST}
        />
      </motion.div>
    </DashboardLayout>
  );
}
