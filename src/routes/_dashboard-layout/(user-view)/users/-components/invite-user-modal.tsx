import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, SendIcon } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { isDemoForbidden } from '@/api/client';
import { rolesQueryOptions } from '@/api/roles';
import { inviteUser } from '@/api/users';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  FieldOptional,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

function createInviteUserFormSchema(t: ReturnType<typeof useLingui>['t']) {
  return z.object({
    email: z.string().email(t`Invalid email address`),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    is_admin: z.boolean().optional(),
    role_ids: z.array(z.number().int().positive()).optional()
  });
}

type InviteUserFormData = z.infer<
  ReturnType<typeof createInviteUserFormSchema>
>;

export function InviteUserModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { data: roles } = useQuery(rolesQueryOptions());
  const { t } = useLingui();
  const inviteUserFormSchema = createInviteUserFormSchema(t);

  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserFormSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
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

  const inviteUserMutation = useMutation({
    mutationFn: (data: InviteUserFormData) => {
      const submitData = {
        ...data,
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        is_admin: data.is_admin || false,
        role_ids:
          data.role_ids && data.role_ids.length > 0 ? data.role_ids : undefined
      };
      return inviteUser(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleOpenChange(false);
      toast.success(t`Invitation sent successfully`);
    },
    onError: (error) => {
      toast.error(
        isDemoForbidden(error) ? error.message : t`Failed to send invitation`
      );
    }
  });

  const onSubmit = (data: InviteUserFormData) => {
    inviteUserMutation.mutate(data);
  };

  const isSending = inviteUserMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <SendIcon />
            <Trans>Invite user</Trans>
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] max-w-lg! overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans>Invite user</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              They get an email with a link to set a password and sign in.
            </Trans>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldSet className="gap-6" disabled={isSending}>
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
                      autoFocus
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

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="first_name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor={field.name}>
                        <Trans>First Name</Trans>
                        <FieldOptional />
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
                        <FieldOptional />
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
                name="role_ids"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel>
                      <Trans>Roles</Trans>
                      <FieldOptional />
                    </FieldLabel>
                    {roles && roles.length > 0 ? (
                      // One box with a checkbox per role, not a card each
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
                      <FieldLabel
                        htmlFor={field.name}
                        className="cursor-pointer"
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
            </FieldGroup>
          </FieldSet>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSending}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={isSending} aria-busy={isSending}>
              {isSending && <Loader2Icon className="animate-spin" />}
              <Trans>Send invitation</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
