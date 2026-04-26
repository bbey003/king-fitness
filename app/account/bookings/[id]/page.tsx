import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { bookingRepo, serviceRepo } from '@/lib/repos/bookings';
import { ensureSeeded } from '@/lib/seed';
import { Badge } from '@/components/ui/Atoms';
import { formatCents } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  await ensureSeeded();

  const booking = await bookingRepo.findById(id);
  if (!booking) notFound();
  if (booking.user_id !== user.id && user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'provider') {
    redirect('/account/bookings');
  }
  const service = await serviceRepo.findById(booking.service_id);

  // Build .ics content
  const dtStart = new Date(booking.start_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtEnd = new Date(booking.end_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = encodeURIComponent(
    `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//King Fitness//Booking//EN\nBEGIN:VEVENT\nUID:${booking.id}@kingfitness\nDTSTAMP:${dtStart}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nSUMMARY:${service?.name ?? 'Training session'} with King\nDESCRIPTION:Personal training session\nLOCATION:King Fitness Studio\nEND:VEVENT\nEND:VCALENDAR`
  );

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-2xl mb-2">
          {service?.name ?? 'Booking'}
        </h2>
        <Badge color={booking.status === 'confirmed' ? 'green' : 'gray'}>
          {booking.status.replace(/_/g, ' ')}
        </Badge>

        <dl className="space-y-3 mt-6 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-3">
            <dt className="text-white/60">When</dt>
            <dd className="font-medium text-right">
              {new Date(booking.start_at).toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <dt className="text-white/60">Duration</dt>
            <dd className="font-medium">{service?.duration_minutes ?? 60} minutes</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <dt className="text-white/60">Sessions in pack</dt>
            <dd className="font-medium">{booking.sessions_remaining}</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <dt className="text-white/60">Paid</dt>
            <dd className="font-medium">{formatCents(booking.price_cents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/60">Booking ID</dt>
            <dd className="font-mono text-xs">{booking.id}</dd>
          </div>
        </dl>

        {booking.notes && (
          <div className="mt-6 p-4 rounded-xl bg-white/5">
            <p className="text-xs text-white/50 mb-1">Notes</p>
            <p className="text-sm">{booking.notes}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`data:text/calendar;charset=utf-8,${ics}`}
            download={`king-fitness-${booking.id}.ics`}
            className="btn-secondary text-sm"
          >
            Add to calendar
          </a>
          <Link href="/account/bookings" className="btn-ghost text-sm">
            ← All bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
