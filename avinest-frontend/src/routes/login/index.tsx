import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '../../pages/login'
import { requireGuest } from '../../auth/guards'

export const Route = createFileRoute('/login/')({
  beforeLoad: requireGuest,
  component: LoginPage,
})