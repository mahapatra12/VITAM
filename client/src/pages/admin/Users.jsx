import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, RefreshCcw, Server, Shield, Users as UsersIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard } from '../../components/ui/DashboardComponents';
import AdvancedDataGrid from '../../components/ui/AdvancedDataGrid';
import api from '../../utils/api';
import { useToast } from '../../components/ui/ToastSystem';

const formatRoleLabel = (role, subRole) => {
  const normalizedRole = String(role || '').toLowerCase();
  const normalizedSubRole = String(subRole || 'none').toLowerCase();

  if (normalizedRole === 'admin' && normalizedSubRole !== 'none') {
    return `ADMIN (${normalizedSubRole.replace(/_/g, ' ').toUpperCase()})`;
  }

  return String(role || 'UNKNOWN').replace(/_/g, ' ').toUpperCase();
};

const formatDateLabel = (value) => {
  if (!value) return 'Never';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Never';
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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
      val.includes('CHAIRMAN') || val.includes('DIRECTOR') ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
      val.includes('ADMIN') ? 'bg-red-500/10 text-red-400 border-red-500/30' :
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
  const { push } = useToast();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const applyUsers = (payload) => {
    setUsers(Array.isArray(payload) ? payload : []);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: { limit: 200 },
        cache: {
          maxAge: 30000,
          staleWhileRevalidate: true,
          revalidateAfter: 12000,
          persist: true,
          onUpdate: (response) => applyUsers(response?.data)
        }
      });
      applyUsers(data);
    } catch (err) {
      push({
        type: 'error',
        title: 'Failed to load users',
        body: err.response?.data?.msg || err.message || 'Unable to load user registry right now.'
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const tableRows = useMemo(() => users.map((user, index) => {
    const userId = String(user._id || user.id || '');
    const syntheticId = userId ? `USR-${userId.slice(-6).toUpperCase()}` : `USR-${String(index + 1).padStart(3, '0')}`;
    const hasRecentSession = Boolean(user.lastLogin);

    return {
      id: syntheticId,
      name: user.name || 'Unknown User',
      role: formatRoleLabel(user.role, user.subRole),
      email: user.email || '-',
      status: hasRecentSession ? 'Active' : 'Pending Setup',
      lastLogin: formatDateLabel(user.lastLogin)
    };
  }), [users]);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => Boolean(user.lastLogin)).length;
  const privilegedUsers = users.filter((user) => ['admin', 'chairman', 'director', 'superadmin'].includes(String(user.role || '').toLowerCase())).length;
  const pendingSetup = users.filter((user) => !user.lastLogin).length;

  return (
    <DashboardLayout title="Access Management Center" role="ADMIN">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Identity Registry</h2>
          <p className="mt-1 font-medium text-slate-400">Unified institutional user index and security state</p>
        </div>
        <button
          type="button"
          onClick={() => void loadUsers()}
          disabled={loadingUsers}
          className="btn-secondary px-4 py-2 disabled:opacity-60"
        >
          <RefreshCcw size={14} className={loadingUsers ? 'animate-spin' : ''} />
          {loadingUsers ? 'Refreshing...' : 'Refresh Registry'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Identities" value={String(totalUsers)} icon={UsersIcon} color="bg-blue-500" trend="Portal users" />
        <StatCard title="Active Sessions" value={String(activeUsers)} icon={Server} color="bg-emerald-500" />
        <StatCard title="Privileged Accounts" value={String(privilegedUsers)} icon={Shield} color="bg-amber-500" trend="Admin tier" />
        <StatCard title="Pending Setup" value={String(pendingSetup)} icon={Briefcase} color="bg-red-500" />
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <AdvancedDataGrid 
          title="Global Identity Registry"
          subtitle="Real-time access logs and privilege escalations"
          columns={COLUMNS}
          data={tableRows}
        />
      </motion.div>
    </DashboardLayout>
  );
}
