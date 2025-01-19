import Link from "next/link"
import PricingTable from "@/components/pricing-page/pricing-table"
import { AddOnsTable } from "@/components/pricing-page/add-ons-table"
import { FloatingCalculatorButton } from "@/components/pricing-page/floating-calculator-button"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="fixed top-0 left-0 right-0 bg-gray-800 shadow-md z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-teal-400">Automation Consulting LLC</h1>
            <nav className="flex items-center">
              <ul className="flex space-x-6 mr-6">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-teal-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-teal-400 border-b-2 border-teal-400 pb-1">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-teal-400 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-teal-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300 transform hover:scale-105">
                Demo Now!
              </button>
            </nav>
          </div>
        </div>
      </header>

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

