"use client"

import { useState } from "react"
import { WelcomeStep } from "./components/welcome-step"
import { ProfileCreationStep } from "./components/profile-creation-step"
import { FamilyQuickAddStep } from "./components/family-quick-add-step"
import { CompletionStep } from "./components/completion-step"
import { ProgressBar } from "./components/progress-bar"

type Step = "welcome" | "profile" | "family" | "complete"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
  const [onboardingData, setOnboardingData] = useState<any>({})

  const handleNext = (step: Step, data?: any) => {
    if (data) {
      setOnboardingData({ ...onboardingData, ...data })
    }
    
    // Determine next step
    const stepOrder: Step[] = ["welcome", "profile", "family", "complete"]
    const currentIndex = stepOrder.indexOf(currentStep)
    setCurrentStep(stepOrder[currentIndex + 1])
  }

  const handleBack = () => {
    const stepOrder: Step[] = ["welcome", "profile", "family", "complete"]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const handleSkip = async () => {
    // If on welcome step, skip onboarding entirely
    if (currentStep === "welcome") {
      try {
        const response = await fetch("/api/user-profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            onboardingComplete: true,
            onboardingStep: 3
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          console.error("Error skipping onboarding:", error)
          // Still redirect even if API call fails
        }
        
        // Force a hard redirect to ensure the page reloads
        window.location.href = "/lineage"
        return
      } catch (error) {
        console.error("Error skipping onboarding:", error)
        // Still redirect even if there's an error
        window.location.href = "/lineage"
        return
      }
    }
    
    // For other steps, skip to next step or complete
    const stepOrder: Step[] = ["welcome", "profile", "family", "complete"]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    try {
      await fetch("/api/user-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboardingComplete: true,
          onboardingStep: 3
        })
      })
      window.location.href = "/lineage"
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  const steps = [
    { id: "welcome", label: "Welcome" },
    { id: "profile", label: "Your Profile" },
    { id: "family", label: "Family & Invites" },
    { id: "complete", label: "Complete" }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const handleStepClick = (index: number) => {
    const stepOrder: Step[] = ["welcome", "profile", "family", "complete"]
    if (index < stepOrder.length) {
      setCurrentStep(stepOrder[index])
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-[80px] bg-white z-50 pb-6 border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <ProgressBar 
            steps={steps} 
            currentStep={currentStepIndex}
            onStepClick={handleStepClick}
          />
        </div>
      </div>
      
      <div className="container mx-auto px-6 pb-12" style={{ paddingTop: '120px' }}>

        <div className="max-w-3xl mx-auto">

          {currentStep === "welcome" && (
            <WelcomeStep 
              onNext={() => handleNext("welcome")} 
              onSkip={handleSkip}
              onBack={handleBack}
              showBack={false}
            />
          )}

          {currentStep === "profile" && (
            <ProfileCreationStep 
              onNext={(data) => handleNext("profile", data)} 
              onSkip={handleSkip}
              onBack={handleBack}
              showBack={true}
            />
          )}

          {currentStep === "family" && (
            <FamilyQuickAddStep 
              onNext={(data) => handleNext("family", data)} 
              onSkip={handleSkip}
              onboardingData={onboardingData}
              onBack={handleBack}
              showBack={true}
            />
          )}

          {currentStep === "complete" && (
            <CompletionStep 
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
