import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/customers')({
  component: () => <div>Hello /customers!</div>
})