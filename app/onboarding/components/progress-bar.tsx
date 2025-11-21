"use client"

import { Check } from "lucide-react"

interface Step {
  id: string
  label: string
}

interface ProgressBarProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (index: number) => void
  className?: string
}

export function ProgressBar({ steps, currentStep, onStepClick, className }: ProgressBarProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-x-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle and Label */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onStepClick && index < currentStep && onStepClick(index)}
                disabled={index >= currentStep || !onStepClick}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base transition-all disabled:cursor-not-allowed ${
                  index < currentStep
                    ? "bg-[#819171] text-white hover:bg-[#6e7a5d] cursor-pointer shadow-md"
                    : index === currentStep
                    ? "bg-[#819171] text-white ring-4 ring-[#819171]/20 shadow-md"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-6 w-6" />
                ) : (
                  index + 1
                )}
              </button>
              <span
                className={`text-xs mt-2 whitespace-nowrap font-medium ${
                  index === currentStep ? "text-[#819171]" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                className={`w-16 h-1 mx-4 ${
                  index < currentStep ? "bg-[#819171]" : "bg-gray-100"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
