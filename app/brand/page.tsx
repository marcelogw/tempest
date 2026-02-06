import { BrandShowcase } from '@/components/brand/brand-showcase'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tempest - Identidade Visual',
  description: 'Logo, cores, tipografia e diretrizes visuais da marca Tempest',
}

export default function BrandPage() {
  return <BrandShowcase />
}
