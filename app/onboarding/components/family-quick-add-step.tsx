"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Mail, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FamilyQuickAddStepProps {
  onNext: (data: any) => void
  onSkip: () => void
  onboardingData: any
  onBack: () => void
  showBack: boolean
}

const relationshipTypes = [
  { value: "PARENT", label: "Parent" },
  { value: "SIBLING", label: "Sibling" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "CHILD", label: "Child" },
  { value: "GRANDPARENT", label: "Grandparent" },
]

export function FamilyQuickAddStep({ onNext, onSkip, onboardingData, onBack, showBack }: FamilyQuickAddStepProps) {
  const [members, setMembers] = useState([
    { firstName: "", lastName: "", maidenName: "", suffix: "", relationshipType: "", birthDate: "", email: "" }
  ])

  const addMember = () => {
    setMembers([...members, { firstName: "", lastName: "", maidenName: "", suffix: "", relationshipType: "", birthDate: "", email: "" }])
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, field: string, value: string) => {
    const updated = [...members]
    updated[index] = { ...updated[index], [field]: value }
    setMembers(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create all family members
      for (const member of members) {
        if (member.firstName && member.lastName && member.relationshipType) {
          await fetch("/api/family-members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: member.firstName,
              lastName: member.lastName,
              birthDate: member.birthDate || null,
              isAlive: true,
              relationshipTypeToUser: member.relationshipType, // Create relationship to user
            }),
          })
        }
      }

      await fetch("/api/user-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingStep: 2 })
      })

      onNext({ familyMembers: members })
    } catch (error) {
      console.error("Error adding family members:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Add Your Family</CardTitle>
        <CardDescription>
          Add family members directly or invite them to join and claim their profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {members.map((member, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Family Member {index + 1}</h4>
                {members.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <Label>Add this person as: *</Label>
                <Select
                  value={member.relationshipType}
                  onValueChange={(value) => updateMember(index, "relationshipType", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="e.g., 'John Doe' is my..." />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Select how this person is related to you</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={member.firstName}
                    onChange={(e) => updateMember(index, "firstName", e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={member.lastName}
                    onChange={(e) => updateMember(index, "lastName", e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Maiden Name</Label>
                  <Input
                    value={member.maidenName}
                    onChange={(e) => updateMember(index, "maidenName", e.target.value)}
                    placeholder="Previous surname"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Suffix</Label>
                  <Input
                    value={member.suffix}
                    onChange={(e) => updateMember(index, "suffix", e.target.value)}
                    placeholder="Jr., Sr., III, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="whitespace-nowrap">Birth Date</Label>
                <Input
                  type="date"
                  value={member.birthDate}
                  onChange={(e) => updateMember(index, "birthDate", e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#819171]" />
                    <Label htmlFor={`email-${index}`} className="text-sm font-medium">
                      Invite to Join (Optional)
                    </Label>
                  </div>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={member.email}
                    onChange={(e) => updateMember(index, "email", e.target.value)}
                    placeholder="family.member@example.com"
                  />
                  <p className="text-xs text-gray-500">
                    Send an invitation for them to claim and manage their own profile
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addMember}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Family Member
          </Button>

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
              className="flex-1 bg-[#819171] hover:bg-[#6e7a5d] text-white"
            >
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
