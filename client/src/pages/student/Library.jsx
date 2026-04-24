import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  Library,
  RefreshCw,
  Search,
  Star
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const GENRES = ['All', 'Computer Science', 'Mathematics', 'Engineering', 'Literature', 'Science', 'Management'];

const BOOKS = [
  { id: 'LIB-001', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest', genre: 'Computer Science', isbn: '978-0262033848', copies: 8, available: 3, rating: 4.8 },
  { id: 'LIB-002', title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', genre: 'Computer Science', isbn: '978-1119800361', copies: 12, available: 0, rating: 4.6 },
  { id: 'LIB-003', title: 'Engineering Mathematics Vol. II', author: 'Grewal B.S.', genre: 'Mathematics', isbn: '978-8174091956', copies: 25, available: 11, rating: 4.5 },
  { id: 'LIB-004', title: 'Design of Machine Elements', author: 'Shigley, Mischke', genre: 'Engineering', isbn: '978-0073529288', copies: 10, available: 4, rating: 4.4 },
  { id: 'LIB-005', title: 'Database Management Systems', author: 'Ramakrishnan & Gehrke', genre: 'Computer Science', isbn: '978-0072465631', copies: 15, available: 6, rating: 4.7 },
  { id: 'LIB-006', title: 'Computer Networks', author: 'Tanenbaum & Wetherall', genre: 'Computer Science', isbn: '978-0132126953', copies: 9, available: 2, rating: 4.6 },
  { id: 'LIB-007', title: 'The Lean Startup', author: 'Eric Ries', genre: 'Management', isbn: '978-0307887894', copies: 5, available: 5, rating: 4.3 },
  { id: 'LIB-008', title: 'Physics for Scientists & Engineers', author: 'Serway & Jewett', genre: 'Science', isbn: '978-1337553278', copies: 18, available: 7, rating: 4.4 }
];

const MY_ISSUED = [
  { bookId: 'LIB-003', title: 'Engineering Mathematics Vol. II', issueDate: '14 Mar 2026', dueDate: '2026-03-28', fine: 0 }
];

export default function StudentLibrary() {
  const { user } = useAuth();
  const { push } = useToast();
  const [books, setBooks] = useState(BOOKS);
  const [myIssued, setMyIssued] = useState(MY_ISSUED);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [activeTab, setActiveTab] = useState('catalog');

  const filtered = books.filter((book) =>
    (genre === 'All' || book.genre === genre) &&
    (search === '' ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn.includes(search))
  );

  const handleIssue = (bookId) => {
    const book = books.find((entry) => entry.id === bookId);
    if (!book || book.available === 0) {
      return;
    }

    setBooks((previous) => previous.map((entry) => (entry.id === bookId ? { ...entry, available: entry.available - 1 } : entry)));
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    setMyIssued((previous) => [
      ...previous,
      {
        bookId,
        title: book.title,
        issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        dueDate: dueDate.toISOString().split('T')[0],
        fine: 0
      }
    ]);

    push({
      type: 'success',
      title: 'Book Issued',
      body: `"${book.title}" was issued for 14 days.`
    });
  };

  const handleReturn = (bookId) => {
    setMyIssued((previous) => previous.filter((entry) => entry.bookId !== bookId));
    setBooks((previous) => previous.map((entry) => (entry.id === bookId ? { ...entry, available: entry.available + 1 } : entry)));
    push({ type: 'success', title: 'Book Returned', body: 'Return recorded successfully.' });
  };

  const handleReserve = (book) => {
    push({
      type: 'info',
      title: 'Reservation Queued',
      body: `You will be notified when "${book.title}" becomes available.`
    });
  };

  const overdue = myIssued.filter((book) => new Date(book.dueDate) < new Date());

  return (
    <DashboardLayout title="Library" role={user?.role || 'STUDENT'}>
      <WorkspaceHero
        eyebrow="Library workspace"
        title="Digital library and issue desk"
        description="Search titles, issue books, track due dates, and manage reading access from a cleaner interface designed to make library actions faster and easier to scan."
        icon={Library}
        badges={[
          `${books.length} titles indexed`,
          `${books.filter((book) => book.available > 0).length} titles available`,
          overdue.length > 0 ? `${overdue.length} overdue` : 'No overdue items'
        ]}
        stats={[
          { label: 'Total titles', value: String(books.length) },
          { label: 'Available copies', value: String(books.reduce((sum, book) => sum + book.available, 0)) },
          { label: 'My issued books', value: String(myIssued.length) },
          { label: 'Overdue books', value: String(overdue.length) }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Reading status
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Library access is healthy
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Best next action
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Search by title or author first, then narrow by genre to find relevant books faster.
                </p>
              </div>
              {overdue.length > 0 ? (
                <div className="surface-card border-red-500/20 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-red-300">
                    Attention needed
                  </p>
                  <p className="mt-3 text-sm leading-6 text-red-100">
                    You have overdue books that should be returned immediately to avoid additional fines.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      />

      {overdue.length > 0 ? (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertTriangle size={16} className="shrink-0 text-red-400" />
          <p className="text-sm font-bold text-red-200">
            {overdue.length} book{overdue.length > 1 ? 's are' : ' is'} overdue. Return immediately to avoid fines.
          </p>
        </div>
      ) : null}

      <div className="mb-5 flex gap-2">
        {[
          ['catalog', 'Book Catalog'],
          ['mybooks', 'My Books']
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`${activeTab === id ? 'status-pill border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'status-pill'} transition-all`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'catalog' ? (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, author, or ISBN..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/75 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-500/40"
              />
            </div>

            <select
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-slate-200 outline-none"
            >
              {GENRES.map((entry) => (
                <option key={entry} value={entry} className="bg-slate-900">
                  {entry}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((book, index) => {
                const isIssued = myIssued.some((entry) => entry.bookId === book.id);
                return (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="surface-card flex items-center gap-4 p-4"
                  >
                    <div
                      className="flex h-14 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white shadow-lg"
                      style={{ background: `hsl(${(book.title.charCodeAt(0) * 17) % 360}, 60%, 25%)` }}
                    >
                      {book.title[0]}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white">
                        {book.title}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {book.author}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px]">
                        <span className="font-mono text-slate-500">
                          {book.isbn}
                        </span>
                        <span className="status-pill border-indigo-500/20 bg-indigo-500/10 text-indigo-200">
                          {book.genre}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-300">
                          <Star size={10} fill="currentColor" />
                          {book.rating}
                        </span>
                      </div>
                    </div>

                    <div className="hidden shrink-0 text-right sm:block">
                      <p className={`text-sm font-black ${book.available > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                        {book.available}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        of {book.copies}
                      </p>
                    </div>

                    {isIssued ? (
                      <button type="button" onClick={() => handleReturn(book.id)} className="btn-secondary">
                        <RefreshCw size={13} />
                        Return
                      </button>
                    ) : book.available > 0 ? (
                      <button type="button" onClick={() => handleIssue(book.id)} className="btn-primary">
                        <BookOpen size={13} />
                        Issue
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleReserve(book)} className="btn-secondary border-red-500/20 bg-red-500/5 text-red-200 hover:border-red-500/30 hover:bg-red-500/10">
                        Reserve
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      ) : null}

      {activeTab === 'mybooks' ? (
        <GlassCard title="My Issued Books" subtitle="Books currently assigned to you">
          <div className="mt-4 space-y-3">
            {myIssued.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Library size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">
                  No books currently issued.
                </p>
              </div>
            ) : (
              myIssued.map((book) => {
                const daysLeft = Math.ceil((new Date(book.dueDate) - new Date()) / 86400000);
                const isOverdue = daysLeft < 0;
                return (
                  <div key={book.bookId} className={`surface-card flex items-center justify-between gap-4 p-5 ${isOverdue ? 'border-red-500/20 bg-red-500/5' : ''}`}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white">
                        {book.title}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        <span>Issued: {book.issueDate}</span>
                        <span>Due: {book.dueDate}</span>
                        <span className={isOverdue ? 'text-red-300' : daysLeft <= 3 ? 'text-amber-300' : 'text-emerald-300'}>
                          {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                        </span>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleReturn(book.bookId)} className="btn-secondary">
                      <RefreshCw size={13} />
                      Return now
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      ) : null}
    </DashboardLayout>
  );
}
