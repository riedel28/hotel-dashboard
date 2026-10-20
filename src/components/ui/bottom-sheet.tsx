import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';

import { cn } from '@/lib/utils';

// A menu's or picker's phone form: rises from the bottom edge, follows the
// finger and closes with a swipe down, a tap outside or Escape. Unlike
// `Drawer`, which holds forms, it is for short choices.

function BottomSheet(props: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root swipeDirection="down" {...props} />;
}

function BottomSheetContent({
  className,
  children,
  ...props
}: DrawerPrimitive.Popup.Props) {
  return (
    // Sets --drawer-keyboard-inset while the on-screen keyboard is up, so the
    // sheet can lift its content above it
    <DrawerPrimitive.VirtualKeyboardProvider>
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Backdrop className="fixed inset-0 z-50 bg-black opacity-[calc(0.4*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:opacity-0 data-swiping:duration-0 dark:opacity-[calc(0.6*(1-var(--drawer-swipe-progress)))]" />
        <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex items-end">
          <DrawerPrimitive.Popup
            data-slot="bottom-sheet"
            className={cn(
              'flex max-h-[85dvh] w-full flex-col rounded-t-xl bg-popover pb-[calc(env(safe-area-inset-bottom)+var(--drawer-keyboard-inset,0px))] text-popover-foreground ring-1 ring-foreground/10 outline-none',
              // Follows the finger while swiped, slides in and out otherwise
              '[transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-swiping:select-none',
              'data-ending-style:[transform:translateY(100%)] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:[transform:translateY(100%)]',
              className
            )}
            {...props}
          >
            {/* The grip that says it can be swiped away */}
            <div
              aria-hidden="true"
              className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30"
            />
            {/* Without it a mouse press starts a swipe and captures the
              pointer, so the click lands on the sheet instead of the control.
              Touch still swipes from anywhere. */}
            <DrawerPrimitive.Content className="flex min-h-0 flex-1 flex-col">
              {children}
            </DrawerPrimitive.Content>
          </DrawerPrimitive.Popup>
        </DrawerPrimitive.Viewport>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.VirtualKeyboardProvider>
  );
}

function BottomSheetTitle({
  className,
  ...props
}: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      className={cn('px-4 pt-1 pb-2 text-base font-semibold', className)}
      {...props}
    />
  );
}

/** A row in a sheet: 44px tall, the height of a touch target. */
const bottomSheetRowClassName =
  'flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-base outline-none hover:bg-accent focus-visible:bg-accent active:bg-accent [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground';

const BottomSheetClose = DrawerPrimitive.Close;
const BottomSheetTrigger = DrawerPrimitive.Trigger;

export {
  BottomSheet,
  BottomSheetClose,
  BottomSheetContent,
  bottomSheetRowClassName,
  BottomSheetTitle,
  BottomSheetTrigger
};
