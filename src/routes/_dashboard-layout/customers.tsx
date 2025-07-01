import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard-layout/customers')({
  component: () => <div>Hello /customers!</div>,
})
