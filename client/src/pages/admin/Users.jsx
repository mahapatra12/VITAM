import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Shield, Briefcase, GraduationCap, Server } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import AdvancedDataGrid from '../../components/ui/AdvancedDataGrid';

const MOCK_USERS = [
  { id: 'USR-001', name: 'Dr. Alaric Sovereign', role: 'CHAIRMAN', email: 'chairman@vitam.edu.in', status: 'Active', lastLogin: '10 mins ago' },
  { id: 'USR-002', name: 'Prof. Meera Reddy', role: 'DIRECTOR', email: 'director@vitam.edu.in', status: 'Active', lastLogin: '1 hour ago' },
  { id: 'USR-003', name: 'Dr. Venkat Rao', role: 'PRINCIPAL', email: 'principal@vitam.edu.in', status: 'Active', lastLogin: '3 hours ago' },
  { id: 'USR-004', name: 'Anil Kumar', role: 'FINANCE', email: 'finance@vitam.edu.in', status: 'Active', lastLogin: '45 mins ago' },
  { id: 'USR-005', name: 'System Root', role: 'ADMIN', email: 'admin@vitam.edu', status: 'Active', lastLogin: 'Right now' },
  { id: 'USR-006', name: 'Dr. Sarah Thomas', role: 'HOD', email: 'hod_cse@vitam.edu.in', status: 'Offline', lastLogin: 'Yesterday' },
  { id: 'USR-007', name: 'Rajiv Sharma', role: 'EXAM', email: 'exam@vitam.edu.in', status: 'Active', lastLogin: '2 hours ago' },
  { id: 'USR-008', name: 'Sneha Patel', role: 'PLACEMENT', email: 'placement@vitam.edu.in', status: 'Active', lastLogin: '5 hours ago' },
  { id: 'USR-009', name: 'K. Raju', role: 'BUS', email: 'transport@vitam.edu.in', status: 'Offline', lastLogin: '2 days ago' },
  { id: 'USR-010', name: 'Dr. K. Srinivas', role: 'FACULTY', email: 'faculty@vitam.edu.in', status: 'Active', lastLogin: '8 hours ago' },
  { id: 'USR-011', name: 'Suresh Kumar', role: 'STUDENT', email: 'student@vitam.edu.in', status: 'Active', lastLogin: '15 mins ago' },
  { id: 'USR-012', name: 'Aman Singh', role: 'STUDENT', email: 'aman@vitam.edu.in', status: 'Suspended', lastLogin: 'Last month' },
  { id: 'USR-013', name: 'Priya Das', role: 'STUDENT', email: 'priya@vitam.edu.in', status: 'Active', lastLogin: '3 days ago' },
];

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'User Name', render: (val, row) => (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
        row.role === 'CHAIRMAN' || row.role === 'DIRECTOR' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
        row.role === 'ADMIN' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
        'bg-blue-500/10 border-blue-500/30 text-blue-500'
      }`}>
        <span className="text-xs font-black">{val.charAt(0)}</span>
      </div>
      <span className="font-bold text-white">{val}</span>
    </div>
  )},
  { key: 'role', label: 'Authority', render: (val) => (
    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
      val === 'CHAIRMAN' || val === 'DIRECTOR' ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
      val === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
      val === 'STUDENT' ? 'bg-slate-800 text-slate-300 border-slate-700' :
      'bg-blue-500/10 text-blue-400 border-blue-500/30'
    }`}>
      {val}
    </span>
  )},
  { key: 'email', label: 'Email Address', render: (val) => <span className="text-slate-400 text-xs font-mono">{val}</span> },
  { key: 'status', label: 'Network State', render: (val) => (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${val === 'Active' ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20' : val === 'Offline' ? 'bg-slate-500' : 'bg-red-500'}`} />
      <span className={`text-xs font-bold ${val === 'Active' ? 'text-emerald-400' : val === 'Offline' ? 'text-slate-400' : 'text-red-400'}`}>{val}</span>
    </div>
  )},
  { key: 'lastLogin', label: 'Last Check-In', render: (val) => <span className="text-slate-500 text-xs font-medium">{val}</span> },
];

export default function GlobalUsers() {
  return (
    <DashboardLayout title="Access Management Center" role="ADMIN">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Identity Registry</h2>
        <p className="text-slate-400 font-medium mt-1">Unified institutional user index and security state</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Identities" value="4,245" icon={UsersIcon} color="bg-blue-500" trend="+12 this week" />
        <StatCard title="Active Sessions" value="2,180" icon={Server} color="bg-emerald-500" />
        <StatCard title="Privileged Accounts" value="14" icon={Shield} color="bg-amber-500" trend="SysAdmins" />
        <StatCard title="Suspended / Locked" value="8" icon={Briefcase} color="bg-red-500" />
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <AdvancedDataGrid 
          title="Global Identity Registry"
          subtitle="Real-time access logs and privilege escalations"
          columns={COLUMNS}
          data={MOCK_USERS}
        />
      </motion.div>
    </DashboardLayout>
  );
}
