"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Image, 
  FileText, 
  Mic, 
  Users, 
  BookOpen,
  Tag,
  User,
  ArrowRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ContentApproval {
  id: string
  contentType: string
  contentId: string
  familyMemberId: string
  createdBy: string
  status: string
  reviewedAt: string | null
  reviewedBy: string | null
  notes: string | null
  createdAt: string
  content?: any
  creator?: {
    id: string
    name: string | null
    email: string
  } | null
}

interface ContentTag {
  id: string
  contentType: string
  contentId: string
  taggedMemberId: string
  taggedBy: string
  status: string
  notifiedAt: string | null
  reviewedAt: string | null
  createdAt: string
  taggedMember?: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function ReviewPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const [approvals, setApprovals] = useState<ContentApproval[]>([])
  const [tags, setTags] = useState<ContentTag[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("approvals")
  const [denyNotes, setDenyNotes] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (userId) {
      fetchData()
    }
  }, [userId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch pending approvals
      const approvalsRes = await fetch("/api/content-approvals")
      const approvalsData = await approvalsRes.json()
      if (approvalsData.success) {
        setApprovals(approvalsData.data.approvals || [])
      }

      // Fetch pending tags for user's profile
      const profileRes = await fetch("/api/user-profile")
      const profileData = await profileRes.json()
      if (profileData.success && profileData.data?.familyMemberId) {
        const tagsRes = await fetch(
          `/api/content-tags?taggedMemberId=${profileData.data.familyMemberId}&status=PENDING`
        )
        const tagsData = await tagsRes.json()
        if (tagsData.success) {
          setTags(tagsData.data.tags || [])
        }
      }
    } catch (error) {
      console.error("Error fetching review data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (approvalId: string) => {
    setProcessing({ ...processing, [approvalId]: true })
    try {
      const response = await fetch("/api/content-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          action: "approve",
        }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Error approving:", error)
    } finally {
      setProcessing({ ...processing, [approvalId]: false })
    }
  }

  const handleDeny = async (approvalId: string) => {
    setProcessing({ ...processing, [approvalId]: true })
    try {
      const response = await fetch("/api/content-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          action: "deny",
          notes: denyNotes[approvalId] || undefined,
        }),
      })

      if (response.ok) {
        await fetchData()
        setDenyNotes({ ...denyNotes, [approvalId]: "" })
      }
    } catch (error) {
      console.error("Error denying:", error)
    } finally {
      setProcessing({ ...processing, [approvalId]: false })
    }
  }

  const handleTagApprove = async (tagId: string) => {
    setProcessing({ ...processing, [tagId]: true })
    try {
      const response = await fetch(`/api/content-tags/${tagId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Error approving tag:", error)
    } finally {
      setProcessing({ ...processing, [tagId]: false })
    }
  }

  const handleTagDeny = async (tagId: string) => {
    setProcessing({ ...processing, [tagId]: true })
    try {
      const response = await fetch(`/api/content-tags/${tagId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deny" }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Error denying tag:", error)
    } finally {
      setProcessing({ ...processing, [tagId]: false })
    }
  }

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case "photo":
        return <Image className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "audio":
        return <Mic className="h-4 w-4" />
      case "relationship":
        return <Users className="h-4 w-4" />
      case "biography":
        return <BookOpen className="h-4 w-4" />
      case "profile":
        return <User className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getContentTitle = (approval: ContentApproval) => {
    if (approval.contentType === "photo") {
      return approval.content?.caption || approval.content?.originalName || "Photo"
    } else if (approval.contentType === "story") {
      return approval.content?.title || "Story"
    } else if (approval.contentType === "document") {
      return approval.content?.title || approval.content?.originalName || "Document"
    } else if (approval.contentType === "audio") {
      return approval.content?.originalName || "Audio File"
    } else if (approval.contentType === "relationship") {
      return `Relationship: ${approval.content?.person?.firstName} ${approval.content?.person?.lastName} ↔ ${approval.content?.related?.firstName} ${approval.content?.related?.lastName}`
    } else if (approval.contentType === "biography") {
      return approval.content?.prompt?.question || "Biography Response"
    } else if (approval.contentType === "profile") {
      return `Profile: ${approval.content?.firstName} ${approval.content?.lastName}`
    }
    return "Content"
  }

  const getContentPreview = (approval: ContentApproval) => {
    if (approval.contentType === "photo" && approval.content?.filePath) {
      return (
        <img
          src={approval.content.filePath}
          alt={getContentTitle(approval)}
          className="w-full h-48 object-cover rounded-lg"
        />
      )
    } else if (approval.contentType === "story" && approval.content?.content) {
      return (
        <p className="text-sm text-gray-600 line-clamp-3">
          {approval.content.content}
        </p>
      )
    } else if (approval.contentType === "document" && approval.content?.description) {
      return (
        <p className="text-sm text-gray-600 line-clamp-3">
          {approval.content.description}
        </p>
      )
    } else if (approval.contentType === "biography" && approval.content?.answer) {
      return (
        <p className="text-sm text-gray-600 line-clamp-3">
          {approval.content.answer}
        </p>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const totalPending = approvals.length + tags.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Review & Approve</h1>
            <p className="text-gray-600 max-w-2xl">
              Welcome! You've successfully claimed your profile. This page shows content that family members have added to your profile and is waiting for your review. 
              Review and approve items to make them visible, or deny them if you'd prefer not to include them.
            </p>
          </div>
          <Button
            onClick={() => router.push("/lineage")}
            className="flex items-center gap-2"
          >
            Go to Family Directory
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        {totalPending === 0 && (
          <Card className="bg-green-50 border-green-200 mb-6">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">All caught up!</h3>
                  <p className="text-sm text-green-700">
                    You don't have any pending items to review. You can explore your family directory or add content to your profile.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/lineage")}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Explore Directory
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Approvals
            {approvals.length > 0 && (
              <Badge variant="secondary">{approvals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Pending Tags
            {tags.length > 0 && (
              <Badge variant="secondary">{tags.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-6">
          {approvals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No pending approvals</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <Card key={approval.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getContentIcon(approval.contentType)}
                        <div>
                          <CardTitle className="text-lg">
                            {getContentTitle(approval)}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {approval.creator?.name || approval.creator?.email || "Unknown"} •{" "}
                            {new Date(approval.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {approval.contentType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {getContentPreview(approval)}
                    <div className="mt-4 space-y-3">
                      <div>
                        <Label htmlFor={`deny-notes-${approval.id}`}>
                          Notes (optional, for denials)
                        </Label>
                        <Textarea
                          id={`deny-notes-${approval.id}`}
                          placeholder="Add a note explaining why this is being denied..."
                          value={denyNotes[approval.id] || ""}
                          onChange={(e) =>
                            setDenyNotes({
                              ...denyNotes,
                              [approval.id]: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(approval.id)}
                          disabled={processing[approval.id]}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDeny(approval.id)}
                          disabled={processing[approval.id]}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          {tags.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No pending tags</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tags.map((tag) => (
                <Card key={tag.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Tag className="h-4 w-4" />
                        <div>
                          <CardTitle className="text-lg">
                            You've been tagged in {tag.contentType}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {new Date(tag.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {tag.contentType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleTagApprove(tag.id)}
                        disabled={processing[tag.id]}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleTagDeny(tag.id)}
                        disabled={processing[tag.id]}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Deny
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

