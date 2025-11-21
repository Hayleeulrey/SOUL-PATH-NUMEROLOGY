"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, MapPin, CheckCircle, AlertCircle, Mail } from "lucide-react"

interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  maidenName?: string
  suffix?: string
  birthDate?: string
  birthCity?: string
  birthState?: string
  birthCountry?: string
  isClaimed: boolean
}

interface Invitation {
  id: string
  familyMemberId: string
  email?: string
  status: string
  expiresAt: string
  familyMember: FamilyMember
}

export default function ClaimProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const token = params?.token as string
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailMismatch, setEmailMismatch] = useState(false)

  useEffect(() => {
    if (token) {
      fetchInvitation()
    }
  }, [token])

  useEffect(() => {
    // If user is not signed in, redirect to sign-in with return URL and invitation token
    if (!isSignedIn && !loading && invitation) {
      const invitationEmail = invitation.email
      if (invitationEmail) {
        router.push(`/sign-in?redirect=/claim/${token}&invitationEmail=${encodeURIComponent(invitationEmail)}`)
      } else {
        router.push(`/sign-in?redirect=/claim/${token}`)
      }
    }
  }, [isSignedIn, loading, token, router, invitation])

  useEffect(() => {
    // Check if signed-in user's email matches invitation email
    if (isSignedIn && user && invitation && invitation.email) {
      const userEmail = user.primaryEmailAddress?.emailAddress
      const invitationEmail = invitation.email.toLowerCase().trim()
      const userEmailNormalized = userEmail?.toLowerCase().trim()
      
      if (userEmailNormalized && userEmailNormalized !== invitationEmail) {
        setEmailMismatch(true)
      } else {
        setEmailMismatch(false)
      }
    }
  }, [isSignedIn, user, invitation])

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${token}`)
      const data = await response.json()
      if (data.success && data.invitation) {
        setInvitation(data.invitation)
        if (data.expired) {
          setError("This invitation has expired")
        }
      } else {
        setError("Invitation not found or has expired")
      }
    } catch (error) {
      console.error("Error fetching invitation:", error)
      setError("Failed to load invitation")
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!invitation || !userId) return

    setClaiming(true)
    setError(null)

    try {
      const response = await fetch(`/api/family-members/${invitation.familyMemberId}/claim`, {
        method: "POST",
      })

      const data = await response.json()
      if (data.success) {
        // Redirect to review page
        router.push("/lineage/review")
      } else {
        setError(data.error || "Failed to claim profile")
      }
    } catch (error) {
      console.error("Error claiming profile:", error)
      setError("Failed to claim profile")
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Invitation Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  const { familyMember } = invitation
  const isExpired = new Date(invitation.expiresAt) < new Date()
  const isAlreadyClaimed = familyMember.isClaimed

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Claim Your Profile</CardTitle>
            <CardDescription>
              You've been invited to claim your family profile on Soul Path Lineage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isExpired && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Invitation Expired</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    This invitation has expired. Please contact the person who invited you for a new invitation.
                  </p>
                </div>
              </div>
            )}

            {isAlreadyClaimed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Profile Already Claimed</p>
                  <p className="text-sm text-blue-700 mt-1">
                    This profile has already been claimed. If this is your profile, please sign in to access it.
                  </p>
                </div>
              </div>
            )}

            {emailMismatch && invitation?.email && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900">Email Address Mismatch</p>
                  <p className="text-sm text-amber-700 mt-1">
                    This invitation was sent to <strong>{invitation.email}</strong>, but you're signed in as <strong>{user?.primaryEmailAddress?.emailAddress}</strong>.
                  </p>
                  <p className="text-sm text-amber-700 mt-2">
                    To claim this profile, you need to sign in with the email address the invitation was sent to.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => {
                        router.push(`/sign-in?redirect=/claim/${token}&invitationEmail=${encodeURIComponent(invitation.email!)}`)
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Sign in with {invitation.email}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        router.push(`/sign-up?redirect=/claim/${token}&invitationEmail=${encodeURIComponent(invitation.email!)}`)
                      }}
                    >
                      Create account with {invitation.email}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {familyMember.firstName} {familyMember.middleName} {familyMember.lastName}
                    {familyMember.suffix && ` ${familyMember.suffix}`}
                  </h3>
                  {familyMember.maidenName && (
                    <p className="text-sm text-gray-600">
                      Maiden name: {familyMember.maidenName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {familyMember.birthDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Birth Date</p>
                      <p className="text-sm font-medium">
                        {new Date(familyMember.birthDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {(familyMember.birthCity || familyMember.birthState) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Birth Place</p>
                      <p className="text-sm font-medium">
                        {[familyMember.birthCity, familyMember.birthState, familyMember.birthCountry]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                By claiming this profile, you will:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                <li>Gain full control over your profile information</li>
                <li>Be able to review and approve content added by others</li>
                <li>Receive notifications when you're tagged in photos or stories</li>
                <li>Be able to assign admins to help manage your profile</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleClaim}
                disabled={claiming || isExpired || isAlreadyClaimed || !isSignedIn || emailMismatch}
                className="flex-1"
              >
                {claiming ? "Claiming..." : "Claim This Profile"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

