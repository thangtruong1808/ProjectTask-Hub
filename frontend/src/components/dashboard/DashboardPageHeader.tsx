import type { ComponentProps } from 'react'
import PageHeader from '../ui/PageHeader'

type DashboardPageHeaderProps = Omit<ComponentProps<typeof PageHeader>, 'variant'>

export default function DashboardPageHeader(props: DashboardPageHeaderProps) {
  return <PageHeader {...props} variant="card" />
}
