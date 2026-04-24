import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bus,
  Map,
  MapPin,
  Navigation,
  Phone,
  Route,
  Search,
  ShieldCheck,
  Wifi,
  Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';

const BUS_ROUTES = [
  {
    id: 'R-01',
    name: 'Main City Express',
    stops: ['Central Mall', 'Clock Tower', 'Station Road', 'VITAM Gate 1'],
    eta: '12m',
    status: 'On Time',
    busNo: 'KA-01-VH-2024',
    driver: 'Somesh K.',
    phone: '+91 98765 43210'
  },
  {
    id: 'R-02',
    name: 'Tech Park Loop',
    stops: ['Bannerghatta', 'Electronic City', 'Silk Board', 'VITAM Gate 2'],
    eta: '5m',
    status: 'Delayed',
    busNo: 'KA-01-VH-2025',
    driver: 'Manish R.',
    phone: '+91 98765 43211'
  },
  {
    id: 'R-03',
    name: 'Hostel Shuttle',
    stops: ['B-Block', 'C-Block', 'Mess Arena', 'Academic Block'],
    eta: '2m',
    status: 'On Time',
    busNo: 'EV-SH-01',
    driver: 'Raju B.',
    phone: '+91 98765 43212'
  }
];

const FILTERS = ['All Routes', 'City Express', 'Town Shuttle', 'Faculty Fleet'];

