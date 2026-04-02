import { createFileRoute } from '@tanstack/react-router'
import { EnrolledCourses } from '../../pages/enrolled-courses'

export const Route = createFileRoute('/student/_layout/enrolled-courses')({
  component: EnrolledCourses,
})