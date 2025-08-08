import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
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

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, t`Current password is required`),
    newPassword: z
      .string()
      .min(8, t`Password must be at least 8 characters long`),
    confirmPassword: z.string().min(1, t`Please confirm your password`)
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t`Passwords don't match`,
    path: ['confirmPassword']
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordSection() {
  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
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

      toast.success(t`Password changed successfully`);

      // Reset form
      form.reset();
    } catch {
      toast.error(t`Error changing password`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans>Password</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Change your password to keep your account secure</Trans>
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
                    <Trans>Current Password</Trans>
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
                    <Trans>New Password</Trans>
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
                    <Trans>Confirm New Password</Trans>
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
                <Trans>Save Changes</Trans>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
