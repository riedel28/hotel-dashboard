import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { isDemoForbidden } from '@/api/client';
import { rolesQueryOptions } from '@/api/roles';
import { updateUserById, type UpdateUserData, type User } from '@/api/users';
import { DetailsDrawerStepper } from '@/components/details-drawer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldOptional,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const updateUserFormSchema = z.object({
  email: z
    .string()
    .email(t`Invalid email address`)
    .optional(),
  first_name: z
    .string()
    .min(1, t`First name is required`)
    .optional(),
  last_name: z
    .string()
    .min(1, t`Last name is required`)
    .optional(),
  country_code: z.string().length(2).nullable().optional(),
  is_admin: z.boolean().optional(),
  role_ids: z.array(z.number().int().positive()).optional()
});

type UpdateUserFormData = z.infer<typeof updateUserFormSchema>;

interface UserFormDrawerProps {
  /** The open user; the drawer is closed while undefined. */
  user?: User;
  /** Users of the table page, stepped through from the footer. */
  pageUsers: User[];
  onSelect: (userId: number) => void;
  onClose: () => void;
}

/** Edits a user beside the table, as rooms are edited. */
export function UserFormDrawer({
  user,
  pageUsers,
  onSelect,
  onClose
}: UserFormDrawerProps) {
  const { t } = useLingui();

  return (
    <Drawer
      open={user !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      {/* As wide as the other details drawers */}
      <DrawerContent className="sm:max-w-lg">
        <DrawerHeader>
          <DrawerTitle>
            <Trans>Edit user</Trans>
          </DrawerTitle>
        </DrawerHeader>
        {user && (
          <UserForm
            // A fresh form per user: no edits carry over to the next one
            key={user.id}
            user={user}
            pageUsers={pageUsers}
            onSelect={onSelect}
            onCancel={onClose}
            previousLabel={t`Previous user`}
            nextLabel={t`Next user`}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function UserForm({
  user,
  pageUsers,
  onSelect,
  onCancel,
  previousLabel,
  nextLabel
}: {
  user: User;
  pageUsers: User[];
  onSelect: (userId: number) => void;
  onCancel: () => void;
  previousLabel: string;
  nextLabel: string;
}) {
  const queryClient = useQueryClient();
  const { data: roles } = useQuery(rolesQueryOptions());
  const userId = user.id;
  const userData = user;

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
    mutationFn: (data: UpdateUserData) => updateUserById(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t`User updated successfully`);
      // Saved: back to the list, as the room and product drawers do
      onCancel();
    },
    onError: (error) => {
      toast.error(
        isDemoForbidden(error) ? error.message : t`Failed to update user`
      );
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
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <DrawerBody>
        <FieldSet className="gap-6" disabled={updateUserMutation.isPending}>
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
                  <FieldLabel>
                    <Trans>Country</Trans>
                  </FieldLabel>
                  <CountryPicker
                    value={field.value || undefined}
                    onValueChange={field.onChange}
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
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel>
                    <Trans>Roles</Trans>
                    <FieldOptional />
                  </FieldLabel>
                  {roles && roles.length > 0 ? (
                    // As in the invite dialog: one box, a checkbox per role
                    <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 rounded-lg border p-3 sm:grid-cols-2 dark:bg-input/30">
                      {roles.map((role) => {
                        const assigned = field.value?.includes(role.id);
                        return (
                          <Field
                            key={role.id}
                            orientation="horizontal"
                            className="gap-2"
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
                              className="cursor-pointer font-normal"
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

            <Controller
              control={form.control}
              name="is_admin"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  orientation="horizontal"
                  className="items-center gap-3 rounded-lg border p-3 dark:bg-input/30"
                >
                  <FieldContent>
                    <FieldLabel htmlFor={field.name} className="cursor-pointer">
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
          </FieldGroup>
        </FieldSet>
      </DrawerBody>
      <DetailsDrawerStepper
        currentId={userId}
        items={pageUsers}
        onSelect={onSelect}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        // Stepping away would drop the edits without a word
        disabled={form.formState.isDirty}
        keyHints={false}
      >
        <Button variant="outline" type="button" onClick={onCancel}>
          <Trans>Cancel</Trans>
        </Button>
        <Button type="submit" disabled={updateUserMutation.isPending}>
          {updateUserMutation.isPending && (
            <Loader2Icon className="animate-spin" />
          )}
          <Trans>Save Changes</Trans>
        </Button>
      </DetailsDrawerStepper>
    </form>
  );
}
