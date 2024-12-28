import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_dashboard-layout/customers')({
  component: () => <div>Hello /customers!</div>,
})
