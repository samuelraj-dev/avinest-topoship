import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/student/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <h1>hi
      
    </h1>
  )
}