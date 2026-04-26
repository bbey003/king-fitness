'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export function Hero(): React.ReactElement {
  return (
    <section className="relative overflow-hidden">
      {/* Animated mesh background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-mesh-grad opacity-80 pointer-events-none"
      />
      {/* Floating orbs */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-brand-500/30 blur-3xl animate-float" />
        <div
          className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-brand-800/40 blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl animate-float"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium mb-6"
          >
            <Zap size={14} className="text-brand-300" aria-hidden="true" />
            <span>Now booking new clients · 1:1 personal training</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight"
          >
            Your strongest year{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-brand-400 to-brand-200">
              starts here.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl"
          >
            I'm King — a personal trainer who's helped hundreds of guys get leaner,
            stronger, and more confident. One-on-one sessions, real programs, real results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link href="/services" className="btn-primary">
              Book a session <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/products" className="btn-secondary">
              Shop equipment
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-14 grid grid-cols-3 max-w-lg gap-6"
          >
            {[
              { num: '500+', label: 'clients coached' },
              { num: '8 yrs', label: 'experience' },
              { num: '4.9★', label: 'avg. rating' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-2xl sm:text-3xl font-display font-bold text-brand-200">
                  {s.num}
                </dt>
                <dd className="text-xs sm:text-sm text-white/60 mt-1">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-ink-950 pointer-events-none"
      />
    </section>
  );
}
