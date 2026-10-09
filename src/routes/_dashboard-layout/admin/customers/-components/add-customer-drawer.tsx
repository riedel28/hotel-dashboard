import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, PlusCircleIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { createCustomer } from '@/api/customers';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';

import {
  CustomerFields,
  type CustomerFormValues,
  showEmailTakenError,
  useCustomerForm
} from './customer-fields';

export function AddCustomerDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { t } = useLingui();
  const form = useCustomerForm();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      handleOpenChange(false);
      toast.success(t`Customer created successfully`);
    },
    onError: (error) => {
      if (showEmailTakenError(form, error)) return;
      toast.error(t`Failed to create customer`);
    }
  });

  const onSubmit = (data: CustomerFormValues) => {
    createCustomerMutation.mutate(data);
  };

  return (
    <>
      <Button onClick={() => handleOpenChange(true)}>
        <PlusCircleIcon className="mr-1 size-3.5" />
        <Trans>Add Customer</Trans>
      </Button>
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              <Trans>Add new customer</Trans>
            </DrawerTitle>
          </DrawerHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
            noValidate
          >
            <DrawerBody>
              <CustomerFields control={form.control} />
            </DrawerBody>
            <DrawerFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button type="submit" disabled={createCustomerMutation.isPending}>
                {createCustomerMutation.isPending && (
                  <Loader2Icon className="animate-spin" />
                )}
                <Trans>Create</Trans>
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}
