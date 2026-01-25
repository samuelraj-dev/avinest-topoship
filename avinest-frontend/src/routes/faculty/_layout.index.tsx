import { createFileRoute } from '@tanstack/react-router'
import { Button } from '../../components/ui/button'
import { ThemeToggle } from '../../components/theme-toggle'
import { Input } from '../../components/ui/input'
import { LogoutButton } from '../../components/ui/logout-button'

export const Route = createFileRoute('/faculty/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
    <Button variant='secondary'>hello</Button>
    <ThemeToggle />
    <Input />
    <LogoutButton />
    </>
  )
}
