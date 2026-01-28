import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/faculty/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <h1>faculty</h1>
  )
}