import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard-layout/profile')({
  component: () => <div>Hello /profile!</div>,
})
