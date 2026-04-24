import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Coffee,
  Droplets,
  Fan,
  Home,
  MapPin,
  Plus,
  Send,
  ShieldCheck,
  Users,
  Wifi,
  Wrench,
  Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import ActionDialog from '../../components/ui/ActionDialog';

const MESS_MENU = {
  Monday: { breakfast: 'Aloo Paratha, Curd', lunch: 'Rajma Chawal, Salad', snacks: 'Samosa, Tea', dinner: 'Paneer Butter Masala, Roti' },
  Tuesday: { breakfast: 'Idli Sambar, Chutney', lunch: 'Chole Bhature, Lassi', snacks: 'Biscuits, Tea', dinner: 'Mix Veg, Dal Tadka, Roti' },
  Wednesday: { breakfast: 'Poha, Jalebi', lunch: 'Veg Thali, Sweet', snacks: 'Vada Pav, Coffee', dinner: 'Chicken or Paneer Curry, Rice' },
  Thursday: { breakfast: 'Bread Omelette or Toast', lunch: 'Kadhi Pakora, Rice', snacks: 'Cookies, Tea', dinner: 'Kofta Curry, Naan' },
  Friday: { breakfast: 'Upma, Kesari Bath', lunch: 'Biryani, Raita', snacks: 'Maska Bun, Tea', dinner: 'Egg or Veg Masala, Paratha' },
  Saturday: { breakfast: 'Puri Bhaji', lunch: 'Dal Makhani, Jeera Rice', snacks: 'Pakora, Tea', dinner: 'Manchurian, Fried Rice' },
  Sunday: { breakfast: 'Special Pancakes', lunch: 'Chole Rice, Pickle', snacks: 'Cake, Juice', dinner: 'Butter Chicken or Dal, Rumali' }
};

const MY_ROOM = {
  wing: 'B-Block',
  floor: '3rd',
  roomNo: '304',
  type: 'Triple Sharing',
  dues: 2500,
  status: 'Occupied',
  amenities: ['AC Unit', 'Attached Bath', 'WiFi 6', 'Study Desk'],
  roommates: [
    { name: 'Rahul Sharma', roll: 'CS2022045', branch: 'CSE', year: '3rd', avatar: 'R' },
    { name: 'Aryan Varma', roll: 'CS2022012', branch: 'CSE', year: '3rd', avatar: 'A' }
  ]
};

const INITIAL_TICKETS = [
  { id: 'T-001', type: 'Electrical', subject: 'Tube light flickering', status: 'In Progress', date: '21 Mar 2026' },
  { id: 'T-002', type: 'Plumbing', subject: 'Water leakage in washroom', status: 'Resolved', date: '15 Mar 2026' }
];

const TAB_OPTIONS = ['overview', 'mess', 'maintenance'];

function MessTimer() {
  const [timeLeft, setTimeLeft] = useState('');
  const [meal, setMeal] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      let target;
      let mealName;

      if (hours < 9) {
        target = new Date().setHours(9, 0, 0);
        mealName = 'Breakfast ends';
      } else if (hours < 14) {
        target = new Date().setHours(14, 0, 0);
        mealName = 'Lunch ends';
      } else if (hours < 18) {
        target = new Date().setHours(18, 0, 0);
        mealName = 'Snacks end';
      } else if (hours < 21) {
        target = new Date().setHours(21, 30, 0);
        mealName = 'Dinner ends';
      } else {
        target = new Date(now.getTime() + 86400000).setHours(9, 0, 0);
        mealName = 'Breakfast starts';
      }

      const diff = target - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
      setMeal(mealName);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="surface-card flex flex-col items-center p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
        {meal}
      </p>
      <p className="mt-2 text-2xl font-black text-white">
        {timeLeft}
      </p>
    </div>
  );
}

const ticketTone = (status) => {
  if (status === 'Resolved') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  }

  if (status === 'In Progress') {
    return 'border-blue-500/20 bg-blue-500/10 text-blue-200';
  }

  return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
};

