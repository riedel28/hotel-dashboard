import React from 'react';

import { createReservation } from '@/api/reservations';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InfoIcon, LinkIcon, Loader2, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input, InputWrapper } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

const addReservationSchema = z.object({
  booking_nr: z.string().min(1, t`Reservation number is required`),
  room: z.string().min(1, t`Room selection is required`),
  page_url: z.url(t`Please enter a valid URL`)
});

type AddReservationFormData = z.infer<typeof addReservationSchema>;

async function createReservationAction(data: AddReservationFormData) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return createReservation(data);
}

export function AddReservationModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AddReservationFormData>({
    resolver: zodResolver(addReservationSchema),
    defaultValues: {
      booking_nr: '',
      room: '',
      page_url: ''
    }
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const createReservationMutation = useMutation({
    mutationFn: createReservationAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      handleOpenChange(false);
      toast.success(t`Reservation created successfully`);
    },
    onError: () => {
      toast.error(t`Failed to create reservation`);
    }
  });

  const onSubmit = (data: AddReservationFormData) => {
    createReservationMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          <Trans>Add Reservation</Trans>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Reservation</Trans>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="booking_nr"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
                    <FormLabel>
                      <Trans>Reservation Nr.</Trans>
                    </FormLabel>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="size-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <Trans>
                          The booking number can be found in your Property
                          Management System (PMS)
                        </Trans>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t`Enter reservation number`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Room</Trans>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t`Select a room`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {[101, 102, 103, 104, 105].map((room) => (
                          <SelectItem key={room} value={room.toString()}>
                            <Trans>Room {room}</Trans>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="page_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Page URL</Trans>
                  </FormLabel>
                  <FormControl>
                    <InputWrapper>
                      <LinkIcon />
                      <Input {...field} placeholder={t`Enter page URL`} />
                    </InputWrapper>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button
                type="submit"
                disabled={createReservationMutation.isPending}
              >
                {createReservationMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Trans>Create</Trans>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
