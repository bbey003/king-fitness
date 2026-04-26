import { auditRepo } from '@/lib/repos/misc';
import { userRepo } from '@/lib/repos/users';
import { Badge, EmptyState } from '@/components/ui/Atoms';
import { ClipboardList } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogPage(): Promise<React.ReactElement> {
  const logs = await auditRepo.list({ limit: 200 });
  const enriched = await Promise.all(
    logs.map(async (l) => {
      const u = l.actor_id ? await userRepo.findById(l.actor_id) : null;
      return { ...l, actor_email: u?.email ?? '—' };
    })
  );

  if (enriched.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList size={28} aria-hidden="true" />}
        title="Audit log is empty"
        message="System activity will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display font-semibold text-xl">Audit log</h2>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 font-medium text-white/70">Time</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Actor</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Action</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Target</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((l) => (
                <tr key={l.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 text-white/60 text-xs whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-white/80 text-xs">{l.actor_email}</td>
                  <td className="px-4 py-3">
                    <Badge color="blue">{l.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-white/60 text-xs font-mono">
                    {l.target_type ?? '—'}
                    {l.target_id ? ` · ${l.target_id.slice(0, 8)}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
