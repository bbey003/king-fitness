import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { bookingRepo, serviceRepo } from '@/lib/repos/bookings';
import { ensureSeeded } from '@/lib/seed';
import { MyBookingsClient, type BookingWithService } from './MyBookingsClient';

export const dynamic = 'force-dynamic';

export default async function MyBookingsPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account/bookings');
  await ensureSeeded();

  const bookings = await bookingRepo.listForUser(user.id);
  const enriched: BookingWithService[] = await Promise.all(
    bookings.map(async (b) => {
      const service = await serviceRepo.findById(b.service_id);
      return {
        ...b,
        service_name: service?.name ?? 'Service',
        cancellation_cutoff_hours: service?.cancellation_cutoff_hours ?? 24,
      };
    })
  );

  return <MyBookingsClient bookings={enriched} />;
}
