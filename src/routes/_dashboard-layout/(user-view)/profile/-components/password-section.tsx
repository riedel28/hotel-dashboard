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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';

export const createPasswordSchema = (intl: IntlShape) =>
  z
    .object({
      currentPassword: z.string().min(
        1,
        intl.formatMessage({
          id: 'validation.currentPassword.required',
          defaultMessage: 'Current password is required'
        })
      ),
      newPassword: z.string().min(
        8,
        intl.formatMessage({
          id: 'validation.newPassword.minLength',
          defaultMessage: 'Password must be at least 8 characters long'
        })
      ),
      confirmPassword: z.string().min(
        1,
        intl.formatMessage({
          id: 'validation.confirmPassword.required',
          defaultMessage: 'Please confirm your password'
        })
      )
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: intl.formatMessage({
        id: 'validation.passwords.dontMatch',
        defaultMessage: "Passwords don't match"
      }),
      path: ['confirmPassword']
    });

type PasswordFormData = z.infer<ReturnType<typeof createPasswordSchema>>;

export function PasswordSection() {
  const intl = useIntl();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(createPasswordSchema(intl)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      // TODO: Implement API call to change password
      console.log('Password change data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success('Password changed successfully');

      // Reset form
      form.reset();
    } catch {
      toast.error('Error changing password');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="profile.password.title"
            defaultMessage="Password"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="profile.password.description"
            defaultMessage="Change your password to keep your account secure"
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage
                      id="profile.password.currentPassword"
                      defaultMessage="Current Password"
                    />
                  </FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage
                      id="profile.password.newPassword"
                      defaultMessage="New Password"
                    />
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <PasswordInput {...field} />
                      <PasswordStrengthMeter password={field.value} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage
                      id="profile.password.confirmPassword"
                      defaultMessage="Confirm New Password"
                    />
                  </FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
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
                  id="profile.save"
                  defaultMessage="Save Changes"
                />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
