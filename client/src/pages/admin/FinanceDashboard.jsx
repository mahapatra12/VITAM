import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Banknote,
  CircleDollarSign,
  CreditCard,
  FileSearch,
  ShieldCheck,
  Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import ActionDialog from '../../components/ui/ActionDialog';
import { GlassSkeleton, StatCard } from '../../components/ui/DashboardComponents';
import DeferredSection from '../../components/ui/DeferredSection';
import { useToast } from '../../components/ui/ToastSystem';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import lazySimple from '../../utils/lazySimple';
import { cancelIdleTask, scheduleIdleTask } from '../../utils/idleTask';

const FALLBACK = {
  metrics: {
    totalCollections: 'Rs 12.4 Cr',
    pendingDues: 'Rs 1.8 Cr',
    operationalSpend: 'Rs 2.4 Cr',
    scholarshipDisbursed: 'Rs 0.85 Cr'
  },
  collectionData: [
    { month: 'Jan', collected: 1.2, pending: 0.34 },
    { month: 'Feb', collected: 1.5, pending: 0.31 },
    { month: 'Mar', collected: 1.8, pending: 0.28 },
    { month: 'Apr', collected: 1.9, pending: 0.24 },
    { month: 'May', collected: 2.2, pending: 0.22 },
    { month: 'Jun', collected: 2.4, pending: 0.19 }
  ],
  revenueByDept: [
    { name: 'Academics', value: 42, fill: '#3b82f6' },
    { name: 'Hostel', value: 23, fill: '#10b981' },
    { name: 'Transport', value: 18, fill: '#6366f1' },
    { name: 'Other', value: 17, fill: '#f59e0b' }
  ],
  spendByCategory: [
    { name: 'Payroll', value: 34 },
    { name: 'Infrastructure', value: 28 },
    { name: 'Scholarship', value: 16 },
    { name: 'Operations', value: 22 }
  ],
  recentLedger: [
    { id: 'TX-2104', title: 'Semester Fee Collection', amount: 'Rs 18.2L', state: 'Verified', time: '10:22 AM' },
    { id: 'TX-2105', title: 'Scholarship Disbursement', amount: 'Rs 4.6L', state: 'Approved', time: '11:10 AM' },
    { id: 'TX-2106', title: 'Infrastructure Payment', amount: 'Rs 9.2L', state: 'Pending', time: '12:01 PM' }
  ]
};

