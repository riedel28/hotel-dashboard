import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Loader2Icon, PlusIcon } from 'lucide-react';
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
  const navigate = useNavigate();
  const form = useCustomerForm();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      handleOpenChange(false);
      toast.success(t`Customer created successfully`);
      // Opened like a new property is, to check it or add to it
      void navigate({
        to: '/admin/customers/$customerId',
        params: { customerId: customer.id }
      });
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
      {/* Just the icon on a phone; its name stays for screen readers */}
      <Button
        className="max-sm:size-9 max-sm:p-0"
        onClick={() => handleOpenChange(true)}
      >
        <PlusIcon />
        <span className="max-sm:sr-only">
          <Trans>Add customer</Trans>
        </span>
      </Button>
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              <Trans>New customer</Trans>
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
                <Trans>Create customer</Trans>
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}
