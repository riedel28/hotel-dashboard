import type { AdyenMethodId } from 'shared/types/providers';

import { cn } from '@/lib/utils';

export const BRAND_NAMES: Record<AdyenMethodId, string> = {
  mastercard: 'Mastercard',
  visa: 'Visa',
  amex: 'American Express',
  paypal: 'PayPal'
};

/** A payment method's logo as a small card-shaped chip. */
export function BrandMark({ brand }: { brand: AdyenMethodId }) {
  const chip =
    'flex h-5 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border';
  switch (brand) {
    case 'mastercard':
      return (
        <span className={cn(chip, 'border-border bg-white')}>
          <svg viewBox="0 0 32 20" className="h-3.5" aria-hidden="true">
            <circle cx="13" cy="10" r="6" fill="#EB001B" />
            <circle cx="19" cy="10" r="6" fill="#F79E1B" fillOpacity="0.85" />
          </svg>
        </span>
      );
    case 'visa':
      return (
        <span className={cn(chip, 'border-border bg-white')}>
          <span className="text-[10px] font-black tracking-tight text-[#1434CB] italic">
            VISA
          </span>
        </span>
      );
    case 'amex':
      return (
        <span className={cn(chip, 'border-transparent bg-[#016FD0]')}>
          <span className="text-[7px] font-bold tracking-tight text-white uppercase">
            Amex
          </span>
        </span>
      );
    case 'paypal':
      return (
        <span className={cn(chip, 'border-border bg-white')}>
          <span className="text-[8px] font-black italic">
            <span className="text-[#003087]">Pay</span>
            <span className="text-[#0079C1]">Pal</span>
          </span>
        </span>
      );
  }
}
