import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bus,
  Clock3,
  Filter,
  MapPin,
  Navigation,
  Phone,
  Route,
  Search,
  ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { useToast } from '../../components/ui/ToastSystem';

const BUS_ROUTES = [
  {
    id: 'B01',
    corridor: 'Cuttack to VITAM',
    pickup: 'Badambadi main node',
    departure: '07:30 AM',
    arrival: '08:45 AM',
    status: 'On time',
    seats: 14,
    driver: 'R. K. Nayak',
    phone: '+91 98765 43210',
    note: 'Primary morning academic corridor'
  },
  {
    id: 'B02',
    corridor: 'Master Canteen to VITAM',
    pickup: 'Bhubaneswar central hub',
    departure: '07:00 AM',
    arrival: '08:45 AM',
    status: 'Delayed',
    seats: 8,
    driver: 'S. Mohanty',
    phone: '+91 98765 43211',
    note: 'Traffic pressure near Rasulgarh'
  },
  {
    id: 'B03',
    corridor: 'Patia to VITAM',
    pickup: 'Patia square pickup bay',
    departure: '07:15 AM',
    arrival: '08:45 AM',
    status: 'Boarding',
    seats: 5,
    driver: 'P. Swain',
    phone: '+91 98765 43212',
    note: 'Students should arrive 8 minutes early'
  },
  {
    id: 'B04',
    corridor: 'Khurda to VITAM',
    pickup: 'Khurda bypass gate',
    departure: '07:00 AM',
    arrival: '08:45 AM',
    status: 'On time',
    seats: 11,
    driver: 'A. Das',
    phone: '+91 98765 43213',
    note: 'Fastest corridor this morning'
  },
  {
    id: 'B05',
    corridor: 'Berhampur to VITAM',
    pickup: 'Berhampur departure plaza',
    departure: '06:30 AM',
    arrival: '08:45 AM',
    status: 'On time',
    seats: 3,
    driver: 'M. Rao',
    phone: '+91 98765 43214',
    note: 'High-demand long corridor route'
  }
];

const STATUS_OPTIONS = ['All', 'On time', 'Boarding', 'Delayed'];

const statusTone = (status) => {
  if (status === 'On time') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  }

  if (status === 'Boarding') {
    return 'border-blue-500/20 bg-blue-500/10 text-blue-200';
  }

  return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
};

