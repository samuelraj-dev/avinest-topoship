import { createFileRoute } from '@tanstack/react-router'
import { GradebookPage } from '../../pages/grades'

export const Route = createFileRoute('/student/_layout/grades')({
  component: GradebookPage,
})