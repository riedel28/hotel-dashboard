import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { CheckIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95',
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'px-1.5 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-sm px-1.5 py-1 text-sm select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary data-inset:pl-8 data-[variant=destructive]:hover:bg-destructive/80 data-[variant=destructive]:hover:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/80 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:focus-visible:outline-destructive/40 data-[variant=destructive]:dark:hover:bg-destructive/30 data-[variant=destructive]:dark:focus:bg-destructive/30 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[variant=destructive]:hover:[&_svg]:text-destructive-foreground data-[variant=destructive]:focus:[&_svg]:text-destructive-foreground [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  hasChevron = true,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
  hasChevron?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-sm px-1.5 py-1.5 text-sm select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary data-inset:pl-8 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      {hasChevron && <ChevronRightIcon className="ml-auto" />}
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  align = 'start',
  alignOffset = -3,
  side = 'right',
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        'w-auto min-w-[96px] rounded-md bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
        className
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: MenuPrimitive.CheckboxItem.Props) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-8 text-sm select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary data-disabled:pointer-events-none data-disabled:opacity-50 data-checked:[&_[data-slot=dropdown-menu-checkbox-item-indicator]]:border-primary data-checked:[&_[data-slot=dropdown-menu-checkbox-item-indicator]]:bg-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute left-2 flex size-4 items-center justify-center rounded-[4px] border border-input bg-background dark:bg-input/30"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon
            className="size-3.5"
            strokeWidth={2.5}
            style={{
              color: 'var(--primary-foreground)',
              stroke: 'var(--primary-foreground)'
            }}
          />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  indicator = 'radio',
  ...props
}: MenuPrimitive.RadioItem.Props & {
  /**
   * How the selected option is marked. `radio` draws the usual dial on the
   * left; `check` drops it for a trailing tick, for menus whose options
   * already carry their own icon and would read as a form otherwise.
   */
  indicator?: 'radio' | 'check';
}) {
  const isCheck = indicator === 'check';

  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1 text-sm select-none focus:bg-accent focus:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        isCheck
          ? 'px-1.5'
          : 'pr-2 pl-9 data-checked:[&_[data-slot=dropdown-menu-radio-item-indicator]]:border-primary data-checked:[&_[data-slot=dropdown-menu-radio-item-indicator]]:bg-primary',
        className
      )}
      {...props}
    >
      {isCheck ? (
        <>
          {children}
          {/* Renders only while this option is the selected one. */}
          <MenuPrimitive.RadioItemIndicator
            className="ml-auto flex items-center"
            data-slot="dropdown-menu-radio-item-indicator"
          >
            <CheckIcon className="size-3.5" aria-hidden="true" />
          </MenuPrimitive.RadioItemIndicator>
        </>
      ) : (
        <>
          <span
            className="pointer-events-none absolute left-2 flex size-4 items-center justify-center rounded-full border border-input bg-background dark:bg-input/30"
            data-slot="dropdown-menu-radio-item-indicator"
          >
            <MenuPrimitive.RadioItemIndicator className="size-1.5 rounded-full bg-white" />
          </span>
          {children}
        </>
      )}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground group-data-[variant=destructive]/dropdown-menu-item:group-hover/dropdown-menu-item:text-destructive-foreground group-data-[variant=destructive]/dropdown-menu-item:group-focus/dropdown-menu-item:text-destructive-foreground',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuRadioItemIndicator({
  ...props
}: MenuPrimitive.RadioItemIndicator.Props) {
  return (
    <MenuPrimitive.RadioItemIndicator
      data-slot="dropdown-menu-radio-item-indicator"
      {...props}
    />
  );
}

function DropdownMenuItemIndicator({
  ...props
}: MenuPrimitive.RadioItemIndicator.Props) {
  return (
    <MenuPrimitive.RadioItemIndicator
      data-slot="dropdown-menu-item-indicator"
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRadioItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
};
