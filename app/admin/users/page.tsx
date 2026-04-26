'use client';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Atoms';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Form';
import type { PublicUser } from '@/lib/types';

export default function AdminUsersPage(): React.ReactElement {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { push } = useToast();

  function load(q = ''): void {
    setLoading(true);
    fetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      .then((r) => r.json())
      .then((data: { users: PublicUser[] }) => {
        setUsers(data.users ?? []);
      })
      .catch(() => push('error', 'Could not load users.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(u: PublicUser): Promise<void> {
    const next = u.status === 'active' ? 'suspended' : 'active';
    const res = await fetch(`/api/admin/users/${u.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      push('error', data.error ?? 'Could not update.');
      return;
    }
    push('success', `User ${next === 'active' ? 'reactivated' : 'suspended'}.`);
    load(search);
  }

  async function downloadExport(): Promise<void> {
    const res = await fetch('/api/admin/export/users');
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      push('error', data.error ?? 'Could not export.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(search);
          }}
          className="flex-1 min-w-[240px]"
        >
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <Button variant="secondary" onClick={downloadExport}>
          Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-white/50">Loading…</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 font-medium text-white/70">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-white/70">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-medium">{u.display_name}</td>
                    <td className="px-4 py-3 text-white/70">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge color="blue">{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={u.status === 'active' ? 'green' : 'red'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleStatus(u)}
                        className="text-xs text-brand-300 hover:underline"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
