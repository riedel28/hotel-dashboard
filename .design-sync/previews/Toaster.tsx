import * as React from 'react';
import { toast, Toaster } from 'tanstack-dashboard-ui';

/**
 * `Toaster` only renders the region — toasts arrive through the imperative
 * `toast()` call, so a static tree captures an empty card. These cells push
 * their toasts from an effect on mount, which is how the app does it too.
 */
function usePushed(push: () => void) {
  React.useEffect(() => {
    toast.dismiss();
    push();
  }, [push]);
}

const stage = {
  position: 'relative',
  minHeight: 260,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13
} as const;

export function Default() {
  usePushed(
    React.useCallback(() => {
      toast.success('Anna Krüger checked in to room 214');
      toast('Confirmation email sent', {
        description: 'Delivered to anna.krueger@mail.de'
      });
    }, [])
  );

  return (
    <div style={stage}>
      <span style={{ opacity: 0.55 }}>
        Mount once per app shell — front-office toasts render bottom-right.
      </span>
      {/* `expand` so a stacked pair is both visible; without it sonner
          collapses them and the capture clips the one behind. */}
      <Toaster expand duration={60000} />
    </div>
  );
}

export function TopCentered() {
  usePushed(
    React.useCallback(() => {
      toast('Night audit in progress', {
        description: '142 reservations to roll over.'
      });
    }, [])
  );

  return (
    <div style={stage}>
      <span style={{ opacity: 0.55 }}>
        Night-audit progress toasts, centred above the reservation grid.
      </span>
      <Toaster position="top-center" expand closeButton duration={60000} />
    </div>
  );
}

export function RichColors() {
  usePushed(
    React.useCallback(() => {
      toast.error('Card authorisation failed', {
        description: 'Take payment on arrival.'
      });
      toast.success('Booking saved');
    }, [])
  );

  return (
    <div style={stage}>
      <span style={{ opacity: 0.55 }}>
        Rich colours separate a failed card authorisation from a saved booking.
      </span>
      <Toaster position="bottom-right" richColors expand duration={60000} />
    </div>
  );
}
