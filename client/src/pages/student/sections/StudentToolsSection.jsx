import AIChat from '../../../components/AIChat';
import CommandFeed from '../../../components/ui/CommandFeed';

export default function StudentToolsSection() {
  return (
    <div className="space-y-14">
      <CommandFeed limit={3} filter={['INFO', 'ADVISORY', 'SECURITY', 'CRITICAL']} />
      <AIChat role="student" />
    </div>
  );
}
