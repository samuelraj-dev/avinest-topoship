import { createFileRoute } from '@tanstack/react-router'
import { MarksPage } from '../../pages/marks'

export const Route = createFileRoute('/student/_layout/marks')({
  component: MarksPage,
})