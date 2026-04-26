import type { Metadata } from 'next';
import { ensureSeeded } from '@/lib/seed';
import { serviceRepo } from '@/lib/repos/bookings';
import { getCurrentUser } from '@/lib/auth';
import { ServicesClient } from './ServicesClient';

export const metadata: Metadata = {
  title: 'Book a Session',
  description:
    'Book 1-on-1 personal training sessions with King. Single sessions, 5-packs, and 10-packs available.',
};

export const dynamic = 'force-dynamic';

export default async function ServicesPage(): Promise<React.ReactElement> {
  const providerId = await ensureSeeded();
  const services = await serviceRepo.listActive();
  const user = await getCurrentUser();

  return (
    <ServicesClient
      services={services}
      providerId={providerId}
      isLoggedIn={!!user}
    />
  );
}
