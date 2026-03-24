import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Coffee, Wrench, Clipboard, User, Users, Info,
  ChevronRight, CheckCircle2, AlertTriangle, Clock,
  Plus, X, Send, MapPin, Zap, Droplets, Fan, Wifi, Bell, Star
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const MESS_MENU = {
  Monday:    { breakfast: "Aloo Paratha, Curd", lunch: "Rajma Chawal, Salad", snacks: "Samosa, Tea", dinner: "Paneer Butter Masala, Roti" },
  Tuesday:   { breakfast: "Idli Sambar, Chutney", lunch: "Chole Bhature, Lassi", snacks: "Biscuits, Tea", dinner: "Mix Veg, Dal Tadka, Roti" },
  Wednesday: { breakfast: "Poha, Jalebi", lunch: "Veg Thali, Sweet", snacks: "Vada Pav, Coffee", dinner: "Chicken/Paneer Curry, Rice" },
  Thursday:  { breakfast: "Bread Omelette/Toast", lunch: "Kadhi Pakora, Rice", snacks: "Cookies, Tea", dinner: "Kofta Curry, Naan" },
  Friday:    { breakfast: "Upma, Kesari Bath", lunch: "Biryani, Raita", snacks: "Maska Bun, Tea", dinner: "Egg/Veg Masala, Paratha" },
  Saturday:  { breakfast: "Puri Bhaji", lunch: "Dal Makhani, Jeera Rice", snacks: "Pakora, Tea", dinner: "Manchurian, Fried Rice" },
  Sunday:    { breakfast: "Special Pancakes", lunch: "Chole Rice, Pickle", snacks: "Cake, Juice", dinner: "Butter Chicken/Dal, Rumali" },
};

const MY_ROOM = {
  wing: "B-Block", floor: "3rd", roomNo: "304", type: "Triple Sharing",
  dues: 2500, status: "Occupied",
  amenities: ["AC", "Attached Bath", "WiFi 6", "Study Desk"],
  roommates: [
    { name: "Rahul Sharma", roll: "CS2022045", branch: "CSE", year: "3rd", avatar: "R" },
    { name: "Aryan Varma", roll: "CS2022012", branch: "CSE", year: "3rd", avatar: "A" },
  ]
};

const TICKETS = [
  { id: "T-001", type: "Electrical", subject: "Tube light flickering", status: "In Progress", date: "21 Mar 2026" },
  { id: "T-002", type: "Plumbing", subject: "Water leakage in washroom", status: "Resolved", date: "15 Mar 2026" },
];

function MessTimer() {
  const [timeLeft, setTimeLeft] = useState("");
  const [meal, setMeal] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = now.getHours();
      let target, mealName;

      if (hrs < 9) { target = new Date().setHours(9, 0, 0); mealName = "Breakfast Ends"; }
      else if (hrs < 14) { target = new Date().setHours(14, 0, 0); mealName = "Lunch Ends"; }
      else if (hrs < 18) { target = new Date().setHours(18, 0, 0); mealName = "Snacks End"; }
      else if (hrs < 21) { target = new Date().setHours(21, 30, 0); mealName = "Dinner Ends"; }
      else { target = new Date(now.getTime() + 86400000).setHours(9, 0, 0); mealName = "Breakfast Starts"; }

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
    <div className="flex flex-col items-center">
      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{meal}</div>
      <div className="text-xl font-black text-white font-mono mt-0.5">{timeLeft}</div>
    </div>
  );
}

function ComplaintModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ type: 'Electrical', subject: '', desc: '' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white flex items-center gap-2"><Wrench size={18} className="text-amber-500"/> New Ticket</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={15}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {['Electrical', 'Plumbing', 'Carpentry', 'WiFi', 'Cleaning', 'Other'].map(t => (
                <button key={t} onClick={() => setForm(f => ({...f, type: t}))}
                  className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${form.type === t ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
            <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" placeholder="e.g. Fan making noise" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Detailed Description</label>
            <textarea value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))} rows={3}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" placeholder="Please describe the issue..." />
          </div>
        </div>
        <button onClick={() => { if(form.subject) { onSubmit(form); onClose(); } }}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <Send size={14} /> Submit Request
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function StudentHostel() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('overview'); // overview | mess | maintenance
  const [tickets, setTickets] = useState(TICKETS);
  const [showForm, setShowForm] = useState(false);

  const dayNames = Object.keys(MESS_MENU);
  const currentDay = dayNames[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const handleTicket = (form) => {
    setTickets([{ id: `T-${String(tickets.length+1).padStart(3, '0')}`, ...form, status: "Pending", date: "Today" }, ...tickets]);
    push({ type: 'success', title: 'Ticket Raised', body: `Your ${form.type} request has been logged. Warden notified.` });
  };

  return (
    <DashboardLayout title="Hostel Life" role={user?.role || 'STUDENT'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Home size={28} className="text-amber-500" /> {MY_ROOM.wing} Explorer
          </h2>
          <p className="text-slate-400 mt-1">Manage your room, mess schedule, and maintenance requests.</p>
        </div>
        <div className="flex gap-2 bg-[#080808] p-1 rounded-2xl border border-white/5 self-stretch md:self-auto">
          {['overview', 'mess', 'maintenance'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room & Amenities */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                {/* Room Stats Card */}
                <div className="relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-[#111] to-[#050505] border border-white/5">
                  <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full" />
                  <div className="relative flex flex-wrap justify-between gap-6">
                    <div className="space-y-4">
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
                        <CheckCircle2 size={11} /> {MY_ROOM.status}
                      </div>
                      <h3 className="text-5xl font-black text-white tracking-tighter">Room {MY_ROOM.roomNo}</h3>
                      <p className="text-slate-400 flex items-center gap-2"><MapPin size={14} /> {MY_ROOM.wing}, {MY_ROOM.floor} Floor</p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                          <Users size={16} className="text-amber-500"/>
                          <span className="text-xs font-bold text-slate-300">{MY_ROOM.type}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                          <Bell size={16} className="text-indigo-500"/>
                          <span className="text-xs font-bold text-slate-300">Quiet Hours: 10 PM</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center min-w-[160px]">
                      <MessTimer />
                      <button onClick={() => setTab('mess')} className="mt-4 text-[10px] font-black text-amber-400 uppercase tracking-widest hover:underline">View Menu →</button>
                    </div>
                  </div>
                </div>

                {/* Roommates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MY_ROOM.roommates.map((r, i) => (
                    <motion.div key={r.roll} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-3xl bg-[#080808] border border-white/5 flex items-center gap-4 group hover:border-amber-500/20 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
                        {r.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white group-hover:text-amber-400 transition-colors uppercase">{r.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-wider">{r.branch} · {r.year} Year</p>
                      </div>
                      <button className="ml-auto w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                        <ChevronRight size={16}/>
                      </button>
                    </motion.div>
                  ))}
                  <div className="p-4 rounded-3xl border border-dashed border-white/10 flex items-center justify-center gap-3 text-slate-500 hover:text-white hover:border-white/30 transition-all cursor-pointer">
                    <Plus size={18}/>
                    <span className="text-xs font-black uppercase tracking-widest">Synergy Profile</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="p-6 rounded-3xl bg-[#080808] border border-white/5">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Functional Amenities</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { l: "AC Unit", i: Fan, c: "text-blue-400", bg: "bg-blue-500/10" },
                      { l: "Water Sup", i: Droplets, c: "text-indigo-400", bg: "bg-indigo-500/10" },
                      { l: "Gigabit Wifi", i: Wifi, c: "text-emerald-400", bg: "bg-emerald-500/10" },
                      { l: "Smart Lock", i: Zap, c: "text-amber-400", bg: "bg-amber-500/10" },
                    ].map(a => (
                      <div key={a.l} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.bg} ${a.c}`}><a.i size={20}/></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase">{a.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'mess' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-white">Culinary Calendar</h3>
                  <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                    Spring Menu 2026
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayNames.map(day => (
                     <div key={day} className={`p-5 rounded-[2rem] border transition-all ${day === currentDay ? 'bg-amber-500/5 border-amber-500/30 scale-[1.02]' : 'bg-[#080808] border-white/5'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-xs font-black uppercase tracking-widest ${day === currentDay ? 'text-amber-400' : 'text-slate-500'}`}>{day}</span>
                          {day === currentDay && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-black">TODAY</span>}
                        </div>
                        <div className="space-y-4">
                          {[
                            { l: 'Breakfast', v: MESS_MENU[day].breakfast, i: Coffee, t: '08:00 - 09:30' },
                            { l: 'Lunch',     v: MESS_MENU[day].lunch,     i: Home,   t: '12:30 - 14:00' },
                            { l: 'Dinner',    v: MESS_MENU[day].dinner,    i: Star,   t: '19:30 - 21:00' },
                          ].map(meal => (
                            <div key={meal.l} className="flex gap-4">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400"><meal.i size={14}/></div>
                              <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{meal.l} <span className="ml-2 font-normal lowercase">{meal.t}</span></p>
                                <p className="text-xs font-bold text-white mt-0.5">{meal.v}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'maintenance' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-white">Service Tickets</h3>
                  <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    <Plus size={14}/> New Request
                  </button>
                </div>
                <div className="space-y-3">
                  {tickets.map((t, i) => (
                    <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-2xl bg-[#080808] border border-white/5 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                          <Wrench size={18}/>
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{t.subject}</p>
                          <div className="flex items-center gap-4 text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                            <span>ID: {t.id}</span>
                            <span>{t.type}</span>
                            <span>{t.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        t.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                        t.status === 'In Progress' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 
                        'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      }`}>
                        {t.status}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Ledger & Actions */}
        <div className="space-y-6">
          {/* Due Summary */}
          <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/30">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Financial Pulse</h4>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-4xl font-black text-white leading-none">₹{MY_ROOM.dues.toLocaleString()}</p>
                <p className="text-[10px] text-indigo-300/60 mt-2 font-bold uppercase tracking-wider">Pending Mess Charges</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Due By</p>
                <p className="text-xs font-black text-white">05 APR 2026</p>
              </div>
            </div>
            <button className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">
              Clear Dues Now
            </button>
          </div>

          {/* Quick Support */}
          <div className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Warden On-Call</h4>
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-white border border-white/10">SW</div>
              <div>
                <p className="text-xs font-black text-white">Shyam Nath</p>
                <p className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">Senior Warden (B-Block)</p>
              </div>
              <button className="ml-auto p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/30 hover:bg-orange-500 hover:text-white transition-all">
                <Zap size={16}/>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all text-center">
                Night Out Pass
              </button>
              <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all text-center">
                Guest Entry
              </button>
            </div>
          </div>

          {/* Guidelines */}
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
             <div className="flex items-center gap-2 text-slate-400">
               <Info size={16}/>
               <span className="text-[10px] font-black uppercase tracking-widest">Community Rules</span>
             </div>
             <ul className="space-y-2">
               {["In-time 10:30 PM", "No heavy appliances", "Waste segregation", "Visitor ID required"].map(r => (
                 <li key={r} className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-slate-600" /> {r}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && <ComplaintModal onClose={() => setShowForm(false)} onSubmit={handleTicket} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
