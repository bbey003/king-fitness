import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthorizedUser } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ShieldCheck,
  ClipboardList,
  Clock3,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const navItems = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', Icon: Users },
  { href: '/admin/bookings', label: 'Bookings', Icon: Calendar },
  { href: '/admin/availability', label: 'Availability', Icon: Clock3 },
  { href: '/admin/verifications', label: 'Verifications', Icon: ShieldCheck },
  { href: '/admin/audit-log', label: 'Audit log', Icon: ClipboardList },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login?next=/admin');
  if (!auth.isAdmin) redirect('/');

  return (
    <section className="relative pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-3xl">Admin</h1>
            <p className="text-white/60 text-sm mt-1">Logged in as {auth.user.email}</p>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Admin navigation">
            <ul className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {navItems.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 whitespace-nowrap transition-colors"
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}
