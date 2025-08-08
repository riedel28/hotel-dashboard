import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trans } from '@lingui/react/macro';
import { Link, createFileRoute } from '@tanstack/react-router';
import { CheckIcon, Loader2, MessageCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
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

export const createForgotPasswordFormSchema = () =>
  z.object({
    email: z.email('Email is required')
  });

type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof createForgotPasswordFormSchema>
>;

function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(createForgotPasswordFormSchema()),
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
      // Store the email for the success message
      form.setValue('email', data.email);
      toast.success('Password reset email sent successfully!');
    } catch (error) {
      console.error('Error sending password reset email: ', error);
      toast.error('Failed to send password reset email. Please try again.');
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-4 text-center">
          <div className="inline-block rounded-full bg-green-100 p-3">
            <CheckIcon className="size-8 rounded-full text-green-700" />
          </div>

          <h1 className="text-2xl font-bold">
            <Trans>Reset Link Sent</Trans>
          </h1>
          <p className="text-foreground text-pretty">
            {`We've sent a password reset link to `}
            <span className="text-foreground font-medium">
              {form.getValues('email')}
            </span>
            {`. Please check your inbox and follow the instructions to reset your password.`}
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
            Back to login
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
          <Trans>Forgot Password</Trans>
        </h1>
        <p className="text-muted-foreground">
          {`Enter your email address and we'll send you a link to reset your password`}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    variant="lg"
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
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
          Back to login
        </Link>
      </div>
    </div>
  );
}
