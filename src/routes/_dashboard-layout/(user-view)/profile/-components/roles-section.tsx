import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { type Control, Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { rolesQueryOptions } from '@/api/roles';
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
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';

interface RolesSectionProps {
  initialRoles?: number[];
}

const rolesFormSchema = z.object({
  roles: z.array(z.number()).min(1, t`Please select at least one role`)
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
              render={({ fieldState }) => (
                <FieldGroup data-slot="checkbox-group" className="gap-4">
                  <Field
                    data-invalid={fieldState.invalid}
                    orientation="vertical"
                    className="gap-3"
                  >
                    <Suspense fallback={<RolesSkeleton />}>
                      <RolesList control={form.control} name="roles" />
                    </Suspense>

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

function RolesList({
  control,
  name
}: {
  control: Control<RolesFormData>;
  name: 'roles';
}) {
  const { data: roles } = useSuspenseQuery(rolesQueryOptions());

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {roles.map((role) => {
            const assigned = field.value?.includes(role.id);
            return (
              <Field
                key={role.id}
                orientation="horizontal"
                className="gap-3 rounded-md border bg-muted/20 p-3"
              >
                <Checkbox
                  id={String(role.id)}
                  name={field.name}
                  checked={assigned}
                  onCheckedChange={(checked) => {
                    const nextRoles = checked
                      ? [...(field.value ?? []), role.id]
                      : (field.value ?? []).filter((r) => r !== role.id);
                    field.onChange(nextRoles);
                  }}
                />
                <FieldLabel
                  htmlFor={String(role.id)}
                  className="cursor-pointer text-sm font-normal"
                >
                  {role.name}
                </FieldLabel>
              </Field>
            );
          })}
        </div>
      )}
    />
  );
}

function RolesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-md border bg-muted/20 p-3"
        >
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
