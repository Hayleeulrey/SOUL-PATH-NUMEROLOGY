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
                  <a href="/" className="text-gray-300 hover:text-teal-400 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-teal-400 border-b-2 border-teal-400 pb-1">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-gray-300 hover:text-teal-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-teal-400 transition-colors">
                    Contact
                  </a>
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

      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-teal-400">Automation Consulting LLC</h2>
              <p>Empowering businesses through custom financial dashboards</p>
            </div>
            <div>
              <ul className="flex space-x-4">
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-teal-400 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2025 Automation Consulting LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <FloatingCalculatorButton />
    </div>
  )
}

