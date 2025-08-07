import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, createFileRoute } from '@tanstack/react-router';
import { CheckIcon, Loader2, MessageCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_auth-layout/auth/forgot-password')({
  component: ForgotPasswordPage
});

type ForgotPasswordFormValues = {
  email: string;
};

function ForgotPasswordPage() {
  const intl = useIntl();
  const [isSuccess, setIsSuccess] = useState(false);

  // Create schema with internationalized messages
  const forgotPasswordFormSchema = z.object({
    email: z
      .string()
      .min(
        1,
        intl.formatMessage({
          id: 'validation.email.required',
          defaultMessage: 'Email is required'
        })
      )
      .email(
        intl.formatMessage({
          id: 'validation.email.invalid',
          defaultMessage: 'Please enter a valid email address'
        })
      )
  });

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      // TODO: Implement API call to send password reset email
      console.log('Sending password reset email to:', data.email);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setIsSuccess(true);
      toast.success(
        intl.formatMessage({
          id: 'auth.forgotPassword.success',
          defaultMessage: 'Password reset email sent successfully!'
        })
      );
    } catch (error) {
      console.error('Error sending password reset email: ', error);
      toast.error(
        intl.formatMessage({
          id: 'auth.forgotPassword.error',
          defaultMessage:
            'Failed to send password reset email. Please try again.'
        })
      );
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <div className="inline-block rounded-full bg-green-100 p-2">
            <CheckIcon className="size-10 rounded-full text-green-700" />
          </div>

          <h1 className="text-2xl font-bold">
            <FormattedMessage
              id="auth.forgotPassword.successTitle"
              defaultMessage="Reset Link Sent"
            />
          </h1>
          <p className="text-muted-foreground">
            <FormattedMessage
              id="auth.forgotPassword.successMessage"
              defaultMessage="We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password."
            />
          </p>
        </div>

        <div className="text-center">
          <Link
            className={cn(
              buttonVariants({
                mode: 'link',
                underline: 'solid'
              }),
              'text-foreground text-sm'
            )}
            to="/auth/login"
          >
            <FormattedMessage
              id="auth.backToLogin"
              defaultMessage="Back to login"
            />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <div className="bg-primary inline-block rounded-lg p-2 text-white">
          <MessageCircleIcon className="size-10" />
        </div>

        <h1 className="text-2xl font-bold">
          <FormattedMessage
            id="auth.forgotPassword.title"
            defaultMessage="Forgot Password"
          />
        </h1>
        <p className="text-muted-foreground">
          <FormattedMessage
            id="auth.forgotPassword.description"
            defaultMessage="Enter your email address and we'll send you a link to reset your password"
          />
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage
                    id="auth.forgotPassword.email"
                    defaultMessage="Email"
                  />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={intl.formatMessage({
                      id: 'placeholders.email',
                      defaultMessage: 'Enter your email'
                    })}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <FormattedMessage
              id="auth.forgotPassword.submit"
              defaultMessage="Send Reset Link"
            />
          </Button>
        </form>
      </Form>

      <div className="-mt-4 text-center">
        <Link
          className={cn(
            buttonVariants({
              mode: 'link',
              underline: 'solid'
            }),
            'text-foreground text-sm'
          )}
          to="/auth/login"
        >
          <FormattedMessage
            id="auth.backToLogin"
            defaultMessage="Back to login"
          />
        </Link>
      </div>
    </div>
  );
}
