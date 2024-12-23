import { PlusCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type FormValues = {
  booking_nr: string
  room: string
  page_url: string
}



async function createReservation(data: FormValues) {
  const response = await fetch('http://localhost:5000/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: Math.floor(Math.random() * 1000),
      state: 'pending',
      guest_email: 'jd@example.com',
      primary_guest_name: 'John Doe',
      booking_id: Math.floor(Math.random() * 1000),
      completed_at: new Date().toISOString(),
      last_opened_at: new Date().toISOString(),
      received_at: new Date().toISOString(),
      booking_nr: data.booking_nr,
      room_name: data.room,
      page_url: data.page_url,
      balance: Math.floor(Math.random() * 1000),
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to create reservation')
  }
  return response.json()
}

export function AddReservationModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    defaultValues: {
      booking_nr: '',
      room: '',
      page_url: '',
    },
  })

  const createReservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      setIsOpen(false)
      form.reset()
      toast.success('Reservation created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create reservation: ' + error.message)
    },
  })

  const onSubmit = (data: FormValues) => {
    createReservationMutation.mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Reservation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Reservation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="booking_nr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reservation Nr.</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter reservation number" required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {[101, 102, 103, 104, 105].map((room) => (
                          <SelectItem key={room} value={room.toString()}>
                            Room {room}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="page_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter page URL" required />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