export default function BusSchedule() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRoutes = BUS_ROUTES.filter((route) => {
    const matchesQuery = [route.id, route.corridor, route.pickup, route.driver]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesStatus = statusFilter === 'All' || route.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const onTimeRoutes = BUS_ROUTES.filter((route) => route.status === 'On time').length;
  const delayedRoutes = BUS_ROUTES.filter((route) => route.status === 'Delayed').length;
  const boardingRoutes = BUS_ROUTES.filter((route) => route.status === 'Boarding').length;
  const availableSeats = BUS_ROUTES.reduce((sum, route) => sum + route.seats, 0);

  const handleDispatch = () => {
    push({
      type: 'info',
      title: 'Dispatch Desk',
      body: 'The institutional transport desk can be connected here with your live helpline workflow.'
    });
  };

  const handleMapSync = () => {
    push({
      type: 'success',
      title: 'Map Sync Ready',
      body: 'GPS mapping and route telemetry can now be wired into this transport workspace.'
    });
  };

  return (
    <DashboardLayout title="Institutional Transport" role="STUDENT">
      <WorkspaceHero
        eyebrow="Transport workspace"
        title="Smart campus transit command board"
        description="Track route readiness, boarding pressure, and driver contacts from a cleaner logistics dashboard built to reduce confusion during busy morning departures."
        icon={Bus}
        badges={[
          '5 active routes',
          `${onTimeRoutes} routes on time`,
          `${availableSeats} seats available`
        ]}
        actions={[
          {
            label: 'Sync live map',
            icon: Navigation,
            tone: 'secondary',
            onClick: handleMapSync
          },
          {
            label: 'Contact dispatch',
            icon: Phone,
            tone: 'primary',
            onClick: handleDispatch
          }
        ]}
        stats={[
          { label: 'Active routes', value: String(BUS_ROUTES.length) },
          { label: 'On-time index', value: '94.2%' },
          { label: 'Boarding now', value: String(boardingRoutes) },
          { label: 'Delay alerts', value: String(delayedRoutes) }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Route intelligence
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Morning traffic is stable
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Immediate note
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Route B02 has minor traffic delay. Students on that corridor should move to pickup 10 minutes early.
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Reliability signal
                </p>
                <p className="mt-3 text-sm leading-6 text-emerald-300">
                  No emergency transport disruptions are active in the current schedule snapshot.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Routes Live" value={String(BUS_ROUTES.length)} icon={Route} color="bg-blue-500" trend="Operational" />
        <StatCard title="Available Seats" value={String(availableSeats)} icon={Bus} color="bg-emerald-500" trend="Distributed" />
        <StatCard title="Delayed Routes" value={String(delayedRoutes)} icon={AlertTriangle} color="bg-amber-500" trend={delayedRoutes ? 'Traffic impact' : 'Clear'} />
        <StatCard title="Safety Status" value="Secured" icon={ShieldCheck} color="bg-violet-500" trend="Monitored" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <GlassCard title="Live Route Filters" subtitle="Find pickup corridors faster" icon={Filter}>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <label className="surface-card flex items-center gap-3 px-4 py-3">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by route, pickup point, or driver"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatusFilter(option)}
                  className={statusFilter === option ? 'btn-primary' : 'btn-secondary'}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Travel Discipline" subtitle="Quick student reminders" icon={Clock3}>
          <div className="space-y-3">
            {[
              'Carry your VITAM ID before boarding every route.',
              'Reach the pickup bay at least 5 to 8 minutes early.',
              'Use driver contact only for urgent transport issues.'
            ].map((item) => (
              <div key={item} className="surface-card flex items-start gap-3 p-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                <p className="text-sm leading-6 text-slate-200">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <GlassCard title="Live Route Board" subtitle={`${filteredRoutes.length} corridors visible`} className="min-h-[420px]">
          <div className="space-y-4">
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map((route) => (
                <motion.div
                  key={route.id}
                  whileHover={{ y: -2 }}
                  className="surface-card p-5"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                          {route.id}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] ${statusTone(route.status)}`}>
                          {route.status}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-black text-white">
                        {route.corridor}
                      </h3>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                        <MapPin size={14} className="text-blue-300" />
                        {route.pickup}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {route.note}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[300px]">
                      <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                          Departure
                        </p>
                        <p className="mt-2 text-lg font-black text-white">
                          {route.departure}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                          Campus ETA
                        </p>
                        <p className="mt-2 text-lg font-black text-white">
                          {route.arrival}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                          Driver
                        </p>
                        <p className="mt-2 text-sm font-black text-white">
                          {route.driver}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                          Seats left
                        </p>
                        <p className="mt-2 text-lg font-black text-white">
                          {route.seats}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-white/6 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Contact: {route.phone}
                    </p>
                    <a href={`tel:${route.phone.replace(/\s+/g, '')}`} className="btn-secondary">
                      <Phone size={14} />
                      Call driver
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="surface-card flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
                <div className="rounded-[1.8rem] border border-blue-500/20 bg-blue-500/10 p-4 text-blue-200">
                  <Search size={22} />
                </div>
                <h3 className="mt-5 text-2xl font-black text-white">
                  No routes match this filter
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                  Try another status or search term to surface a different corridor, pickup node, or driver listing.
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard title="Dispatch Advisory" subtitle="Operational guidance" icon={Navigation}>
            <div className="space-y-4">
              {BUS_ROUTES.slice(0, 3).map((route) => (
                <div key={route.id} className="surface-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-white">
                        {route.id} / {route.corridor}
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Pickup {route.pickup}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] ${statusTone(route.status)}`}>
                      {route.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Campus Map Sync" subtitle="GPS visibility" icon={MapPin}>
            <div className="surface-card flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
              <div className="rounded-[1.8rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
                <MapPin size={24} />
              </div>
              <h3 className="mt-5 text-xl font-black text-white">
                Live route map ready
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                This space is ready for real-time GPS overlays, pickup markers, and route ETA rendering.
              </p>
              <button type="button" onClick={handleMapSync} className="btn-secondary mt-5">
                <Navigation size={14} />
                Preview integration
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