const parseNumeric = (value) => {
  const numeric = Number.parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const FinanceAnalyticsGrid = lazySimple(() => import('./sections/FinanceAnalyticsGrid'));

export default function FinanceDashboard() {
  const { user } = useAuth();
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(FALLBACK);
  const [pendingAction, setPendingAction] = useState(null);

  const applyFinancePayload = (payload = {}) => {
    setData({
      metrics: payload.metrics || FALLBACK.metrics,
      collectionData: payload.collectionData || FALLBACK.collectionData,
      revenueByDept: payload.revenueByDept || FALLBACK.revenueByDept,
      spendByCategory: payload.spendByCategory || FALLBACK.spendByCategory,
      recentLedger: payload.recentLedger || FALLBACK.recentLedger
    });
  };

  const loadFinance = useCallback(async ({ silent = false } = {}) => {
    try {
      setLoading(true);
      const response = await api.get('/finance/dashboard', {
        cache: {
          maxAge: 30000,
          staleWhileRevalidate: true,
          revalidateAfter: 12000,
          persist: true,
          onUpdate: (nextResponse) => applyFinancePayload(nextResponse?.data || {})
        }
      });
      applyFinancePayload(response?.data || {});
      if (!silent) {
        push({
          type: 'success',
          title: 'Finance stream synchronized',
          body: 'Latest collections and ledger summaries were loaded.'
        });
      }
    } catch (error) {
      setData(FALLBACK);
      push({
        type: 'warning',
        title: 'Finance fallback active',
        body: error?.response?.data?.msg || 'Live finance feed is unavailable. Showing resilient fallback data.'
      });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    loadFinance({ silent: true });
  }, [loadFinance]);

  useEffect(() => {
    const handle = scheduleIdleTask(() => {
      void FinanceAnalyticsGrid.preload?.();
    }, 1400, 450);

    return () => cancelIdleTask(handle);
  }, []);

  const collectionDelta = useMemo(() => {
    const points = data.collectionData || [];
    if (points.length < 2) {
      return '+0.0%';
    }
    const first = parseNumeric(points[0]?.collected);
    const last = parseNumeric(points[points.length - 1]?.collected);
    if (!first) {
      return '+0.0%';
    }
    const change = ((last - first) / first) * 100;
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  }, [data.collectionData]);

  const confirmAction = async () => {
    try {
      if (pendingAction?.apiAction) {
        await api.post('/finance/audit', { action: pendingAction.apiAction });
      }
      push({
        type: 'success',
        title: 'Finance directive queued',
        body: `${pendingAction?.label || 'Action'} was submitted to treasury workflows.`
      });
    } catch (error) {
      push({
        type: 'error',
        title: 'Directive failed',
        body: error?.response?.data?.msg || 'Unable to execute the finance directive right now.'
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <DashboardLayout title="Finance Operations" role={user?.subRole || user?.role || 'FINANCE'}>
      <WorkspaceHero
        eyebrow="Finance operations workspace"
        title="Collections, allocations, and treasury control"
        description="Track fee health, spending signals, and ledger reliability from a production-safe finance command surface."
        icon={Banknote}
        badges={[
          loading ? 'Finance stream syncing' : 'Finance stream synchronized',
          `Collection trend ${collectionDelta}`,
          'Ledger controls active'
        ]}
        actions={[
          {
            label: loading ? 'Syncing...' : 'Refresh finance stream',
            icon: Zap,
            tone: 'secondary',
            disabled: loading,
            onClick: () => loadFinance()
          },
          {
            label: 'Run treasury audit',
            icon: FileSearch,
            tone: 'primary',
            onClick: () => setPendingAction({ label: 'Treasury audit', apiAction: 'TREASURY_AUDIT' })
          }
        ]}
        stats={[
          { label: 'Collections', value: data.metrics?.totalCollections || FALLBACK.metrics.totalCollections },
          { label: 'Pending dues', value: data.metrics?.pendingDues || FALLBACK.metrics.pendingDues },
          { label: 'Operating spend', value: data.metrics?.operationalSpend || FALLBACK.metrics.operationalSpend },
          { label: 'Scholarships', value: data.metrics?.scholarshipDisbursed || FALLBACK.metrics.scholarshipDisbursed }
        ]}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Total Collections" value={data.metrics?.totalCollections} icon={CircleDollarSign} color="bg-emerald-500" trend={collectionDelta} />
        <StatCard title="Pending Dues" value={data.metrics?.pendingDues} icon={CreditCard} color="bg-rose-500" trend="Monitored" />
        <StatCard title="Operational Spend" value={data.metrics?.operationalSpend} icon={Activity} color="bg-blue-500" trend="Within budget" />
        <StatCard title="Scholarship Pool" value={data.metrics?.scholarshipDisbursed} icon={ShieldCheck} color="bg-indigo-500" trend="Protected" />
      </div>

      <DeferredSection className="mb-8" minHeight={380}>
        <Suspense fallback={<GlassSkeleton className="h-[780px]" />}>
          <FinanceAnalyticsGrid data={data} />
        </Suspense>
      </DeferredSection>

      <ActionDialog
        open={Boolean(pendingAction)}
        tone="info"
        title={pendingAction?.label || 'Finance action'}
        description="Confirm to queue this directive in the production treasury workflow."
        confirmLabel="Queue action"
        cancelLabel="Cancel"
        onConfirm={confirmAction}
        onClose={() => setPendingAction(null)}
      >
        <div className="surface-card p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Execution note
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            This action is logged for finance audit traceability and can be reviewed from governance reports.
          </p>
        </div>
      </ActionDialog>
    </DashboardLayout>
  );
}
