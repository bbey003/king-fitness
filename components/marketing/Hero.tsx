'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Dumbbell, Flame, TrendingUp, Activity } from 'lucide-react';

const RINGS = [
  { r: 118, progress: 0.85, color: '#5478ff', delay: 0.6, strokeWidth: 7 },
  { r: 93,  progress: 0.72, color: '#8aa6ff', delay: 0.8, strokeWidth: 6 },
  { r: 68,  progress: 0.91, color: '#bccdff', delay: 1.0, strokeWidth: 5 },
];

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-[360px] h-[360px] flex items-center justify-center mx-auto"
    >
      {/* Ambient glow behind rings */}
      <div className="absolute w-48 h-48 rounded-full bg-brand-500/20 blur-3xl animate-pulse-glow" />

      {/* Progress rings */}
      <svg width="320" height="320" viewBox="0 0 320 320" className="absolute" aria-hidden="true">
        {/* Track (background) rings */}
        {RINGS.map((ring) => (
          <circle
            key={`track-${ring.r}`}
            cx="160" cy="160" r={ring.r}
            fill="none"
            stroke={ring.color}
            strokeWidth={ring.strokeWidth}
            opacity="0.12"
          />
        ))}
        {/* Animated progress arcs — rotated so they start from the top */}
        <g transform="rotate(-90 160 160)">
          {RINGS.map((ring) => {
            const circ = 2 * Math.PI * ring.r;
            return (
              <motion.circle
                key={`arc-${ring.r}`}
                cx="160" cy="160" r={ring.r}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ * (1 - ring.progress) }}
                transition={{ duration: 1.8, delay: ring.delay, ease: 'easeOut' }}
              />
            );
          })}
        </g>
      </svg>

      {/* Centre icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5, type: 'spring', stiffness: 200 }}
        className="relative z-10 w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 grid place-items-center backdrop-blur-sm"
      >
        <Dumbbell size={28} className="text-brand-300" />
      </motion.div>

      {/* Floating metric: calories — top-right */}
      <motion.div
        initial={{ opacity: 0, x: 16, y: -8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 1.4 }}
        className="absolute top-4 right-0 glass-card px-3 py-2 flex items-center gap-2 animate-float"
        style={{ animationDelay: '0.5s' }}
      >
        <div className="w-7 h-7 rounded-lg bg-orange-500/20 grid place-items-center flex-shrink-0">
          <Flame size={14} className="text-orange-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-white leading-none">2,840</p>
          <p className="text-[10px] text-white/50 mt-0.5">cal burned</p>
        </div>
      </motion.div>

      {/* Floating metric: rating — left */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.6 }}
        className="absolute top-1/3 left-0 glass-card px-3 py-2 flex items-center gap-2 animate-float"
        style={{ animationDelay: '2s' }}
      >
        <div className="w-7 h-7 rounded-lg bg-brand-500/20 grid place-items-center flex-shrink-0">
          <Activity size={14} className="text-brand-300" />
        </div>
        <div>
          <p className="text-xs font-bold text-white leading-none">4.9★</p>
          <p className="text-[10px] text-white/50 mt-0.5">avg. rating</p>
        </div>
      </motion.div>

      {/* Floating metric: client progress — bottom-right */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.8 }}
        className="absolute bottom-6 right-2 glass-card px-3 py-2 flex items-center gap-2 animate-float"
        style={{ animationDelay: '4s' }}
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 grid place-items-center flex-shrink-0">
          <TrendingUp size={14} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-white leading-none">−32 lbs</p>
          <p className="text-[10px] text-white/50 mt-0.5">avg. client loss</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Hero(): React.ReactElement {
  return (
    <section className="relative overflow-hidden">
      {/* Mesh background */}
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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left: copy */}
          <div>
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

          {/* Right: animated visual (desktop only) */}
          <div className="hidden lg:flex items-center justify-center">
            <HeroVisual />
          </div>

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
