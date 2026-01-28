import { createFileRoute } from '@tanstack/react-router'
import { ClassesPage } from '../../pages/classes'

export const Route = createFileRoute('/faculty/_layout/classes')({
  component: ClassesPage,
})