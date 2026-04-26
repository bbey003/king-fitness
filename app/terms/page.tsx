import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage(): React.ReactElement {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display font-bold text-4xl mb-2">Terms of Service</h1>
      <p className="text-white/50 text-sm mb-10">Last updated: April 26, 2026</p>

      <div className="space-y-8 text-white/80 leading-relaxed">
        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">1. Booking and cancellation</h2>
          <p>
            Sessions in packs (5 or 10) expire 3 months after purchase. Cancel up to 24
            hours before your session for a full refund. Cancellations after that
            window are at the trainer's discretion.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">2. Health disclaimer</h2>
          <p>
            Personal training is not medical advice. Consult a doctor before starting any
            new exercise program, especially if you have a medical condition or injury.
            You assume all risk associated with physical activity.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">3. Equipment purchases</h2>
          <p>
            All sales are subject to product availability. Returns accepted within 30
            days for unused items in original packaging. Shipping fees are non-refundable.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">4. Account security</h2>
          <p>
            You are responsible for keeping your password secure. Notify us immediately
            of any unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">5. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, King Fitness's liability is limited
            to the amount you paid for the service or product giving rise to the claim.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">6. Changes</h2>
          <p>
            We may update these terms from time to time. Material changes will be
            announced by email at least 30 days before they take effect.
          </p>
        </section>
      </div>
    </article>
  );
}
