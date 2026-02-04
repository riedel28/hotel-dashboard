import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { rolesQueryOptions } from '@/api/roles';
import { type UpdateUserData, updateUserById } from '@/api/users';

import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const updateUserFormSchema = z.object({
  email: z.string().email(t`Invalid email address`).optional(),
  first_name: z.string().min(1, t`First name is required`).optional(),
  last_name: z.string().min(1, t`Last name is required`).optional(),
  country_code: z.string().length(2).nullable().optional(),
  is_admin: z.boolean().optional(),
  role_ids: z.array(z.number().int().positive()).optional()
});

type UpdateUserFormData = z.infer<typeof updateUserFormSchema>;

interface EditUserFormProps {
  userId: number;
  userData: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    country_code: string | null;
    is_admin: boolean;
    roles: Array<{ id: number; name: string }>;
  };
}

async function updateUser(id: number, data: UpdateUserData) {
  return updateUserById(id, data);
}

export function EditUserForm({ userId, userData }: EditUserFormProps) {
  const queryClient = useQueryClient();
  const { data: roles } = useQuery(rolesQueryOptions());

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserFormSchema),
    values: {
      email: userData.email,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      country_code: userData.country_code || null,
      is_admin: userData.is_admin,
      role_ids: userData.roles.map((role) => role.id)
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserData) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      toast.success(t`User updated successfully`);
    },
    onError: () => {
      toast.error(t`Failed to update user`);
    }
  });

  const onSubmit = (data: UpdateUserFormData) => {
    // Clean up empty strings and convert to proper format
    const submitData: UpdateUserData = {
      email: data.email || undefined,
      first_name: data.first_name || undefined,
      last_name: data.last_name || undefined,
      country_code: data.country_code || undefined,
      is_admin: data.is_admin,
      role_ids:
        data.role_ids && data.role_ids.length > 0 ? data.role_ids : undefined
    };
    updateUserMutation.mutate(submitData);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <FieldSet className="gap-6">
        <FieldGroup className="gap-6">
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor={field.name}>
                  <Trans>Email</Trans>
                </FieldLabel>
                <Input
                  id={field.name}
                  type="email"
                  {...field}
                  value={field.value || ''}
                  aria-invalid={fieldState.invalid}
                  placeholder={t`user@example.com`}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="first_name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>
                    <Trans>First Name</Trans>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    {...field}
                    value={field.value || ''}
                    aria-invalid={fieldState.invalid}
                    placeholder={t`John`}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="last_name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor={field.name}>
                    <Trans>Last Name</Trans>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    {...field}
                    value={field.value || ''}
                    aria-invalid={fieldState.invalid}
                    placeholder={t`Doe`}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="country_code"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor={field.name}>
                  <Trans>Country</Trans>
                </FieldLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={(value) =>
                    field.onChange(value === '' ? null : value)
                  }
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue>
                      {(value) => {
                        const countryMap: Record<string, string> = {
                          DE: t`Germany`,
                          US: t`United States`,
                          AT: t`Austria`,
                          CH: t`Switzerland`
                        };
                        return value ? (
                          <span>{countryMap[value] || value}</span>
                        ) : (
                          <span className="text-muted-foreground">
                            {t`Select country`}
                          </span>
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      <Trans>None</Trans>
                    </SelectItem>
                    <SelectItem value="DE">
                      <Trans>Germany</Trans>
                    </SelectItem>
                    <SelectItem value="US">
                      <Trans>United States</Trans>
                    </SelectItem>
                    <SelectItem value="AT">
                      <Trans>Austria</Trans>
                    </SelectItem>
                    <SelectItem value="CH">
                      <Trans>Switzerland</Trans>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="is_admin"
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                orientation="horizontal"
                className="gap-3 items-center border rounded-md p-3"
              >
                <FieldContent>
                  <FieldLabel
                    htmlFor={field.name}
                    className="cursor-pointer text-sm font-normal"
                  >
                    <Trans>Admin User</Trans>
                  </FieldLabel>
                  <FieldDescription>
                    <Trans>Grant administrator privileges to this user</Trans>
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id={field.name}
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="role_ids"
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                orientation="vertical"
                className="gap-3"
              >
                <FieldContent>
                  <FieldLabel className="text-base font-medium">
                    <Trans>Roles</Trans>
                  </FieldLabel>
                  <FieldDescription>
                    <Trans>Select one or more roles to assign</Trans>
                  </FieldDescription>
                </FieldContent>
                {roles && roles.length > 0 ? (
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
                            id={`role-${role.id}`}
                            checked={assigned}
                            onCheckedChange={(checked) => {
                              const nextRoles = checked
                                ? [...(field.value ?? []), role.id]
                                : (field.value ?? []).filter(
                                    (r) => r !== role.id
                                  );
                              field.onChange(nextRoles);
                            }}
                          />
                          <FieldLabel
                            htmlFor={`role-${role.id}`}
                            className="cursor-pointer text-sm font-normal"
                          >
                            {role.name}
                          </FieldLabel>
                        </Field>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <Trans>No roles available</Trans>
                  </p>
                )}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={updateUserMutation.isPending}>
          {updateUserMutation.isPending && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Trans>Save Changes</Trans>
        </Button>
      </div>
    </form>
  );
}
