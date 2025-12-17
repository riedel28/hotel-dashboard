import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, PlusCircleIcon } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { createUser } from '@/api/users';
import { rolesQueryOptions } from '@/api/roles';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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

const addUserSchema = z.object({
  email: z.string().email(t`Invalid email address`),
  password: z.string().min(8, t`Password must be at least 8 characters`),
  first_name: z.string().min(1, t`First name is required`).optional(),
  last_name: z.string().min(1, t`Last name is required`).optional(),
  country_code: z.string().length(2).nullable().optional(),
  is_admin: z.boolean().optional(),
  role_ids: z.array(z.number().int().positive()).optional()
});

type AddUserFormData = z.infer<typeof addUserSchema>;

async function createUserAction(data: AddUserFormData) {
  return createUser(data);
}

export function AddUserModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { data: roles } = useQuery(rolesQueryOptions());

  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      country_code: null,
      is_admin: false,
      role_ids: []
    }
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const createUserMutation = useMutation({
    mutationFn: createUserAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleOpenChange(false);
      toast.success(t`User created successfully`);
    },
    onError: () => {
      toast.error(t`Failed to create user`);
    }
  });

  const onSubmit = (data: AddUserFormData) => {
    // Clean up empty strings and convert to proper format
    const submitData = {
      ...data,
      first_name: data.first_name || undefined,
      last_name: data.last_name || undefined,
      country_code: data.country_code || undefined,
      is_admin: data.is_admin || false,
      role_ids:
        data.role_ids && data.role_ids.length > 0 ? data.role_ids : undefined
    };
    createUserMutation.mutate(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            <Trans>Add User</Trans>
          </Button>
        }
      />
      <DialogContent className="max-w-xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New User</Trans>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldSet className="gap-6">
            <FieldGroup className="gap-4">
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
                      aria-invalid={fieldState.invalid}
                      placeholder={t`user@example.com`}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Password</Trans>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder={t`Minimum 8 characters`}
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
                        <Trans>
                          Grant administrator privileges to this user
                        </Trans>
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Trans>Create</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
