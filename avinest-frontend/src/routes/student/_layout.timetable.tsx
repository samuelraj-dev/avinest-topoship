import { createFileRoute } from '@tanstack/react-router'
import { StudentTimetable } from '../../pages/student-timetable'

export const Route = createFileRoute('/student/_layout/timetable')({
  component: StudentTimetable,
})