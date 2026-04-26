import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/Atoms';

export const dynamic = 'force-dynamic';

export default async function AccountPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-xl mb-4">Profile</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-3">
            <dt className="text-white/60">Name</dt>
            <dd className="font-medium">{user.display_name}</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <dt className="text-white/60">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <dt className="text-white/60">Account type</dt>
            <dd>
              <Badge color="blue">{user.role}</Badge>
            </dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <dt className="text-white/60">Member since</dt>
            <dd className="font-medium">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/60">Email verified</dt>
            <dd>
              {user.email_verified_at ? (
                <Badge color="green">Verified</Badge>
              ) : (
                <Badge color="yellow">Pending</Badge>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
