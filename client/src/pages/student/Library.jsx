import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, Search, BookOpen, ChevronDown, AlertTriangle,
  CheckCircle2, Clock, X, RefreshCw, Star, Tag, User
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const GENRES = ['All', 'Computer Science', 'Mathematics', 'Engineering', 'Literature', 'Science', 'Management'];

const BOOKS = [
  { id: 'LIB-001', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest', genre: 'Computer Science', isbn: '978-0262033848', copies: 8, available: 3, rating: 4.8, issued: false },
  { id: 'LIB-002', title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', genre: 'Computer Science', isbn: '978-1119800361', copies: 12, available: 0, rating: 4.6, issued: false },
  { id: 'LIB-003', title: 'Engineering Mathematics Vol. II', author: 'Grewal B.S.', genre: 'Mathematics', isbn: '978-8174091956', copies: 25, available: 11, rating: 4.5, issued: true, dueDate: '2026-03-28' },
  { id: 'LIB-004', title: 'Design of Machine Elements', author: 'Shigley, Mischke', genre: 'Engineering', isbn: '978-0073529288', copies: 10, available: 4, rating: 4.4, issued: false },
  { id: 'LIB-005', title: 'Database Management Systems', author: 'Ramakrishnan & Gehrke', genre: 'Computer Science', isbn: '978-0072465631', copies: 15, available: 6, rating: 4.7, issued: false },
  { id: 'LIB-006', title: 'Computer Networks', author: 'Tanenbaum & Wetherall', genre: 'Computer Science', isbn: '978-0132126953', copies: 9, available: 2, rating: 4.6, issued: false },
  { id: 'LIB-007', title: 'The Lean Startup', author: 'Eric Ries', genre: 'Management', isbn: '978-0307887894', copies: 5, available: 5, rating: 4.3, issued: false },
  { id: 'LIB-008', title: 'Physics for Scientists & Engineers', author: 'Serway & Jewett', genre: 'Science', isbn: '978-1337553278', copies: 18, available: 7, rating: 4.4, issued: false },
];

const MY_ISSUED = [
  { bookId: 'LIB-003', title: 'Engineering Mathematics Vol. II', issueDate: '2026-03-14', dueDate: '2026-03-28', fine: 0 },
];

export default function StudentLibrary() {
  const { user } = useAuth();
  const { push } = useToast();
  const [books, setBooks] = useState(BOOKS);
  const [myIssued, setMyIssued] = useState(MY_ISSUED);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [activeTab, setActiveTab] = useState('catalog'); // catalog | mybooks

  const filtered = books.filter(b =>
    (genre === 'All' || b.genre === genre) &&
    (search === '' || b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) || b.isbn.includes(search))
  );

  const handleIssue = (bookId) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.available === 0) return;
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, available: b.available - 1 } : b));
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 14);
    setMyIssued(prev => [...prev, {
      bookId,
      title: book.title,
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: dueDate.toISOString().split('T')[0],
      fine: 0,
    }]);
    push({ type: 'success', title: 'Book Issued!', body: `"${book.title}" issued for 14 days. Due: ${dueDate.toDateString()}.` });
  };

  const handleReturn = (bookId) => {
    setMyIssued(prev => prev.filter(b => b.bookId !== bookId));
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, available: b.available + 1 } : b));
    push({ type: 'success', title: 'Book Returned', body: 'Thank you! Return recorded successfully.' });
  };

  const handleReserve = (book) => {
    push({ type: 'info', title: 'Reservation Queued', body: `You'll be notified when "${book.title}" is available.` });
  };

  const overdue = myIssued.filter(b => new Date(b.dueDate) < new Date());

  return (
    <DashboardLayout title="Library" role={user?.role || 'STUDENT'}>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Library size={28} className="text-emerald-500" /> Digital Library
          </h2>
          <p className="text-slate-400 mt-1">Search, issue, and return books. Real-time availability tracking.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {books.filter(b => b.available > 0).length} titles available now
        </div>
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <div className="mb-5 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 font-bold">{overdue.length} book{overdue.length > 1 ? 's are' : ' is'} overdue! Return immediately to avoid fines (₹2/day).</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Titles', value: books.length, color: '#6366f1' },
          { label: 'Available Now', value: books.reduce((s,b) => s + b.available, 0), color: '#10b981' },
          { label: 'My Issued', value: myIssued.length, color: '#3b82f6' },
          { label: 'Overdue', value: overdue.length, color: '#ef4444' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="p-4 rounded-2xl bg-[#080808] border border-white/5 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-2xl font-black text-white leading-none">{s.value}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
            <div className="w-2 h-10 rounded-full" style={{ background: s.color }} />
          </motion.div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-5">
        {[['catalog','📚 Book Catalog'], ['mybooks','🔖 My Books']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              activeTab === id ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'catalog' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, author, or ISBN..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600" />
            </div>
            <select value={genre} onChange={e => setGenre(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none">
              {GENRES.map(g => <option key={g} value={g} className="bg-slate-900">{g}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((book, i) => {
                const isIssued = myIssued.some(b => b.bookId === book.id);
                return (
                  <motion.div key={book.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[#080808] border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-12 h-14 rounded-xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center font-black text-lg text-white shadow-lg"
                      style={{ background: `hsl(${(book.title.charCodeAt(0) * 17) % 360}, 60%, 25%)` }}>
                      {book.title[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{book.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{book.author}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[9px]">
                        <span className="text-slate-600 font-mono">{book.isbn}</span>
                        <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold">{book.genre}</span>
                        <span className="text-amber-400 flex items-center gap-0.5"><Star size={9} fill="currentColor" /> {book.rating}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right mr-4 hidden sm:block">
                      <p className={`text-sm font-black ${book.available > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{book.available}</p>
                      <p className="text-[9px] text-slate-500">of {book.copies}</p>
                    </div>
                    {isIssued ? (
                      <button onClick={() => handleReturn(book.id)}
                        className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-colors flex-shrink-0 flex items-center gap-1.5">
                        <RefreshCw size={11} /> Return
                      </button>
                    ) : book.available > 0 ? (
                      <button onClick={() => handleIssue(book.id)}
                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-colors flex-shrink-0 flex items-center gap-1.5">
                        <BookOpen size={11} /> Issue
                      </button>
                    ) : (
                      <button onClick={() => handleReserve(book)}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors flex-shrink-0">
                        Reserve
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}

      {activeTab === 'mybooks' && (
        <div className="space-y-3">
          {myIssued.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <Library size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No books currently issued.</p>
              <button onClick={() => setActiveTab('catalog')} className="mt-3 text-emerald-400 text-sm font-black underline hover:no-underline">Browse catalog →</button>
            </div>
          ) : myIssued.map((b, i) => {
            const daysLeft = Math.ceil((new Date(b.dueDate) - new Date()) / 86400000);
            const isOver = daysLeft < 0;
            return (
              <motion.div key={b.bookId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${isOver ? 'bg-red-500/5 border-red-500/20' : 'bg-[#080808] border-white/5'}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{b.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-500">
                    <span>Issued: {b.issueDate}</span>
                    <span>Due: {b.dueDate}</span>
                    <span className={`font-black ${isOver ? 'text-red-400' : daysLeft <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isOver ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleReturn(b.bookId)}
                  className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-colors flex items-center gap-1.5">
                  <RefreshCw size={11} /> Return Now
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
