import type { ReactNode } from 'react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }): React.ReactElement {
  const dim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block ${dim} border-2 border-brand-400 border-t-transparent rounded-full animate-spin`}
    />
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}): React.ReactElement {
  return (
    <div className="text-center py-16 px-6 glass-card">
      {icon && <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center text-brand-300">{icon}</div>}
      <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
      {message && <p className="text-white/60 text-sm max-w-sm mx-auto">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

const badgeColors = {
  blue: 'bg-brand-500/20 text-brand-200 border border-brand-400/30',
  green: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  red: 'bg-red-500/20 text-red-200 border border-red-400/30',
  yellow: 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30',
  gray: 'bg-white/10 text-white/70 border border-white/20',
  orange: 'bg-orange-500/20 text-orange-200 border border-orange-400/30',
} as const;

export function Badge({
  color = 'gray',
  children,
}: {
  color?: keyof typeof badgeColors;
  children: ReactNode;
}): React.ReactElement {
  return <span className={`badge ${badgeColors[color]}`}>{children}</span>;
}
