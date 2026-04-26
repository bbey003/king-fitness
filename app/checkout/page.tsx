import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { CheckoutClient } from './CheckoutClient';

export const metadata: Metadata = { title: 'Checkout' };
export const dynamic = 'force-dynamic';

export default async function CheckoutPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/checkout');

  return <CheckoutClient userEmail={user.email} userName={user.display_name} />;
}
