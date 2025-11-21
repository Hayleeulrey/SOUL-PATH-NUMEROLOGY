"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Sparkles } from "lucide-react"

interface CompletionStepProps {
  onComplete: () => void
}

export function CompletionStep({ onComplete }: CompletionStepProps) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-[#819171]" />
          </div>

          <h1 className="text-3xl font-light text-gray-900 mb-4">
            You're All Set!
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Your profile has been created and your family tree journey begins now.
            Start exploring your family history, add stories, and discover your lineage.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-start gap-4">
              <Sparkles className="h-6 w-6 text-[#819171] flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900 mb-2">
                  Next Steps
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Explore your family directory</li>
                  <li>• Add more family members</li>
                  <li>• Use Sage AI to capture stories</li>
                  <li>• Discover numerology insights</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={onComplete}
            className="bg-[#819171] hover:bg-[#6e7a5d] text-white px-12 py-6 text-lg rounded-xl transition-all"
          >
            Go to Family Directory
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
