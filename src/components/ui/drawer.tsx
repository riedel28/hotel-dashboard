import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Trans } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// A modal panel for forms that need more room than a centred dialog: a
// full-height panel on the right from `sm` up, a bottom sheet on phones.
// Built on the same Base UI dialog as `Dialog`, so popovers and menus nest
// inside it. The page behind is dimmed but not blurred.

function Drawer({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="drawer-overlay"
        className="fixed inset-0 isolate z-50 bg-black/10 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <DialogPrimitive.Popup
        data-slot="drawer-content"
        className={cn(
          'fixed z-50 flex w-full flex-col bg-card text-sm ring-1 ring-foreground/10 duration-200 outline-none data-open:animate-in data-closed:animate-out',
          // Phones: rises from the bottom, as tall as its content up to 90%
          // of the screen.
          'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-xl max-sm:data-open:slide-in-from-bottom max-sm:data-closed:slide-out-to-bottom',
          // From sm up: full height on the right edge.
          'sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:max-w-xl sm:rounded-none sm:data-open:slide-in-from-right sm:data-closed:slide-out-to-right',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          data-slot="drawer-close"
          render={
            <Button
              variant="ghost"
              className="absolute top-3 right-4"
              size="icon-sm"
            />
          }
        >
          <XIcon />
          <span className="sr-only">
            <Trans>Close</Trans>
          </span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('border-b px-5 py-4 text-base font-semibold', className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      className={cn('font-medium', className)}
      {...props}
    />
  );
}

// The scrolling part between the header and the footer.
function DrawerBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-body"
      className={cn('min-h-0 flex-1 overflow-y-auto p-5', className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        'flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
};
