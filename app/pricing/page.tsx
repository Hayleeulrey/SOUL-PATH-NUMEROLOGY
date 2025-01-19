import PricingTable from '@/components/pricing-page/pricing-table'
import { AddOnsTable } from '@/components/pricing-page/add-ons-table'
import PricingCalculator from '@/components/pricing-page/pricing-calculator'
import { FloatingCalculatorButton } from '@/components/pricing-page/floating-calculator-button'

export default function PricingPage() {
  return (
    <div>
      <PricingTable />
      <AddOnsTable />
      <PricingCalculator />
      <FloatingCalculatorButton />
    </div>
  )
}

