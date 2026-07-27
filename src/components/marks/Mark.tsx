import { cn } from '@/lib/utils';

const TONE = {
  faded: 'var(--mark-faded)',
  weak: 'var(--mark-weak)',
  mid: 'var(--mark-mid)',
  strong: 'var(--mark-strong)',
  resolved: 'var(--mark-resolved)',
} as const;

export interface MarkProps {
  tone?: keyof typeof TONE;
  size?: number;
  className?: string;
}

/** Single decorative dot — wordmark dot, list bullet, accent. */
export function Mark({ tone = 'resolved', size = 8, className }: MarkProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-block rounded-full align-middle', className)}
      style={{ width: size, height: size, backgroundColor: `hsl(${TONE[tone]})` }}
    />
  );
}
