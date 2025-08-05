import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
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
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordSection() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);

    try {
      // TODO: Implement API call to change password
      console.log('Password change data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success('Password changed successfully');

      // Reset form
      form.reset();
    } catch {
      toast.error('Error changing password');
    } finally {
      setIsLoading(false);
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
                    <PasswordInput disabled={isLoading} {...field} />
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
                      <PasswordInput disabled={isLoading} {...field} />
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
                    <PasswordInput disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" loading={isLoading}>
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
