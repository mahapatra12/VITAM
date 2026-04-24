export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-slate-300">
      <div className="w-10 h-10 border-4 border-appleBlue/30 border-t-appleBlue rounded-full animate-spin" />
      <p className="text-xs font-bold mt-2 uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}
