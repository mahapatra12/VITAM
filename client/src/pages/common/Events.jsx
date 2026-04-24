import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Target,
  Ticket
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';
import { useNavigate } from 'react-router-dom';

const UPCOMING_EVENTS = [
  {
    id: 'EV-001',
    title: 'VITAM Tech Summit 2026',
    date: '28 Mar',
    time: '10:00 AM',
    location: 'Main Auditorium',
    category: 'Technology',
    attendees: 1250,
    organizer: 'GDSC VITAM',
    image: 'T',
    color: '#4285F4',
    description: 'A flagship summit featuring industry leaders from Google, Microsoft, and NVIDIA.'
  },
  {
    id: 'EV-002',
    title: 'Cultural Fest: Harmony 2026',
    date: '05 Apr',
    time: '05:00 PM',
    location: 'Campus Grounds',
    category: 'Cultural',
    attendees: 3200,
    organizer: 'Student Council',
    image: 'C',
    color: '#E91E63',
    description: 'Annual cultural extravaganza with music, dance, and fashion showcases.'
  },
  {
    id: 'EV-003',
    title: 'Inter-College Robotics Challenge',
    date: '12 Apr',
    time: '09:00 AM',
    location: 'Robotics Lab',
    category: 'Technical',
    attendees: 450,
    organizer: 'RoboClub',
    image: 'R',
    color: '#FF9800',
    description: 'Compete in Robo-War and line tracking challenges with innovation teams from partner colleges.'
  }
];

const CAMPUS_CLUBS = [
  { name: 'GDSC VITAM', members: 840, type: 'Technical', lead: 'Aryan V.', active: true },
  { name: 'Drama Society', members: 120, type: 'Cultural', lead: 'Sanya K.', active: true },
  { name: 'Robotics Club', members: 350, type: 'Innovation', lead: 'Deepak S.', active: true },
  { name: 'Chess Masters', members: 210, type: 'Sports', lead: 'Rohan M.', active: false }
];

function EventCard({ event, onRegister }) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="premium-card flex h-full flex-col p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-2xl" style={{ background: event.color }}>
          {event.image}
        </div>
        <span className="status-pill">
          {event.category}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-black text-white">
          {event.title}
        </h3>
        <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
          Organized by {event.organizer}
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          {event.description}
        </p>
      </div>

      <div className="mt-6 grid gap-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-blue-200" />
          {event.date} / {event.time}
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-amber-200" />
          {event.location}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
          {event.attendees}+ attending
        </span>
        <button type="button" onClick={() => onRegister(event.title)} className="btn-primary">
          Register now
        </button>
      </div>
    </motion.div>
  );
}

export default function EventsHub() {
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('events');
  const [search, setSearch] = useState('');

  const handleRegister = (title) => {
    push({
      type: 'success',
      title: 'Registration Success',
      body: `Your digital pass for ${title} has been generated in My Wallet.`
    });
  };

  return (
    <DashboardLayout title="Events & Clubs" role={user?.role || 'STUDENT'}>
      <WorkspaceHero
        eyebrow="Campus pulse"
        title="Events, clubs, and student activity"
        description="Discover technical summits, cultural festivals, student communities, and event passes from one brighter campus experience hub."
        icon={Calendar}
        badges={[
          `${UPCOMING_EVENTS.length} featured events`,
          `${CAMPUS_CLUBS.length} active clubs`,
          'Digital ticket wallet ready'
        ]}
        stats={[
          { label: 'Featured events', value: String(UPCOMING_EVENTS.length) },
          { label: 'Club communities', value: String(CAMPUS_CLUBS.length) },
          { label: 'Largest audience', value: '3200+' },
          { label: 'Wallet status', value: 'Active' }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Campus recommendation
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Join one flagship event this month
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Best attention grabber
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Tech Summit and Harmony Fest are the strongest visual and networking highlights in the current calendar.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          ['events', 'Highlights'],
          ['clubs', 'Clubs'],
          ['my-tickets', 'My Wallet']
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`${tab === id ? 'status-pill border-indigo-500/25 bg-indigo-500/10 text-indigo-200' : 'status-pill'} transition-all`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'events' ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events, fests, or challenges..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/75 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500/40"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Technical', 'Cultural', 'Sports'].map((filter) => (
                <span key={filter} className="status-pill">
                  {filter}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {UPCOMING_EVENTS.filter((event) => event.title.toLowerCase().includes(search.toLowerCase())).map((event) => (
              <EventCard key={event.id} event={event} onRegister={handleRegister} />
            ))}
            <div className="premium-card flex min-h-[21rem] flex-col items-center justify-center border-dashed border-white/10 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.05] text-slate-500">
                <Plus size={28} />
              </div>
              <h4 className="mt-5 text-sm font-black text-white">
                Submit event proposal
              </h4>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                Pitch a new event or club initiative for campus review and digital listing.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'clubs' ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <GlassCard title="Community Snapshot" subtitle="Campus participation highlights">
            <div className="mt-4 space-y-4">
              {[
                { label: 'Innovation rank', value: '#04', icon: Award },
                { label: 'Network benefit', value: 'High', icon: Globe },
                { label: 'Leadership pipeline', value: 'Active', icon: Target }
              ].map((item) => (
                <div key={item.label} className="surface-card flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className="text-indigo-200" />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-black text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Campus Clubs" subtitle="Discover student communities">
            <div className="mt-4 space-y-4">
              {CAMPUS_CLUBS.map((club) => (
                <div key={club.name} className="surface-card flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-black text-indigo-200">
                      {club.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {club.name}
                      </h3>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {club.members} members / {club.type} / lead {club.lead}
                      </p>
                    </div>
                  </div>
                  <span className={`status-pill ${club.active ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : ''}`}>
                    {club.active ? 'Active' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : null}

      {tab === 'my-tickets' ? (
        <div className="mx-auto max-w-3xl space-y-6">
          <GlassCard title="Digital Pass Wallet" subtitle="Your event registrations">
            <div className="mt-4 rounded-[2rem] border border-indigo-500/20 bg-indigo-500/10 p-8 text-center">
              <Ticket size={44} className="mx-auto text-indigo-200" />
              <h3 className="mt-5 text-2xl font-black text-white">
                Event passes are ready
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-200">
                Your registrations for Tech Summit and Robotics Challenge are secured. Use your digital ID card for scan-based entry at the venue.
              </p>
              <button
                type="button"
                onClick={() => navigate('/id-card')}
                className="btn-primary mt-8"
              >
                Open digital ID
                <ExternalLink size={14} />
              </button>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
