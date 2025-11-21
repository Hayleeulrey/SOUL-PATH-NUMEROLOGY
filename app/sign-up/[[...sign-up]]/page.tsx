"use client"

import { SignUp } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams?.get("redirect") || "/lineage"
  const invitationEmail = searchParams?.get("invitationEmail")
  const [initialEmail, setInitialEmail] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (invitationEmail) {
      setInitialEmail(invitationEmail)
    }
  }, [invitationEmail])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 pt-20">
      <div className="w-full max-w-md">
        {invitationEmail && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Create account with:</strong> {invitationEmail}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              This invitation was sent to this email address. Please create your account using this email to claim your profile.
            </p>
          </div>
        )}
        <SignUp 
          routing="path"
          path="/sign-up"
          signInUrl={invitationEmail ? `/sign-in?redirect=${encodeURIComponent(redirect)}&invitationEmail=${encodeURIComponent(invitationEmail)}` : "/sign-in"}
          afterSignUpUrl={redirect}
          initialValues={initialEmail ? { emailAddress: initialEmail } : undefined}
        />
      </div>
    </div>
  )
}
