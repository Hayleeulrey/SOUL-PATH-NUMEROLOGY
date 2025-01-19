import PricingTable from '@/components/pricing-page/pricing-table'
import { AddOnsTable } from '@/components/pricing-page/add-ons-table'
import { FloatingCalculatorButton } from '@/components/pricing-page/floating-calculator-button'
import PricingCalculator from '@/components/pricing-page/pricing-calculator'

export default function PricingPage() {
  return (
    <div>
      <PricingTable />
      <AddOnsTable />
      <FloatingCalculatorButton />
    </div>
  )
}

