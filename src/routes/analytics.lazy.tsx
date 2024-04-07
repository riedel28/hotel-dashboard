import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/analytics')({
  component: () => <div>Hello /analytics!</div>
})