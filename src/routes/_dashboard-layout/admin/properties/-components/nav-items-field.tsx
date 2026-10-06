import { Trans, useLingui } from '@lingui/react/macro';
import type { NavItemId } from 'shared/types/properties';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@/components/ui/field';
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

  const setShown = (id: NavItemId, shown: boolean) =>
    onChange(
      shown ? disabled.filter((other) => other !== id) : [...disabled, id]
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>Nav items</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>
            Unchecked nav items are hidden from the navigation and the Start
            page for this property.
          </Trans>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {navItemGroups.map((group) => (
          <FieldSet key={group.key} className="gap-3">
            {group.label && (
              <FieldLegend variant="label">{t(group.label)}</FieldLegend>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.ids.map((id) => (
                <Field
                  key={id}
                  orientation="horizontal"
                  className="gap-3 rounded-md border bg-muted/20 p-3"
                >
                  <Checkbox
                    id={`nav-item-${id}`}
                    checked={!disabled.includes(id)}
                    onCheckedChange={(shown) => setShown(id, shown)}
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
          </FieldSet>
        ))}
      </CardContent>
    </Card>
  );
}
