import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage(): React.ReactElement {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display font-bold text-4xl mb-2">Privacy Policy</h1>
      <p className="text-white/50 text-sm mb-10">
        Last updated: April 26, 2026
      </p>

      <div className="space-y-8 text-white/80 leading-relaxed">
        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">
            1. What we collect
          </h2>
          <p className="mb-3">
            When you use King Fitness, we collect:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-white/70">
            <li>Account info (name, email, password hash)</li>
            <li>Booking and order history</li>
            <li>Payment data via Stripe (we never store your card)</li>
            <li>IP address and browser info for security and analytics</li>
            <li>Cookies — only those you've consented to</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">
            2. How we use it
          </h2>
          <p>
            We use your data to operate the site (fulfill bookings and orders, send
            transactional emails), to communicate with you (only if you've opted in to
            marketing), and to keep the service secure (rate limits, fraud detection).
            We do not sell your data, ever.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">
            3. Your rights (GDPR)
          </h2>
          <p className="mb-3">If you're in the EU/UK you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1 text-white/70">
            <li>Access your data — exportable as JSON from your account page</li>
            <li>Correct or update your information</li>
            <li>Delete your account ("right to be forgotten") — within 30 days</li>
            <li>Withdraw consent for marketing emails at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">
            4. Cookies
          </h2>
          <p>
            We use three categories of cookies: necessary (always on, required for the
            site to work), analytics (only with your consent), and marketing (only with
            your consent). You can change your preferences any time by clearing your
            site data and refreshing.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">
            5. Third-party processors
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-white/70">
            <li>
              <strong>Stripe</strong> — payment processing
            </li>
            <li>
              <strong>Vercel/AWS</strong> — hosting (data stored in EU region by default)
            </li>
            <li>
              <strong>Resend</strong> — transactional email
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">
            6. Retention
          </h2>
          <p>
            Account data is kept for as long as your account is active. Transactions are
            kept for 7 years for accounting and legal reasons. Logs are kept for 90 days.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl mb-3 text-white">
            7. Contact
          </h2>
          <p>
            Questions? Email{' '}
            <a href="mailto:privacy@kingfitness.com" className="text-brand-300 underline">
              privacy@kingfitness.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
