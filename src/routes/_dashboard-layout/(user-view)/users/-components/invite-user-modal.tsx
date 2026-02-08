import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, SendIcon } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { rolesQueryOptions } from '@/api/roles';
import { inviteUser } from '@/api/users';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
    onError: () => {
      toast.error(t`Failed to send invitation`);
    }
  });

  const onSubmit = (data: InviteUserFormData) => {
    inviteUserMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <SendIcon className="mr-2 h-4 w-4" />
            <Trans>Invite User</Trans>
          </Button>
        }
      />
      <DialogContent className="max-w-xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans>Invite User</Trans>
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
            <Button type="submit" disabled={inviteUserMutation.isPending}>
              {inviteUserMutation.isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              <SendIcon className="mr-2 h-4 w-4" />
              <Trans>Send Invitation</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
