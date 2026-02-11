import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, PlusCircleIcon } from 'lucide-react';
import React from 'react';
import Flag from 'react-flagkit';
import { Controller, useForm } from 'react-hook-form';
import {
  type CreatePropertyData,
  createPropertySchema
} from 'shared/types/properties';
import { toast } from 'sonner';
import { createProperty } from '@/api/properties';

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

const countryCodes = ['AT', 'CH', 'CZ', 'DE', 'ES', 'US'] as const;

function getCountryName(code: string) {
  const map: Record<string, () => string> = {
    AT: () => t`Austria`,
    CH: () => t`Switzerland`,
    CZ: () => t`Czech Republic`,
    DE: () => t`Germany`,
    ES: () => t`Spain`,
    US: () => t`United States`
  };
  return map[code]?.() ?? code;
}

const stageValues = ['demo', 'production', 'staging', 'template'] as const;

function getStageLabel(stage: string) {
  const map: Record<string, () => string> = {
    demo: () => t`Demo`,
    production: () => t`Production`,
    staging: () => t`Staging`,
    template: () => t`Template`
  };
  return map[stage]?.() ?? stage;
}

export function AddPropertyModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreatePropertyData>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      name: '',
      country_code: 'DE',
      stage: 'demo'
    }
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const createPropertyMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      handleOpenChange(false);
      toast.success(t`Property created successfully`);
    },
    onError: () => {
      toast.error(t`Failed to create property`);
    }
  });

  const onSubmit = (data: CreatePropertyData) => {
    createPropertyMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            <Trans>Add Property</Trans>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Property</Trans>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldSet className="gap-6">
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

              <Controller
                control={form.control}
                name="country_code"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={field.name}>
                      <Trans>Country</Trans>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue>
                          {(value) => {
                            if (!value) return <span>{value}</span>;
                            return (
                              <span className="flex items-center gap-2">
                                <Flag
                                  country={value}
                                  className="size-3.5 rounded-sm"
                                  aria-label={value}
                                />
                                <span>{getCountryName(value)}</span>
                              </span>
                            );
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((code) => (
                          <SelectItem key={code} value={code}>
                            <span className="flex items-center gap-2">
                              <Flag
                                country={code}
                                className="size-3.5 rounded-sm"
                                aria-label={code}
                              />
                              <span>{getCountryName(code)}</span>
                            </span>
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
                          {(value) => <span>{getStageLabel(value)}</span>}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {stageValues.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {getStageLabel(stage)}
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
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={createPropertyMutation.isPending}>
              {createPropertyMutation.isPending && (
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
