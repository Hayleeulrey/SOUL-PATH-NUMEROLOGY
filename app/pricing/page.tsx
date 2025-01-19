'use client'

import PricingTable from '@/components/pricing-page/pricing-table'
import { AddOnsTable } from '@/components/pricing-page/add-ons-table'
import { FloatingCalculatorButton } from '@/components/pricing-page/floating-calculator-button'

export default function PricingPage() {
  return (
    <div className="space-y-20">
      <PricingTable />
      <AddOnsTable />
      <FloatingCalculatorButton />
    </div>
  )
}

