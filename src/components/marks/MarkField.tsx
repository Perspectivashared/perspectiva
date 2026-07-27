import { useMemo } from 'react';
import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { scatterPositions, resolvedPositions, type Point } from './markLayout';

export interface MarkFieldProps {
  count?: number;
  shape?: 'grid' | 'distribution';
  cols?: number;
  driven?: 'scroll' | 'auto' | 'static';
  /** Required when driven='scroll' — an external 0..1 scroll progress. */
  progress?: MotionValue<number>;
  markSize?: number;
  seed?: number;
  className?: string;
}

const VIEW = 1000; // SVG viewBox units
// framer-motion cannot interpolate between two hsl(var(--x)) strings, so the
// scattered→resolved tone is driven by OPACITY over a single resolved-token
// fill. This stays theme-correct (the token flips per theme) and animatable.
const FILL = 'hsl(var(--mark-resolved))';
const FADED = 0.25;

export function MarkField({
  count = 120,
  shape = 'grid',
  cols,
  driven = 'auto',
  progress,
  markSize = 6,
  seed = 1,
  className,
}: MarkFieldProps) {
  const reduce = useReducedMotion();
  const from = useMemo(() => scatterPositions(count, seed), [count, seed]);
  const to = useMemo(() => resolvedPositions(count, shape, cols), [count, shape, cols]);

  // Reduced-motion OR static → render the resolved end-state directly (parity).
  const isStatic = reduce || driven === 'static';
  if (isStatic) {
    return (
      <svg aria-hidden viewBox={`0 0 ${VIEW} ${VIEW}`} className={className} preserveAspectRatio="xMidYMid meet">
        {to.map((p, i) => (
          <circle key={i} cx={p.x * VIEW} cy={p.y * VIEW} r={markSize} fill={FILL} />
        ))}
      </svg>
    );
  }

  if (driven === 'scroll' && progress) {
    return (
      <svg aria-hidden viewBox={`0 0 ${VIEW} ${VIEW}`} className={className} preserveAspectRatio="xMidYMid meet">
        {from.map((p, i) => (
          <ScrollDot key={i} from={p} to={to[i]} progress={progress} markSize={markSize} />
        ))}
      </svg>
    );
  }

  // 'auto' — gentle autonomous settle from scatter to resolved.
  return (
    <svg aria-hidden viewBox={`0 0 ${VIEW} ${VIEW}`} className={className} preserveAspectRatio="xMidYMid meet">
      {from.map((p, i) => (
        <motion.circle
          key={i}
          r={markSize}
          fill={FILL}
          initial={{ cx: p.x * VIEW, cy: p.y * VIEW, opacity: FADED }}
          animate={{ cx: to[i].x * VIEW, cy: to[i].y * VIEW, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.004 }}
        />
      ))}
    </svg>
  );
}

function ScrollDot({
  from,
  to,
  progress,
  markSize,
}: {
  from: Point;
  to: Point;
  progress: MotionValue<number>;
  markSize: number;
}) {
  const cx = useTransform(progress, [0, 1], [from.x * VIEW, to.x * VIEW]);
  const cy = useTransform(progress, [0, 1], [from.y * VIEW, to.y * VIEW]);
  const opacity = useTransform(progress, [0, 1], [FADED, 1]);
  return <motion.circle cx={cx} cy={cy} r={markSize} fill={FILL} style={{ opacity }} />;
}
