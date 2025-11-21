"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface ProfileCreationStepProps {
  onNext: (data: any) => void
  onSkip: () => void
  onBack: () => void
  showBack: boolean
}

export function ProfileCreationStep({ onNext, onSkip, onBack, showBack }: ProfileCreationStepProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    maidenName: "",
    suffix: "",
    birthDate: "",
    birthCity: "",
    birthState: "",
    bio: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/family-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          birthDate: formData.birthDate || null,
          maidenName: formData.maidenName || undefined,
          suffix: formData.suffix || undefined,
          isAlive: true,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Save to user profile
        await fetch("/api/user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            familyMemberId: result.data.id,
            onboardingComplete: false,
            onboardingStep: 1
          })
        })

        onNext({ familyMemberId: result.data.id })
      }
    } catch (error) {
      console.error("Error creating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create Your Profile</CardTitle>
        <CardDescription>
          Let's start by creating your own family member profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maidenName">Maiden Name</Label>
              <Input
                id="maidenName"
                value={formData.maidenName}
                onChange={(e) => setFormData({ ...formData, maidenName: e.target.value })}
                placeholder="Previous surname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suffix">Suffix</Label>
              <Input
                id="suffix"
                value={formData.suffix}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                placeholder="Jr., Sr., III, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Birth Date</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="birthCity">Birth City</Label>
              <Input
                id="birthCity"
                value={formData.birthCity}
                onChange={(e) => setFormData({ ...formData, birthCity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthState">Birth State</Label>
              <Input
                id="birthState"
                value={formData.birthState}
                onChange={(e) => setFormData({ ...formData, birthState: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          {showBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              className="flex-1 text-gray-400 hover:text-gray-600"
            >
              Skip
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.firstName || !formData.lastName}
              className="flex-1 bg-[#819171] hover:bg-[#6e7a5d] text-white"
            >
              {loading ? "Creating..." : "Continue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
