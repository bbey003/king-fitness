import Link from 'next/link';
import { FloatingCard, SectionHeading } from '@/components/marketing/FloatingCard';
import { CheckCircle2, Award, Calendar } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About King',
  description:
    'I\'m King — a personal trainer who treats coaching like a craft. Read my story and what drives the work.',
};

export default function AboutPage(): React.ReactElement {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-mesh-grad opacity-60" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-300 font-semibold mb-3">
            About
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-6xl leading-tight">
            I'm King. I coach guys who are{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-brand-200">
              tired of going it alone.
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
            Eight years deep in the iron game, hundreds of clients in. This is what I do, why I do it,
            and how I'll work with you.
          </p>
        </div>
      </section>

      <section className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-invert">
          <div className="space-y-6 text-white/80 leading-relaxed text-lg">
            <p>
              I started lifting at 16 because I was the smallest kid in my class.
              Cliché? Maybe. But that first pump changed something — and I've been
              chasing it (and helping other people chase it) ever since.
            </p>
            <p>
              I went pro as a personal trainer at 23. NASM-certified, then PN-1, then a
              fistful of specialty cert's I won't bore you with. What matters is the work
              — eight years of it, with everyone from total beginners to former college
              athletes trying to get back in the game.
            </p>
            <p>
              <strong className="text-white">My philosophy is simple:</strong> the program
              has to fit your life, not the other way around. We're not training for the
              Olympics. We're training so you feel better in your skin, lift more than you
              did last month, and have the energy to actually live.
            </p>
            <p>
              When you book a session with me, you're not getting a one-size-fits-all
              template. You're getting a program built around your schedule, your goals,
              and the gear you've got. We adjust as we go. We track everything. And we
              don't quit on the hard days.
            </p>
            <p>That's the deal. If you're in, I'm in.</p>
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What I bring" title="Credentials and approach." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FloatingCard delay={0}>
              <Award size={24} className="text-brand-300 mb-4" aria-hidden="true" />
              <h3 className="font-display font-semibold mb-2">Certifications</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  NASM Certified Personal Trainer
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  Precision Nutrition Level 1
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  FRC Mobility Specialist
                </li>
              </ul>
            </FloatingCard>
            <FloatingCard delay={0.1}>
              <Calendar size={24} className="text-brand-300 mb-4" aria-hidden="true" />
              <h3 className="font-display font-semibold mb-2">How sessions work</h3>
              <p className="text-sm text-white/70">
                Each session is 60 minutes, in-person or via video. We'll start with an
                assessment, then build a 4-12 week program tailored to your goals.
              </p>
            </FloatingCard>
            <FloatingCard delay={0.2}>
              <CheckCircle2 size={24} className="text-brand-300 mb-4" aria-hidden="true" />
              <h3 className="font-display font-semibold mb-2">My promise</h3>
              <p className="text-sm text-white/70">
                You show up, do the work, and follow the plan — and you'll see real
                progress in the first 4 weeks. Period.
              </p>
            </FloatingCard>
          </div>
        </div>
      </section>

      <section className="relative py-12 pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/services" className="btn-primary">
            Let's get started
          </Link>
        </div>
      </section>
    </>
  );
}
