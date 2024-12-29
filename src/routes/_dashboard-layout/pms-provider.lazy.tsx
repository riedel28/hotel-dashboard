import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_dashboard-layout/pms-provider')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/pms-provider"!</div>
}
