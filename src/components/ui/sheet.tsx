'use client';

import { Drawer as SheetPrimitive } from '@base-ui/react/drawer';
import { Trans } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

// A panel that slides in from an edge, follows the finger and closes with a
// swipe back towards that edge, a tap outside or Escape. Built on the Base UI
// drawer; `side` sits on the root because the swipe direction is set there.

type SheetSide = 'left' | 'right' | 'bottom';

const SheetSideContext = React.createContext<SheetSide>('right');

const swipeDirections = {
  left: 'left',
  right: 'right',
  bottom: 'down'
} as const;

function Sheet({
  side = 'right',
  ...props
}: SheetPrimitive.Root.Props & { side?: SheetSide }) {
  return (
    <SheetSideContext value={side}>
      <SheetPrimitive.Root
        data-slot="sheet"
        swipeDirection={swipeDirections[side]}
        {...props}
      />
    </SheetSideContext>
  );
}

const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

// The viewport lays the panel against its edge
const viewportClassNames: Record<SheetSide, string> = {
  left: 'justify-start',
  right: 'justify-end',
  bottom: 'items-end'
};

// At rest the panel follows the swipe; it enters and leaves past its edge
const panelClassNames: Record<SheetSide, string> = {
  left: 'h-full w-3/4 border-r sm:max-w-sm [transform:translateX(var(--drawer-swipe-movement-x))] data-ending-style:[transform:translateX(-100%)] data-starting-style:[transform:translateX(-100%)]',
  right:
    'h-full w-3/4 border-l sm:max-w-sm [transform:translateX(var(--drawer-swipe-movement-x))] data-ending-style:[transform:translateX(100%)] data-starting-style:[transform:translateX(100%)]',
  // Clear of the home indicator and, while it is up, the on-screen keyboard
  bottom:
    'max-h-[85dvh] w-full rounded-t-xl ring-1 ring-foreground/10 pb-[calc(env(safe-area-inset-bottom)+var(--drawer-keyboard-inset,0px))] [transform:translateY(var(--drawer-swipe-movement-y))] data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]'
};

function SheetContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & { showCloseButton?: boolean }) {
  const side = React.use(SheetSideContext);

  return (
    // Sets --drawer-keyboard-inset while the on-screen keyboard is up
    <SheetPrimitive.VirtualKeyboardProvider>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Backdrop
          data-slot="sheet-overlay"
          className="fixed inset-0 z-50 bg-black opacity-[calc(0.5*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:opacity-0 data-swiping:duration-0"
        />
        <SheetPrimitive.Viewport
          className={cn('fixed inset-0 z-50 flex', viewportClassNames[side])}
        >
          <SheetPrimitive.Popup
            data-slot="sheet-content"
            className={cn(
              'relative flex flex-col bg-background shadow-lg outline-none',
              'transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-swiping:duration-0 data-swiping:select-none',
              panelClassNames[side],
              className
            )}
            {...props}
          >
            {side === 'bottom' && (
              // The grip that says it can be swiped away
              <div
                aria-hidden="true"
                className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30"
              />
            )}
            {/* Without it a mouse press starts a swipe and captures the
                pointer, so the click lands on the panel instead of the
                control. Touch still swipes from anywhere. */}
            <SheetPrimitive.Content className="flex min-h-0 flex-1 flex-col">
              {children}
            </SheetPrimitive.Content>
            {showCloseButton && (
              <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden disabled:pointer-events-none">
                <XIcon className="size-4" />
                <span className="sr-only">
                  <Trans>Close</Trans>
                </span>
              </SheetPrimitive.Close>
            )}
          </SheetPrimitive.Popup>
        </SheetPrimitive.Viewport>
      </SheetPrimitive.Portal>
    </SheetPrimitive.VirtualKeyboardProvider>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
};
