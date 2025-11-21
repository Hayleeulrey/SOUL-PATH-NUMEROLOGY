"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Shield, Database, Cloud, Lock, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type PrivacyMode = "local-only" | "cloud-allowed" | "cloud-with-redaction"

export default function PrivacySettingsPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<PrivacyMode>("local-only")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  useEffect(() => {
    loadSettings()
    loadAuditLogs()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/privacy-settings?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.mode) {
          setMode(data.mode)
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAuditLogs = async () => {
    try {
      const response = await fetch(`/api/audit-logs?userId=${userId}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs || [])
      }
    } catch (error) {
      console.error("Failed to load audit logs:", error)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/privacy-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mode })
      })

      if (response.ok) {
        alert("Privacy settings saved successfully")
        loadAuditLogs()
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      alert("Failed to save settings")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/lineage')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Directory
              </Button>
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">Privacy Settings</h1>
            <p className="text-gray-600">
              Control how your family data is processed. Local-only mode ensures all data stays on your computer.
            </p>
          </div>

          {/* Privacy Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Processing Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as PrivacyMode)}>
                <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <RadioGroupItem value="local-only" id="local-only" className="mt-1" />
                  <Label htmlFor="local-only" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Local Only</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Most Private
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      All AI processing happens on your machine using Ollama. No data leaves your computer.
                    </p>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <RadioGroupItem value="cloud-with-redaction" id="cloud-with-redaction" className="mt-1" />
                  <Label htmlFor="cloud-with-redaction" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Cloud with Redaction</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        Balanced
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Sensitive information (names, dates, addresses) is removed before sending to OpenAI.
                    </p>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <RadioGroupItem value="cloud-allowed" id="cloud-allowed" className="mt-1" />
                  <Label htmlFor="cloud-allowed" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Cloud className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Cloud Allowed</span>
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        Least Private
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Data is sent to OpenAI for processing. Provides best AI quality but data leaves your computer.
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              <Button 
                onClick={saveSettings} 
                disabled={saving}
                className="w-full bg-[#819171] hover:bg-[#6e7a5d]"
              >
                {saving ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No audit logs yet. Logs will appear here after you use AI features.
                  </p>
                ) : (
                  auditLogs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={log.egress ? "destructive" : "secondary"}>
                        {log.egress ? "Cloud" : "Local"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

