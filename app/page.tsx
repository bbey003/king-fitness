import Link from 'next/link';
import { Hero } from '@/components/marketing/Hero';
import { FloatingCard, SectionHeading } from '@/components/marketing/FloatingCard';
import { Dumbbell, Trophy, Calendar, Heart, Star, ArrowRight } from 'lucide-react';

export default function HomePage(): React.ReactElement {
  return (
    <>
      <Hero />

      {/* Why King */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why King Fitness"
            title="Coaching that actually moves the needle."
            subtitle="No generic plans. No fluff. Just a program built around you, your schedule, and the results you're chasing."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FloatingCard delay={0}>
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 grid place-items-center mb-4">
                <Dumbbell size={24} className="text-brand-300" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Programs that fit your life
              </h3>
              <p className="text-white/60 text-sm">
                Whether you've got 30 minutes or 90, I build training that works around
                your week — not the other way around.
              </p>
            </FloatingCard>

            <FloatingCard delay={0.1}>
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 grid place-items-center mb-4">
                <Trophy size={24} className="text-brand-300" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Results you can see</h3>
              <p className="text-white/60 text-sm">
                500+ clients later, the formula's the same: progressive overload, smart
                nutrition, and showing up. We track every rep.
              </p>
            </FloatingCard>

            <FloatingCard delay={0.2}>
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 grid place-items-center mb-4">
                <Heart size={24} className="text-brand-300" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">In your corner</h3>
              <p className="text-white/60 text-sm">
                Text me between sessions. Stuck on form? Send a video. I'm not your app —
                I'm your coach.
              </p>
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* Transformations */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-transparent via-brand-900/10 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Real Results"
            title="Before and after — the proof is in the people."
            subtitle="Every client tells a different story. Here are a few of the guys who trusted the process and didn't look back."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Marcus T.',
                stat: 'Lost 32 lbs · 6 months',
                quote:
                  "King didn't just change my body. He changed how I show up to everything.",
              },
              {
                name: 'James R.',
                stat: 'Added 60 lbs to deadlift · 4 months',
                quote:
                  "I'd hit a wall for years. First month with King I PR'd three lifts.",
              },
              {
                name: 'David L.',
                stat: '15% body fat → 9% · 5 months',
                quote:
                  'Real coaching, real schedule, real accountability. Worth every dollar.',
              },
            ].map((t, i) => (
              <FloatingCard key={t.name} delay={i * 0.1}>
                <div className="flex gap-1 mb-3" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} size={14} className="fill-brand-300 text-brand-300" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-white/80 mb-4 italic">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-brand-300">{t.stat}</div>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative glass-card p-8 sm:p-14 text-center overflow-hidden glow-border">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-mesh-grad opacity-50"
            />
            <div className="relative">
              <h2 className="font-display font-bold text-3xl sm:text-5xl mb-4">
                Ready to start training?
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8 text-lg">
                Book your first session and let's see what you're really capable of.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/services" className="btn-primary">
                  <Calendar size={18} aria-hidden="true" /> Book a session
                </Link>
                <Link href="/about" className="btn-secondary">
                  Meet King <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
