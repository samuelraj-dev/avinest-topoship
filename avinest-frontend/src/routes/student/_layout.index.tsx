import { createFileRoute } from '@tanstack/react-router'
import { StudentDashboard } from '../../pages/student-dashboard'

export const Route = createFileRoute('/student/_layout/')({
  component: StudentDashboard,
})