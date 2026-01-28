import { createFileRoute } from '@tanstack/react-router'
import { MyFacultiesPage } from '../../pages/my-faculties'

export const Route = createFileRoute('/student/_layout/my-faculties')({
  component: MyFacultiesPage,
})