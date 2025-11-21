"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Tag, Mail, Save } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserPreference {
  id: string
  userId: string
  allowTaggingWithoutPermission: boolean
  emailNotifications: boolean
}

export default function PreferencesPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const [preferences, setPreferences] = useState<UserPreference | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [allowTagging, setAllowTagging] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchPreferences()
    }
  }, [userId])

  const fetchPreferences = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user-preferences")
      const data = await response.json()
      if (data.success && data.data) {
        setPreferences(data.data)
        setAllowTagging(data.data.allowTaggingWithoutPermission)
        setEmailNotifications(data.data.emailNotifications)
      }
    } catch (error) {
      console.error("Error fetching preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/user-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowTaggingWithoutPermission: allowTagging,
          emailNotifications: emailNotifications,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPreferences(data.data)
        // Show success message (you could add a toast here)
        alert("Preferences saved successfully!")
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      alert("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Preferences</h1>
        <p className="text-gray-600">
          Manage your notification and privacy preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <CardTitle>Tagging Preferences</CardTitle>
            </div>
            <CardDescription>
              Control how others can tag you in content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-tagging" className="text-base">
                  Allow others to tag me without permission
                </Label>
                <p className="text-sm text-gray-500">
                  When enabled, others can tag you in photos, stories, and other content.
                  You will always be notified when tagged, regardless of this setting.
                </p>
              </div>
              <Switch
                id="allow-tagging"
                checked={allowTagging}
                onCheckedChange={setAllowTagging}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
            <CardDescription>
              Control email notifications for important events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base">
                  Email notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Receive email notifications when you're tagged, when content needs your approval,
                  or when your profile is claimed.
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

