import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, PlusCircleIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { createCustomer } from '@/api/customers';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import {
  CustomerFields,
  type CustomerFormValues,
  showEmailTakenError,
  useCustomerForm
} from './customer-fields';

export function AddCustomerModal() {
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
      if (
        showEmailTakenError(
          form,
          error,
          t`A customer with this email already exists`
        )
      ) {
        return;
      }
      toast.error(t`Failed to create customer`);
    }
  });

  const onSubmit = (data: CustomerFormValues) => {
    createCustomerMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <PlusCircleIcon className="mr-1 size-3.5" />
            <Trans>Add Customer</Trans>
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] max-w-xl! overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Customer</Trans>
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <CustomerFields control={form.control} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={createCustomerMutation.isPending}>
              {createCustomerMutation.isPending && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Trans>Create</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
