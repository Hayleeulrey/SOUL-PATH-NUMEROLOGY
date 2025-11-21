"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TreePine, Users, Sparkles } from "lucide-react"

interface WelcomeStepProps {
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  showBack: boolean
}

export function WelcomeStep({ onNext, onSkip, onBack, showBack }: WelcomeStepProps) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-12">
        <div className="text-center">
          <div className="mb-8">
            <TreePine className="h-20 w-20 text-[#819171] mx-auto" />
          </div>
          
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Welcome to Soul Path Lineage
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Preserve your family's stories, connect with your heritage, and discover the 
            sacred patterns in your lineage through numerology and AI-powered biography tools.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <Users className="h-8 w-8 text-[#819171] mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Build Your Tree</h3>
              <p className="text-sm text-gray-600">
                Add family members and document your lineage
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <Sparkles className="h-8 w-8 text-[#819171] mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">AI Biographer</h3>
              <p className="text-sm text-gray-600">
                Let Sage help you preserve family stories
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <TreePine className="h-8 w-8 text-[#819171] mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Sacred Numbers</h3>
              <p className="text-sm text-gray-600">
                Discover numerology insights for each family member
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onNext}
              className="bg-[#819171] hover:bg-[#6e7a5d] text-white px-8 py-6 text-lg rounded-xl transition-all"
            >
              Create Your Profile
            </Button>
            <Button
              onClick={onSkip}
              variant="ghost"
              className="px-8 py-6 text-lg text-gray-600 hover:text-black border border-gray-200 rounded-xl"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
