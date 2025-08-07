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
import { Input } from '@/components/ui/input';

export const createPersonalFormSchema = (intl: IntlShape) =>
  z.object({
    firstName: z.string().min(
      1,
      intl.formatMessage({
        id: 'validation.firstName.required',
        defaultMessage: 'First name is required'
      })
    ),
    lastName: z.string().min(
      1,
      intl.formatMessage({
        id: 'validation.lastName.required',
        defaultMessage: 'Last name is required'
      })
    ),
    email: z.email(
      intl.formatMessage({
        id: 'validation.email.required',
        defaultMessage: 'Email is required'
      })
    )
  });

type PersonalFormValues = z.infer<ReturnType<typeof createPersonalFormSchema>>;

export function PersonalSection() {
  const intl = useIntl();

  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(createPersonalFormSchema(intl)),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: ''
    }
  });

  const onSubmit = async (data: PersonalFormValues) => {
    try {
      // TODO: Implement API call to update personal information
      console.log('Updating profile with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(
        intl.formatMessage({
          id: 'profile.saved',
          defaultMessage: 'Profile updated successfully'
        })
      );
    } catch {
      toast.error(
        intl.formatMessage({
          id: 'profile.error',
          defaultMessage: 'Error updating profile'
        })
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="profile.personal.title"
            defaultMessage="Personal Information"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="profile.personal.description"
            defaultMessage="Update your personal information and contact details"
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage
                        id="profile.personal.firstName"
                        defaultMessage="First Name"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={intl.formatMessage({
                          id: 'placeholders.enterFirstName',
                          defaultMessage: 'Enter first name'
                        })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <FormattedMessage
                        id="profile.personal.lastName"
                        defaultMessage="Last Name"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={intl.formatMessage({
                          id: 'placeholders.enterLastName',
                          defaultMessage: 'Enter last name'
                        })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage
                      id="profile.personal.email"
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
                    />
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