function LiveMap() {
  const [buses, setBuses] = useState([
    { id: 1, x: 22, y: 32, tone: 'bg-indigo-500' },
    { id: 2, x: 61, y: 68, tone: 'bg-emerald-500' },
    { id: 3, x: 46, y: 44, tone: 'bg-amber-500' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((previous) => previous.map((bus) => ({
        ...bus,
        x: Math.min(Math.max(bus.x + (Math.random() - 0.5) * 2, 5), 95),
        y: Math.min(Math.max(bus.y + (Math.random() - 0.5) * 2, 5), 95)
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/8 bg-slate-950/70">
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/15" />

      {buses.map((bus) => (
        <motion.div
          key={bus.id}
          animate={{ left: `${bus.x}%`, top: `${bus.y}%` }}
          transition={{ duration: 2, ease: 'linear' }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <div className={`h-4 w-4 rounded-full border-2 border-white ${bus.tone} shadow-[0_0_16px_rgba(99,102,241,0.45)]`} />
          <div className="mt-2 rounded-xl border border-white/10 bg-black/70 px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.16em] text-white">
            Bus {bus.id}
          </div>
        </motion.div>
      ))}

      <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/60 px-4 py-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
          Fleet live / 3 active buses
        </p>
      </div>
    </div>
  );
}

function RouteCard({ route, onTrack }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black text-white">
            {route.name}
          </p>
          <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-200">
            {route.id} / {route.busNo}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${
          route.status === 'On Time'
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
            : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
        }`}>
          {route.status}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {route.stops.map((stop, index) => (
          <div key={`${route.id}-${stop}`} className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full border ${index === 2 ? 'border-blue-400 bg-blue-400' : 'border-white/15 bg-slate-900'}`} />
            <p className={`text-sm ${index === 2 ? 'font-black text-blue-200' : 'text-slate-300'}`}>
              {stop}
            </p>
            {index === 2 ? (
              <span className="ml-auto text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-300">
                Next stop
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            ETA
          </p>
          <p className="mt-2 text-xl font-black text-white">
            {route.eta}
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Driver
          </p>
          <p className="mt-2 text-sm font-black text-white">
            {route.driver}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a href={`tel:${route.phone.replace(/\s+/g, '')}`} className="btn-secondary">
          <Phone size={14} />
          Call driver
        </a>
        <button type="button" onClick={() => onTrack(route.name)} className="btn-primary">
          <Navigation size={14} />
          Live track
        </button>
      </div>
    </motion.div>
  );
}

export default function TransitService() {
  const { user } = useAuth();
  const { push } = useToast();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Routes');

  const filteredRoutes = useMemo(() => {
    return BUS_ROUTES.filter((route) => (
      [route.name, route.id, route.busNo].join(' ').toLowerCase().includes(search.toLowerCase())
    ));
  }, [search]);

  const delayedRoutes = BUS_ROUTES.filter((route) => route.status === 'Delayed').length;

  const handleTrack = (name) => {
    push({
      type: 'info',
      title: 'Telemetry uplink',
      body: `Live tracking handshake started for ${name}.`
    });
  };

  return (
    <DashboardLayout title="Institutional Transit" role={user?.role || 'STUDENT'}>
      <WorkspaceHero
        eyebrow="Transit workspace"
        title="Fleet visibility and route support"
        description="Track active buses, search route manifests, and reach transport support from a cleaner common transit screen built for everyday campus movement."
        icon={Bus}
        badges={[
          `${BUS_ROUTES.length} routes tracked`,
          `${delayedRoutes} delay alerts`,
          'Live map active'
        ]}
        actions={[
          {
            label: 'Request route stop',
            icon: Map,
            tone: 'secondary',
            onClick: () => push({ type: 'info', title: 'Route request ready', body: 'Stop suggestion and transit board review can be connected here.' })
          },
          {
            label: 'Emergency support',
            icon: Zap,
            tone: 'primary',
            onClick: () => push({ type: 'warning', title: 'Emergency transit flow', body: 'Emergency transport and support escalation can be launched from this workspace.' })
          }
        ]}
        stats={[
          { label: 'Routes', value: '15' },
          { label: 'Active buses', value: '12' },
          { label: 'Delayed', value: String(delayedRoutes) },
          { label: 'Coverage', value: 'South corridor' }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Transit note
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Route R-02 needs attention
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Delay reason
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Current congestion near the Electronic City corridor is affecting one fleet path.
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Recommendation
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-300">
                  Students on that route should check alternative pickup corridors before departure.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Live Routes" value="15" icon={Route} color="bg-blue-500" trend="Operational" />
        <StatCard title="Fleet Active" value="12" icon={Bus} color="bg-emerald-500" trend="Moving" />
        <StatCard title="Delay Alerts" value={String(delayedRoutes)} icon={AlertTriangle} color="bg-amber-500" trend={delayedRoutes ? 'Watchlist' : 'Clear'} />
        <StatCard title="WiFi Fleet" value="5G" icon={Wifi} color="bg-violet-500" trend="Connected" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <GlassCard title="Live fleet map" subtitle="Campus and city route visibility" icon={Map}>
          <LiveMap />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="surface-card p-4 text-center">
              <p className="text-2xl font-black text-white">15</p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Total routes
              </p>
            </div>
            <div className="surface-card p-4 text-center">
              <p className="text-2xl font-black text-emerald-300">12</p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Active buses
              </p>
            </div>
            <div className="surface-card p-4 text-center">
              <p className="text-2xl font-black text-amber-300">{delayedRoutes}</p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Delayed
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard title="Transit advisory" subtitle="Current service alert" icon={AlertTriangle}>
            <div className="rounded-[1.8rem] border border-amber-500/20 bg-amber-500/10 p-5">
              <p className="text-sm font-black text-white">
                Tech Park Loop delay
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-100/90">
                Traffic and technical maintenance are causing temporary delay on one city-side route.
              </p>
            </div>
          </GlassCard>

          <GlassCard title="Safety and support" subtitle="Quick action panel" icon={ShieldCheck}>
            <div className="space-y-3">
              {[
                'SOS support link ready',
                'Fleet compliance verified',
                'Driver verification active'
              ].map((item) => (
                <div key={item} className="surface-card flex items-start gap-3 p-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <p className="text-sm leading-6 text-slate-200">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard title="Route manifest" subtitle="Search and track campus transport">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={activeFilter === filter ? 'btn-primary' : 'btn-secondary'}
              >
                {filter}
              </button>
            ))}
          </div>

          <label className="surface-card flex min-w-0 items-center gap-3 px-4 py-3 xl:min-w-[320px]">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by route name, route id, or vehicle"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {filteredRoutes.map((route) => (
            <RouteCard key={route.id} route={route} onTrack={handleTrack} />
          ))}

          <div className="glass-panel flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
            <div className="rounded-[1.8rem] border border-blue-500/20 bg-blue-500/10 p-4 text-blue-200">
              <Map size={24} />
            </div>
            <h3 className="mt-5 text-xl font-black text-white">
              Request a new stop
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Students can suggest route extensions and new pickup nodes directly from this panel.
            </p>
            <button
              type="button"
              onClick={() => push({ type: 'info', title: 'Stop request ready', body: 'Transit board review workflow can be attached here.' })}
              className="btn-secondary mt-5"
            >
              <MapPin size={14} />
              Submit suggestion
            </button>
          </div>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
