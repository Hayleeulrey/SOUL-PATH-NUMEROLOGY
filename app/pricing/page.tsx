import Link from "next/link"
import PricingTable from "@/components/pricing-page/pricing-table"
import { AddOnsTable } from "@/components/pricing-page/add-ons-table"
import { FloatingCalculatorButton } from "@/components/pricing-page/floating-calculator-button"

export default function PricingPage() {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <main className="container mx-auto py-20 px-4">
          <div className="space-y-20">
            <PricingTable />
            <AddOnsTable />
          </div>
        </main>
  
        <FloatingCalculatorButton />
      </div>
    )
  }
  