export default function StudentHostel() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('overview');
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'Electrical', subject: '', desc: '' });

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dayNames = Object.keys(MESS_MENU);
  const openTickets = tickets.filter((ticket) => ticket.status !== 'Resolved').length;

  const nextMeal = useMemo(() => {
    const todayMenu = MESS_MENU[currentDay] || MESS_MENU.Monday;
    return todayMenu.lunch;
  }, [currentDay]);

  const handleTicketSubmit = () => {
    if (!form.subject.trim()) {
      return;
    }

    setTickets((previous) => [
      {
        id: `T-${String(previous.length + 1).padStart(3, '0')}`,
        ...form,
        status: 'Pending',
        date: 'Today'
      },
      ...previous
    ]);

    push({
      type: 'success',
      title: 'Ticket raised',
      body: `Your ${form.type.toLowerCase()} request has been logged and sent to the hostel team.`
    });

    setForm({ type: 'Electrical', subject: '', desc: '' });
    setShowForm(false);
  };

  const handleClearDues = () => {
    push({
      type: 'info',
      title: 'Payment gateway ready',
      body: 'Hostel dues can now be connected to your production payment flow from this workspace.'
    });
  };

  return (
    <DashboardLayout title="Hostel Life" role={user?.role || 'STUDENT'}>
      <WorkspaceHero
        eyebrow="Hostel workspace"
        title={`${MY_ROOM.wing} living and support center`}
        description="Manage room details, mess timing, hostel dues, and maintenance support from a cleaner residential workspace designed for everyday student use."
        icon={Home}
        badges={[
          `${MY_ROOM.status} room`,
          `${openTickets} active tickets`,
          `Current menu ${currentDay}`
        ]}
        actions={[
          {
            label: 'Raise service ticket',
            icon: Wrench,
            tone: 'secondary',
            onClick: () => setShowForm(true)
          },
          {
            label: 'Clear dues',
            icon: Zap,
            tone: 'primary',
            onClick: handleClearDues
          }
        ]}
        stats={[
          { label: 'Room', value: MY_ROOM.roomNo },
          { label: 'Sharing type', value: MY_ROOM.type },
          { label: 'Pending dues', value: `Rs ${MY_ROOM.dues.toLocaleString()}` },
          { label: 'Next meal', value: nextMeal }
        ]}
        aside={(
          <div className="space-y-4">
            <MessTimer />
            <div className="glass-panel p-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                Residential note
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                Support status is stable
              </h3>
              <div className="mt-5 space-y-3">
                <div className="surface-card p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    Quiet hours
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Hostel quiet hours begin at 10 PM, with access control active through the night.
                  </p>
                </div>
                <div className="surface-card p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    Warden support
                  </p>
                  <p className="mt-2 text-sm leading-6 text-emerald-300">
                    Senior warden coverage for your block is active and reachable through the support card below.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Room Status" value={MY_ROOM.status} icon={CheckCircle2} color="bg-emerald-500" trend="Assigned" />
        <StatCard title="Roommates" value={String(MY_ROOM.roommates.length + 1)} icon={Users} color="bg-blue-500" trend="Shared" />
        <StatCard title="Active Tickets" value={String(openTickets)} icon={Wrench} color="bg-amber-500" trend={openTickets ? 'Needs tracking' : 'Clear'} />
        <StatCard title="Dues" value={`Rs ${MY_ROOM.dues.toLocaleString()}`} icon={Bell} color="bg-violet-500" trend="Residential" />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {TAB_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTab(option)}
            className={tab === option ? 'btn-primary' : 'btn-secondary'}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          {tab === 'overview' ? (
            <>
              <GlassCard title="Room profile" subtitle={`${MY_ROOM.wing} / ${MY_ROOM.floor} floor`} icon={Home}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="surface-card p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                      Room identity
                    </p>
                    <p className="mt-3 text-3xl font-black text-white">
                      {MY_ROOM.roomNo}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                      <MapPin size={14} className="text-blue-200" />
                      {MY_ROOM.wing}, {MY_ROOM.floor} floor
                    </p>
                  </div>

                  <div className="surface-card p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                      Daily support
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                        <p className="text-sm font-black text-white">
                          Quiet hours
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          10 PM onward
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
                        <p className="text-sm font-black text-white">
                          Access
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Smart lock enabled
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard title="Roommates" subtitle="Shared occupancy roster" icon={Users}>
                <div className="grid gap-4 md:grid-cols-2">
                  {MY_ROOM.roommates.map((roommate) => (
                    <div key={roommate.roll} className="surface-card flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-lg font-black text-white">
                        {roommate.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">
                          {roommate.name}
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                          {roommate.branch} / {roommate.year} year
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                          {roommate.roll}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard title="Amenities and utilities" subtitle="Residential infrastructure" icon={ShieldCheck}>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { label: 'AC Unit', icon: Fan, tone: 'text-blue-300 bg-blue-500/10 border-blue-500/20' },
                    { label: 'Water Supply', icon: Droplets, tone: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20' },
                    { label: 'WiFi 6', icon: Wifi, tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Smart Lock', icon: Zap, tone: 'text-amber-300 bg-amber-500/10 border-amber-500/20' }
                  ].map((item) => (
                    <div key={item.label} className="surface-card flex flex-col items-center gap-3 p-5 text-center">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${item.tone}`}>
                        <item.icon size={18} />
                      </div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          ) : null}

          {tab === 'mess' ? (
            <GlassCard title="Mess calendar" subtitle={`Menu schedule for ${currentDay}`} icon={Coffee}>
              <div className="grid gap-4 md:grid-cols-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className={`rounded-[1.8rem] border p-5 transition-all ${
                      day === currentDay ? 'border-amber-500/30 bg-amber-500/8' : 'border-white/8 bg-slate-950/35'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-white">
                        {day}
                      </p>
                      {day === currentDay ? (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-950">
                          Today
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-5 space-y-4">
                      {[
                        { label: 'Breakfast', value: MESS_MENU[day].breakfast },
                        { label: 'Lunch', value: MESS_MENU[day].lunch },
                        { label: 'Snacks', value: MESS_MENU[day].snacks },
                        { label: 'Dinner', value: MESS_MENU[day].dinner }
                      ].map((meal) => (
                        <div key={`${day}-${meal.label}`} className="surface-card p-4">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                            {meal.label}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-200">
                            {meal.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : null}

          {tab === 'maintenance' ? (
            <GlassCard title="Service tickets" subtitle="Track hostel support requests" icon={Wrench}>
              <div className="mb-5 flex justify-end">
                <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
                  <Plus size={14} />
                  New request
                </button>
              </div>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="surface-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-black text-white">
                          {ticket.subject}
                        </p>
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${ticketTone(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        {ticket.id} / {ticket.type} / {ticket.date}
                      </p>
                    </div>
                    <button type="button" className="btn-secondary">
                      <Bell size={14} />
                      Track request
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <GlassCard title="Residential billing" subtitle="Current hostel ledger" icon={Bell}>
            <div className="rounded-[1.8rem] border border-violet-500/20 bg-violet-500/10 p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-200">
                Pending dues
              </p>
              <p className="mt-3 text-4xl font-black text-white">
                Rs {MY_ROOM.dues.toLocaleString()}
              </p>
              <p className="mt-2 text-sm leading-6 text-violet-100/80">
                Mess and hostel settlement due by 05 Apr 2026.
              </p>
              <button type="button" onClick={handleClearDues} className="btn-primary mt-5 w-full justify-center">
                <Zap size={14} />
                Clear dues now
              </button>
            </div>
          </GlassCard>

          <GlassCard title="Warden support" subtitle="Emergency and routine access" icon={ShieldCheck}>
            <div className="surface-card p-4">
              <p className="text-sm font-black text-white">
                Shyam Nath
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Senior Warden / B-Block
              </p>
              <button
                type="button"
                onClick={() => push({ type: 'info', title: 'Warden contact ready', body: 'The direct support call and emergency flow can be connected here.' })}
                className="btn-secondary mt-4 w-full justify-center"
              >
                <Bell size={14} />
                Contact support
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" className="btn-secondary justify-center">
                Night out pass
              </button>
              <button type="button" className="btn-secondary justify-center">
                Guest entry
              </button>
            </div>
          </GlassCard>

          <GlassCard title="Community rules" subtitle="Residential discipline" icon={ShieldCheck}>
            <div className="space-y-3">
              {['In-time 10:30 PM', 'No heavy appliances', 'Waste segregation required', 'Visitor ID is mandatory'].map((rule) => (
                <div key={rule} className="surface-card flex items-start gap-3 p-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                  <p className="text-sm leading-6 text-slate-200">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <ActionDialog
        open={showForm}
        tone="warning"
        title="Raise a hostel service ticket"
        description="Tell the hostel support team what needs attention so the issue can be tracked from this workspace."
        confirmLabel="Submit request"
        cancelLabel="Cancel"
        onConfirm={handleTicketSubmit}
        onClose={() => setShowForm(false)}
        confirmDisabled={!form.subject.trim()}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {['Electrical', 'Plumbing', 'Carpentry', 'WiFi', 'Cleaning', 'Other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((previous) => ({ ...previous, type }))}
                  className={form.type === type ? 'btn-primary' : 'btn-secondary'}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Subject
            </span>
            <input
              value={form.subject}
              onChange={(event) => setForm((previous) => ({ ...previous, subject: event.target.value }))}
              placeholder="For example: fan making noise"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400/40 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Description
            </span>
            <textarea
              rows={4}
              value={form.desc}
              onChange={(event) => setForm((previous) => ({ ...previous, desc: event.target.value }))}
              placeholder="Add any detail that will help the hostel team resolve the issue faster."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400/40 focus:outline-none"
            />
          </label>

          <div className="surface-card flex items-center gap-3 p-4">
            <Send size={16} className="text-amber-300" />
            <p className="text-sm leading-6 text-slate-300">
              Your request will be added to the hostel support queue and remain visible in the maintenance tab.
            </p>
          </div>
        </div>
      </ActionDialog>
    </DashboardLayout>
  );
}
