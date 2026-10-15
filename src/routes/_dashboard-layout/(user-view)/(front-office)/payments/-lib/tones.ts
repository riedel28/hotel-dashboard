import type { PaymentStage, StageFlag } from 'shared/types/payments';

import type { BadgeColorProps } from '@/components/ui/badge';

/** One colour as the badge, the history's dot and its ring use it. */
interface Tone {
  badge: BadgeColorProps;
  dot: string;
  ring: string;
}

export const stageTones = {
  authorized: {
    badge: 'sky',
    dot: 'bg-sky-600 dark:bg-sky-400',
    ring: 'ring-sky-600/20 dark:ring-sky-400/25'
  },
  captured: {
    badge: 'indigo',
    dot: 'bg-indigo-600 dark:bg-indigo-400',
    ring: 'ring-indigo-600/20 dark:ring-indigo-400/25'
  },
  paid: {
    badge: 'emerald',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
    ring: 'ring-emerald-600/20 dark:ring-emerald-400/25'
  }
} satisfies Record<PaymentStage, Tone>;

// The red the other tables use for a negative balance
export const dangerText = 'text-danger';

// A hanging authorization only needs attention, so it is orange; a short
// capture is red
export const flagTones = {
  stale: {
    badge: 'orange',
    dot: 'bg-orange-500 dark:bg-orange-400',
    ring: 'ring-orange-500/25 dark:ring-orange-400/25',
    text: 'text-orange-700 dark:text-orange-300'
  },
  partial: {
    badge: 'rose',
    dot: 'bg-danger',
    ring: 'ring-danger/25',
    text: dangerText
  }
} satisfies Record<StageFlag['kind'], Tone & { text: string }>;
