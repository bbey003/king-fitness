import type { Metadata } from 'next';
import Link from 'next/link';
import { FloatingCard, SectionHeading } from '@/components/marketing/FloatingCard';
import { Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Workouts, mobility, recovery, and mindset — straight from the gym floor.',
};

const posts = [
  {
    slug: 'progressive-overload-explained',
    title: 'Progressive overload, explained without the BS',
    excerpt:
      "If you're not adding weight, reps, or quality every week, you're not training — you're working out. Here's the difference.",
    date: '2026-04-12',
    readTime: 6,
    tag: 'Programming',
  },
  {
    slug: 'mobility-routine-busy-people',
    title: 'A 10-minute mobility routine for busy people',
    excerpt:
      'Hips, shoulders, T-spine. Do this before any workout (or before sitting down for the rest of the day).',
    date: '2026-03-29',
    readTime: 4,
    tag: 'Mobility',
  },
  {
    slug: 'how-to-eat-for-muscle',
    title: 'How to eat for muscle without hating your life',
    excerpt:
      "Protein targets, calorie ranges, and what 'eat enough' actually looks like in real meals.",
    date: '2026-03-15',
    readTime: 8,
    tag: 'Nutrition',
  },
];

export default function BlogPage(): React.ReactElement {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-mesh-grad opacity-50" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-300 font-semibold mb-3">
            Blog
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight">
            Notes from the gym floor.
          </h1>
          <p className="mt-4 text-white/70 text-lg max-w-xl mx-auto">
            Workouts, mobility, recovery, and mindset — written for people who want to
            train, not just read about training.
          </p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p, i) => (
              <FloatingCard key={p.slug} delay={i * 0.1}>
                <p className="text-xs uppercase tracking-wider text-brand-300 font-semibold mb-3">
                  {p.tag}
                </p>
                <h2 className="font-display font-semibold text-xl mb-3 leading-tight">
                  {p.title}
                </h2>
                <p className="text-white/60 text-sm mb-4">{p.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10">
                  <span>
                    {new Date(p.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} aria-hidden="true" /> {p.readTime} min read
                  </span>
                </div>
              </FloatingCard>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-white/50 text-sm mb-4">
              More articles coming soon. Want them in your inbox?
            </p>
            <Link href="/#footer-email" className="btn-secondary text-sm">
              Subscribe to the newsletter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
