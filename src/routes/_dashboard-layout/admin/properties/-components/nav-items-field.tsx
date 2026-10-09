import { useLingui } from '@lingui/react/macro';
import type { NavItemId } from 'shared/types/properties';

import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  navItemGroups,
  navItems
} from '@/routes/_dashboard-layout/-components/nav-items';

interface NavItemsFieldProps {
  /** Ids of the nav items switched off for the Property. */
  disabled: NavItemId[];
  onChange: (disabled: NavItemId[]) => void;
}

export function NavItemsField({ disabled, onChange }: NavItemsFieldProps) {
  const { t } = useLingui();

  const setShown = (ids: NavItemId[], shown: boolean) => {
    const others = disabled.filter((id) => !ids.includes(id));
    onChange(shown ? others : [...others, ...ids]);
  };

  return (
    <div className="flex flex-col gap-5">
      {navItemGroups.map((group) => {
        const shownCount = group.ids.filter(
          (id) => !disabled.includes(id)
        ).length;

        const items = (
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {group.ids.map((id) => (
              <Field key={id} orientation="horizontal" className="gap-2">
                <Checkbox
                  id={`nav-item-${id}`}
                  checked={!disabled.includes(id)}
                  onCheckedChange={(shown) => setShown([id], shown)}
                />
                <FieldLabel
                  htmlFor={`nav-item-${id}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {t(navItems[id].label)}
                </FieldLabel>
              </Field>
            ))}
          </div>
        );

        // A group without a heading has nothing to hang a "whole group"
        // checkbox on: its items stand on their own.
        if (!group.label) return <div key={group.key}>{items}</div>;

        const groupId = `nav-group-${group.key}`;

        return (
          <div
            key={group.key}
            role="group"
            aria-labelledby={`${groupId}-label`}
            className="flex flex-col gap-3"
          >
            <Field orientation="horizontal" className="gap-2">
              <Checkbox
                id={groupId}
                checked={shownCount === group.ids.length}
                indeterminate={shownCount > 0 && shownCount < group.ids.length}
                onCheckedChange={(shown) => setShown(group.ids, shown)}
              />
              <FieldLabel
                id={`${groupId}-label`}
                htmlFor={groupId}
                className="cursor-pointer text-sm font-medium"
              >
                {t(group.label)}
              </FieldLabel>
            </Field>
            <div className="pl-6">{items}</div>
          </div>
        );
      })}
    </div>
  );
}
