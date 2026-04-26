import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { User, Calendar, ShoppingBag, CreditCard, ShieldCheck, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

const links = [
  { href: '/account', label: 'Profile', Icon: User },
  { href: '/account/bookings', label: 'My bookings', Icon: Calendar },
  { href: '/account/orders', label: 'Orders', Icon: ShoppingBag },
  { href: '/account/payments', label: 'Payment history', Icon: CreditCard },
  { href: '/account/verification', label: 'Verification', Icon: ShieldCheck },
  { href: '/account/data', label: 'Privacy & data', Icon: Trash2 },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  return (
    <section className="relative pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl sm:text-4xl">
            Hi, {user.display_name}
          </h1>
          <p className="text-white/60 text-sm mt-1">{user.email}</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Account navigation">
            <ul className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {links.map(({ href, label, Icon }) => (
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
