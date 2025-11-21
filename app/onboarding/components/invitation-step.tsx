"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, User } from "lucide-react"

interface InvitationStepProps {
  onNext: (data: any) => void
  onSkip: () => void
  onboardingData: any
}

interface PendingInvitation {
  id: string
  token: string
  familyMemberId: string
  familyMember: {
    id: string
    firstName: string
    lastName: string
  }
}

export function InvitationStep({ onNext, onSkip, onboardingData }: InvitationStepProps) {
  const router = useRouter()
  const { userId } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [pendingInvitation, setPendingInvitation] = useState<PendingInvitation | null>(null)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    // Check if user has a pending invitation
    const checkPendingInvitation = async () => {
      if (!userId) return
      try {
        // Get user's email from Clerk
        const userResponse = await fetch("/api/user-profile")
        // For now, we'll need to check invitations by email
        // This would ideally be done server-side, but for now we'll skip this check
        // The claim flow happens via the /claim/[token] page when users click invitation links
      } catch (error) {
        console.error("Error checking pending invitation:", error)
      }
    }
    checkPendingInvitation()
  }, [userId])

  const handleClaim = async () => {
    if (!pendingInvitation || !userId) return

    setClaiming(true)
    try {
      const response = await fetch(`/api/family-members/${pendingInvitation.familyMemberId}/claim`, {
        method: "POST",
      })

      const data = await response.json()
      if (data.success) {
        // Redirect to review page
        router.push("/lineage/review")
      } else {
        alert(data.error || "Failed to claim profile")
      }
    } catch (error) {
      console.error("Error claiming profile:", error)
      alert("Failed to claim profile")
    } finally {
      setClaiming(false)
    }
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Invitation logic will be added when we create the API
      await fetch("/api/user-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingStep: 3 })
      })

      setSent(true)
    } catch (error) {
      console.error("Error sending invitation:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Invite Family Members</CardTitle>
        <CardDescription>
          Invite family members to join and contribute to your family tree
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingInvitation ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900 mb-1">
                    You have a pending invitation!
                  </p>
                  <p className="text-sm text-blue-700">
                    A profile has been created for {pendingInvitation.familyMember.firstName} {pendingInvitation.familyMember.lastName}.
                    Would you like to claim it?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleClaim}
                disabled={claiming}
                className="flex-1 bg-[#819171] hover:bg-[#6e7a5d] text-white"
              >
                {claiming ? "Claiming..." : "Claim My Profile"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                className="flex-1"
              >
                Skip
              </Button>
            </div>
          </div>
        ) : !sent ? (
          <form onSubmit={handleSendInvitation} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="family.member@example.com"
              />
              <p className="text-sm text-gray-500">
                We'll send them an invitation to claim their profile and contribute to your family tree.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading || !email}
                className="flex-1 bg-[#819171] hover:bg-[#6e7a5d] text-white"
              >
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                className="flex-1"
              >
                Skip
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-[#819171]" />
            </div>
            <h3 className="text-xl font-medium mb-2">Invitation Sent!</h3>
            <p className="text-gray-600 mb-6">
              Your invitation has been sent to {email}
            </p>
            <Button
              onClick={() => setSent(false)}
              variant="outline"
              className="mr-4"
            >
              Send Another
            </Button>
            <Button
              onClick={onSkip}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Continue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
