import Link from 'next/link';
import { Zap, FileText, Target, MessageSquare, Calendar } from 'lucide-react';

const XP_ITEMS = [
  { icon: FileText, label: 'Signalement', xp: '+50', color: 'text-blue-500' },
  { icon: Target, label: 'Source', xp: '+20', color: 'text-green-500' },
  { icon: MessageSquare, label: 'Note', xp: '+15', color: 'text-purple-500' },
  { icon: Calendar, label: 'Bonus jour', xp: '+10', color: 'text-orange-500' },
];

export function SidebarGamification() {
  return (
    <div className="bg-surface-primary border-border-default rounded-2xl border p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Zap className="h-4 w-4 text-amber-500" />
        <h2 className="text-text-primary text-xs font-semibold">Gagnez de l&apos;XP</h2>
      </div>

      <div className="space-y-1">
        {XP_ITEMS.map(({ icon: Icon, label, xp, color }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Icon className={`h-3 w-3 ${color}`} />
              <span className="text-text-secondary text-[10px]">{label}</span>
            </div>
            <span className="text-text-primary text-[10px] font-semibold">{xp} XP</span>
          </div>
        ))}
      </div>

      <Link
        href="/register"
        className="bg-drapeau-rouge mt-3 block w-full rounded-lg py-1.5 text-center text-xs font-semibold text-white transition-colors hover:bg-red-700"
      >
        Créer mon compte
      </Link>
    </div>
  );
}
