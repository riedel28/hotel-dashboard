import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';

type AvailableRole = (typeof AVAILABLE_ROLES)[number];

interface RolesSectionProps {
  initialRoles: AvailableRole[];
}

const AVAILABLE_ROLES = [
  'administrators',
  'roomservice_manager',
  'housekeeping_manager',
  'roomservice_order_agent',
  'housekeeping_agent',
  'tester'
] as const;

export const createRolesFormSchema = (intl: IntlShape) =>
  z.object({
    roles: z.array(z.enum(AVAILABLE_ROLES)).min(
      1,
      intl.formatMessage({
        id: 'validation.roles.required',
        defaultMessage: 'Please select at least one role'
      })
    )
  });

type RolesFormData = z.infer<ReturnType<typeof createRolesFormSchema>>;

export function RolesSection({ initialRoles = [] }: RolesSectionProps) {
  const intl = useIntl();

  const form = useForm<RolesFormData>({
    resolver: zodResolver(createRolesFormSchema(intl)),
    defaultValues: {
      roles: initialRoles
    }
  });

  const onSubmit = async (data: RolesFormData) => {
    try {
      // TODO: Implement API call to update user roles
      console.log('Updating roles with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(
        intl.formatMessage({
          id: 'profile.roles.saved',
          defaultMessage: 'Roles updated successfully'
        })
      );
    } catch {
      toast.error(
        intl.formatMessage({
          id: 'profile.roles.error',
          defaultMessage: 'Error updating roles'
        })
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="profile.roles.title"
            defaultMessage="User Roles"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="profile.roles.description"
            defaultMessage="Manage your user roles and permissions"
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    <FormattedMessage
                      id="profile.roles.label"
                      defaultMessage="Roles"
                    />
                  </FormLabel>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {AVAILABLE_ROLES.map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            id={role}
                            checked={form.watch('roles').includes(role)}
                            onCheckedChange={(checked) => {
                              const currentRoles = form.watch('roles');
                              if (checked) {
                                form.setValue(
                                  'roles',
                                  [...currentRoles, role],
                                  { shouldValidate: true }
                                );
                              } else {
                                form.setValue(
                                  'roles',
                                  currentRoles.filter((r) => r !== role),
                                  { shouldValidate: true }
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <Label
                          htmlFor={role}
                          className="cursor-pointer text-sm font-normal"
                        >
                          <FormattedMessage
                            id={`profile.roles.${role}`}
                            defaultMessage="Role"
                          />
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <FormattedMessage
                  id="profile.roles.save"
                  defaultMessage="Save Roles"
                />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
