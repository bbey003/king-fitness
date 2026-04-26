'use client';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function FloatingCard({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4 }}
      className={`glass-card p-6 transition-shadow hover:shadow-glow ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}): React.ReactElement {
  const ax = align === 'center' ? 'text-center mx-auto' : '';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
      className={`max-w-2xl ${ax}`}
    >
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.2em] text-brand-300 font-semibold mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-white/70 text-lg">{subtitle}</p>}
    </motion.div>
  );
}
