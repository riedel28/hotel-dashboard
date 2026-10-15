import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Loader2Icon, PlusCircleIcon } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  type CreatePropertyData,
  createPropertySchema,
  type PropertyCustomer,
  type PropertyStage
} from 'shared/types/properties';
import { toast } from 'sonner';
import { z } from 'zod';

import { createProperty } from '@/api/properties';
import { Button } from '@/components/ui/button';
import { CountryPicker } from '@/components/ui/country-picker';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { propertyStages, stageLabels } from '@/components/ui/stage-badge';

import { CustomerPicker } from './customer-picker';

export function AddPropertyModal() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  // Held beside the form: the picker works with the whole Customer, the
  // request only sends its id.
  const [customer, setCustomer] = React.useState<PropertyCustomer | null>(null);

  // The shared schema with a message a person can read
  const schema = React.useMemo(
    () =>
      createPropertySchema.extend({
        name: z
          .string()
          .trim()
          .min(1, t`Name is required`)
      }),
    [t]
  );

  const form = useForm<CreatePropertyData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      country_code: 'DE',
      stage: 'demo'
    }
  });

  const createPropertyMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: (property) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(t`Property created successfully`);
      // Its solutions and nav items are set up there, so that is next
      void navigate({
        to: '/admin/properties/$propertyId',
        params: { propertyId: property.id }
      });
    },
    onError: () => {
      toast.error(t`Failed to create property`);
    }
  });
  const isSaving = createPropertyMutation.isPending;

  const handleOpenChange = (open: boolean) => {
    // Not closed under a request still on its way
    if (isSaving) return;
    setIsOpen(open);
    if (!open) {
      form.reset();
      setCustomer(null);
    }
  };

  const onSubmit = (data: CreatePropertyData) => {
    createPropertyMutation.mutate({
      ...data,
      customer_id: customer?.id ?? null
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <PlusCircleIcon className="mr-1 size-3.5" />
            <Trans>Add property</Trans>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>New property</Trans>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* The same fields in the same order as the property's Details */}
          <FieldSet className="gap-6" disabled={isSaving}>
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Name</Trans>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder={t`Enter property name`}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field className="gap-2">
                <FieldLabel id="new-property-customer-label">
                  <Trans>Customer</Trans>
                  <span className="font-normal text-muted-foreground">
                    <Trans>(optional)</Trans>
                  </span>
                </FieldLabel>
                <CustomerPicker
                  value={customer}
                  onValueChange={setCustomer}
                  aria-labelledby="new-property-customer-label"
                />
              </Field>

              <Controller
                control={form.control}
                name="country_code"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Country</Trans>
                    </FieldLabel>
                    <CountryPicker
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="stage"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Stage</Trans>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue>
                          {(value: PropertyStage) => t(stageLabels[value])}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {propertyStages.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {t(stageLabels[stage])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
              {isSaving && <Loader2Icon className="animate-spin" />}
              <Trans>Create property</Trans>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
