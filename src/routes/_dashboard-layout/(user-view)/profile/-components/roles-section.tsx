import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';

interface RolesSectionProps {
  initialRoles: AvailableRole[];
}

const ROLE_NAMES = {
  administrators: t`Administrators`,
  roomservice_manager: t`Roomservice Manager`,
  housekeeping_manager: t`Housekeeping Manager`,
  roomservice_order_agent: t`Roomservice Order Agent`,
  housekeeping_agent: t`Housekeeping Agent`,
  tester: t`Tester`
};

type AvailableRole = keyof typeof ROLE_NAMES;

const rolesFormSchema = z.object({
  roles: z
    .array(z.enum(Object.keys(ROLE_NAMES)))
    .min(1, t`Please select at least one role`)
});

type RolesFormData = z.infer<typeof rolesFormSchema>;

export function RolesSection({ initialRoles = [] }: RolesSectionProps) {
  const form = useForm<RolesFormData>({
    resolver: zodResolver(rolesFormSchema),
    defaultValues: {
      roles: initialRoles
    }
  });

  const onSubmit = async (data: RolesFormData) => {
    try {
      // TODO: Implement API call to update user roles
      console.log('Updating roles with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(t`Roles updated successfully`);
    } catch {
      toast.error(t`Error updating roles`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>User Roles</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Manage your user roles and permissions</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldSet className="gap-4">
            <Controller
              control={form.control}
              name="roles"
              render={({ field, fieldState }) => (
                <FieldGroup data-slot="checkbox-group" className="gap-4">
                  <Field
                    data-invalid={fieldState.invalid}
                    orientation="vertical"
                    className="gap-3"
                  >
                    <FieldContent className="gap-4">
                      <FieldLabel className="text-base font-medium">
                        <Trans>Roles</Trans>
                      </FieldLabel>
                      <FieldDescription>
                        <Trans>Select one or more roles to assign.</Trans>
                      </FieldDescription>
                    </FieldContent>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {Object.keys(ROLE_NAMES).map((role) => {
                        const assigned = field.value?.includes(
                          role as AvailableRole
                        );
                        return (
                          <Field
                            key={role}
                            orientation="horizontal"
                            className="gap-3 rounded-md border bg-muted/20 p-3"
                          >
                            <Checkbox
                              id={role}
                              name={field.name}
                              checked={assigned}
                              onCheckedChange={(checked) => {
                                const nextRoles = checked
                                  ? [...(field.value ?? []), role]
                                  : (field.value ?? []).filter(
                                      (r) => r !== role
                                    );
                                field.onChange(nextRoles);
                              }}
                              aria-invalid={fieldState.invalid}
                            />
                            <FieldLabel
                              htmlFor={role}
                              className="cursor-pointer text-sm font-normal"
                            >
                              {ROLE_NAMES[role as AvailableRole]}
                            </FieldLabel>
                          </Field>
                        );
                      })}
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                </FieldGroup>
              )}
            />
          </FieldSet>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Trans>Save Roles</Trans>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
