"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import PricingCalculator from "./pricing-calculator"

export function FloatingCalculatorButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 z-50 bg-teal-500 hover:bg-teal-600 text-white text-lg py-3 px-6 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        Try our Pricing Calculator Now
      </Button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl mx-auto my-8 overflow-hidden relative">
            <div className="h-[calc(100vh-4rem)] max-h-[800px] overflow-y-auto">
              <div className="sticky top-0 right-0 p-2 flex justify-end bg-gray-900 z-10">
                <Button
                  className="bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="p-6 pt-0">
                <PricingCalculator />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

