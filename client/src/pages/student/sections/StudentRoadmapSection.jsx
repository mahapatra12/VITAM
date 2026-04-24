import { Map } from 'lucide-react';
import { GlassCard } from '../../../components/ui/DashboardComponents';
import StarMap from '../../../components/ui/StarMap';

export default function StudentRoadmapSection() {
  return (
    <div className="grid grid-cols-1 gap-10">
      <GlassCard
        title="Career & Academic Roadmap"
        subtitle="Professional trajectory visualization"
        icon={Map}
        className="min-h-[500px] items-center justify-center overflow-hidden border-white/5 bg-slate-950/20 p-0"
      >
        <StarMap />
      </GlassCard>
    </div>
  );
}
