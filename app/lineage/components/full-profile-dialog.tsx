"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  User, 
  Mic, 
  Video, 
  Image, 
  BookOpen, 
  Users, 
  FileText, 
  Upload, 
  Trash2, 
  Play,
  Plus,
  X,
  Sparkles,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Info,
  Edit,
  Clock,
  Tag,
  Shield,
  Lock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FamilyMemberWithRelations } from "@/lib/lineage-types"
import { RelationshipManagement } from "./relationship-management"
import { AIBiographerSection } from "./ai-biographer-section"
import { ImageCropperDialog } from "@/components/ui/image-cropper-dialog"
import { TagPeopleDialog } from "@/components/lineage/tag-people-dialog"
import { AdminManagement } from "./admin-management"

interface FullProfileDialogProps {
  member: FamilyMemberWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
  initialTab?: string
  userFamilyMemberId?: string | null
}

export function FullProfileDialog({ member, open, onOpenChange, onUpdate, initialTab = "overview", userFamilyMemberId }: FullProfileDialogProps) {
  const { userId: currentUserId } = useAuth()
  
  // Check if this is the user's own profile
  // Check both userId match AND if it's the user's family member profile
  // Use useMemo to ensure it recalculates when dependencies change
  const isOwnProfile = useMemo(() => {
    if (!member || !currentUserId) return false
    
    // Check if member.userId matches current user
    const hasMatchingUserId = (member as any).userId === currentUserId
    
    // Check if this is the user's family member profile
    const isUserFamilyMember = userFamilyMemberId && member.id === userFamilyMemberId
    
    const result = hasMatchingUserId || isUserFamilyMember
    return result
  }, [member, currentUserId, userFamilyMemberId, open])
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [audioFiles, setAudioFiles] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [fileToCrop, setFileToCrop] = useState<File | null>(null)
  const [invitationEmail, setInvitationEmail] = useState("")
  const [invitationStatus, setInvitationStatus] = useState<string | null>(null)
  const [isSendingInvitation, setIsSendingInvitation] = useState(false)
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    maidenName: "",
    birthDate: "",
    deathDate: "",
    birthCity: "",
    birthState: "",
    birthCountry: "",
    deathCity: "",
    deathState: "",
    deathCountry: "",
    isAlive: true,
    email: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [editInvitationEmail, setEditInvitationEmail] = useState("")
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)
  const [pendingTagsCount, setPendingTagsCount] = useState(0)
  const [canEdit, setCanEdit] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [taggingContentType, setTaggingContentType] = useState<"photo" | "story" | "document" | "audio">("photo")
  const [taggingContentId, setTaggingContentId] = useState("")

  // Helper function to format date for input field (preserves local date, avoids timezone issues)
  const formatDateForInput = (date: Date | string | null): string => {
    if (!date) return ""
    const d = new Date(date)
    // Use local date components to avoid timezone conversion issues
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Initialize edit form data if user can edit
  const initializeEditForm = async () => {
    if (!member) return
    
    // Check permissions first
    let canEditProfile = false
    // Calculate if this is own profile for use in this function
    const memberIsOwnProfile = member && (
      (member as any).userId === currentUserId || 
      (userFamilyMemberId && member.id === userFamilyMemberId)
    )
    try {
      const permResponse = await fetch(`/api/family-members/${member.id}/permissions`)
      if (permResponse.ok) {
        const permData = await permResponse.json()
        if (permData.success) {
          canEditProfile = permData.data.canEdit
        }
      }
    } catch (error) {
      console.error("Error checking permissions:", error)
      // Fallback: check if it's own profile or unclaimed profile created by user
      const memberIsClaimed = (member as any).isClaimed
      const memberCreatedBy = (member as any).createdBy
      canEditProfile = memberIsOwnProfile || (!memberIsClaimed && memberCreatedBy === currentUserId)
    }
    
    if (canEditProfile) {
      // Fetch invitation email if exists (only for non-own profiles)
      let invitationEmail = ""
      if (!memberIsOwnProfile) {
        try {
          const invResponse = await fetch(`/api/family-members/${member.id}/invitation`)
          if (invResponse.ok) {
            const invData = await invResponse.json()
            if (invData.success && invData.invitation) {
              invitationEmail = invData.invitation.email || ""
            }
          }
        } catch (error) {
          console.error("Error fetching invitation:", error)
        }
      }
      
      setEditFormData({
        firstName: member.firstName || "",
        middleName: member.middleName || "",
        lastName: member.lastName || "",
        suffix: (member as any).suffix || "",
        maidenName: member.maidenName || "",
        birthDate: formatDateForInput(member.birthDate),
        deathDate: formatDateForInput(member.deathDate),
        birthCity: (member as any).birthCity || "",
        birthState: (member as any).birthState || "",
        birthCountry: (member as any).birthCountry || "",
        deathCity: (member as any).deathCity || "",
        deathState: (member as any).deathState || "",
        deathCountry: (member as any).deathCountry || "",
        isAlive: member.isAlive,
        email: invitationEmail,
      })
      setEditInvitationEmail(invitationEmail)
    } else {
      // Reset form data if cannot edit
      setEditFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        maidenName: "",
        birthDate: "",
        deathDate: "",
        birthCity: "",
        birthState: "",
        birthCountry: "",
        deathCity: "",
        deathState: "",
        deathCountry: "",
        isAlive: true,
        email: "",
      })
      setEditInvitationEmail("")
    }
  }

  useEffect(() => {
    if (member && open) {
      fetchMedia()
      // Only fetch invitation status if it's not the user's own profile
      if (!isOwnProfile) {
        fetchInvitationStatus()
      } else {
        // Clear invitation state for own profile
        setInvitationStatus(null)
        setInvitationEmail("")
      }
      checkPermissions()
      fetchPendingCounts()
      
      // Always default to "overview" tab
      setActiveTab(initialTab || "overview")
      setIsEditing(false)
      
      // Initialize edit form data
      initializeEditForm()
    }
  }, [member, open, initialTab, currentUserId, userFamilyMemberId, isOwnProfile])

  const fetchInvitationStatus = async () => {
    if (!member || isOwnProfile) return // Skip for own profile
    try {
      const response = await fetch(`/api/family-members/${member.id}/invitation`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.invitation) {
          setInvitationStatus(data.invitation.status)
          setInvitationEmail(data.invitation.email || "")
        } else {
          // No invitation exists
          setInvitationStatus(null)
          setInvitationEmail("")
        }
      } else {
        // No invitation exists
        setInvitationStatus(null)
        setInvitationEmail("")
      }
    } catch (error) {
      console.error("Error fetching invitation status:", error)
      setInvitationStatus(null)
      setInvitationEmail("")
    }
  }

  const checkPermissions = async () => {
    if (!member || !currentUserId) return
    
    setIsCheckingPermissions(true)
    try {
      // Use server-side permission check for accuracy
      const response = await fetch(`/api/family-members/${member.id}/permissions`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCanEdit(data.data.canEdit)
          setIsAdmin(data.data.isAdmin)
        }
      } else {
        // Fallback to client-side check if API fails
        const memberIsOwnProfile = (member as any).userId === currentUserId || 
          (userFamilyMemberId && member.id === userFamilyMemberId)
        const memberIsClaimed = (member as any).isClaimed
        const memberCreatedBy = (member as any).createdBy
        
        if (!memberIsClaimed) {
          // Unclaimed - only creator can edit
          setCanEdit(memberCreatedBy === currentUserId)
        } else {
          // Claimed - owner or admin can edit
          setCanEdit(memberIsOwnProfile)
        }
      }
    } catch (error) {
      console.error("Error checking permissions:", error)
      // Fallback to client-side check
      const memberIsOwnProfile = (member as any).userId === currentUserId
      const memberIsClaimed = (member as any).isClaimed
      const memberCreatedBy = (member as any).createdBy
      
      if (!memberIsClaimed) {
        setCanEdit(memberCreatedBy === currentUserId)
      } else {
        setCanEdit(memberIsOwnProfile)
      }
    } finally {
      setIsCheckingPermissions(false)
    }
  }

  const fetchPendingCounts = async () => {
    if (!member || !currentUserId) return
    
    try {
      // If this is the user's own profile, get pending counts
      const memberIsOwnProfile = (member as any).userId === currentUserId || 
        (userFamilyMemberId && member.id === userFamilyMemberId)
      if (memberIsOwnProfile) {
        const [approvalsRes, tagsRes] = await Promise.all([
          fetch("/api/content-approvals"),
          fetch(`/api/content-tags?taggedMemberId=${member.id}&status=PENDING`)
        ])
        
        const approvalsData = await approvalsRes.json()
        const tagsData = await tagsRes.json()
        
        if (approvalsData.success) {
          setPendingApprovalsCount(approvalsData.data.approvals?.length || 0)
        }
        if (tagsData.success) {
          setPendingTagsCount(tagsData.data.tags?.length || 0)
        }
      }
    } catch (error) {
      console.error("Error fetching pending counts:", error)
    }
  }

  const handleSendInvitation = async () => {
    if (!member || isOwnProfile || !invitationEmail || !invitationEmail.includes("@")) {
      if (isOwnProfile) {
        console.warn("Cannot send invitation to own profile")
        return
      }
      alert("Please enter a valid email address")
      return
    }

    setIsSendingInvitation(true)
    try {
      const response = await fetch(`/api/family-members/${member.id}/invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: invitationEmail }),
      })

      const result = await response.json()
      if (result.success) {
        // Refresh invitation status to get the latest data
        await fetchInvitationStatus()
        alert("Invitation sent successfully!")
        onUpdate()
      } else {
        alert(result.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      alert("Failed to send invitation")
    } finally {
      setIsSendingInvitation(false)
    }
  }

  const fetchMedia = async () => {
    if (!member) return
    
    try {
      setLoading(true)
      const [audioRes, docsRes, photosRes] = await Promise.all([
        fetch(`/api/audio?familyMemberId=${member.id}`),
        fetch(`/api/documents?familyMemberId=${member.id}`),
        fetch(`/api/photos?familyMemberId=${member.id}`)
      ])
      
      const audioData = await audioRes.json()
      const docsData = await docsRes.json()
      const photosData = await photosRes.json()
      
      if (audioData.success) setAudioFiles(audioData.data)
      if (docsData.success) setDocuments(docsData.data)
      if (photosData.success) setPhotos(photosData.data.filter((p: any) => !p.isProfile))
    } catch (error) {
      console.error("Error fetching media:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !member) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("familyMemberId", member.id)

    try {
      const response = await fetch("/api/audio", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()
      if (result.success) {
        await fetchMedia()
      }
    } catch (error) {
      console.error("Error uploading audio:", error)
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !member) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("familyMemberId", member.id)
    formData.append("title", file.name)

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()
      if (result.success) {
        await fetchMedia()
      }
    } catch (error) {
      console.error("Error uploading document:", error)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !member) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("familyMemberId", member.id)
    formData.append("isProfile", "false")

    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()
      if (result.success) {
        await fetchMedia()
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
    }
  }

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileToCrop(file)
      setIsCropperOpen(true)
    }
  }

  const handleProfileCropComplete = async (croppedFile: File) => {
    if (!member) return

    try {
      // First, remove existing profile photos
      const existingProfilePhotos = member.photos?.filter(p => p.isProfile) || []
      console.log("Removing profile photos for member:", member.id)
      for (const photo of existingProfilePhotos) {
        await fetch(`/api/photos/${photo.id}`, { method: "DELETE" })
      }
      console.log("Profile photos removed")

      // Upload new profile photo
      const formData = new FormData()
      formData.append("file", croppedFile)
      formData.append("familyMemberId", member.id)
      formData.append("isProfile", "true")

      console.log("Uploading photo for member:", member.id)
      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      })
      
      const result = await response.json()
      console.log("Photo upload result:", result)
      if (result.success) {
        // Force a refresh of the family members data
        onUpdate()
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error)
    }
  }

  const handleDeleteAudio = async (id: string) => {
    if (!confirm("Are you sure you want to delete this audio file?")) return
    try {
      await fetch(`/api/audio/${id}`, { method: "DELETE" })
      await fetchMedia()
    } catch (error) {
      console.error("Error deleting audio:", error)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return
    try {
      await fetch(`/api/documents/${id}`, { method: "DELETE" })
      await fetchMedia()
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return
    try {
      await fetch(`/api/photos/${id}`, { method: "DELETE" })
      await fetchMedia()
    } catch (error) {
      console.error("Error deleting photo:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  if (!member) return null

  const profilePhoto = member.photos?.find(p => p.isProfile)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-white border-gray-200">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {profilePhoto && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  <img src={profilePhoto.filePath} alt={member.firstName} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <DialogTitle className="text-2xl font-light text-gray-900">
                    {member.firstName} {member.lastName}
                  </DialogTitle>
                  {/* Status Badges */}
                  {!(member as any).isClaimed && invitationStatus === "PENDING" && invitationEmail && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Invite
                    </Badge>
                  )}
                  {pendingApprovalsCount > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending Review ({pendingApprovalsCount})
                    </Badge>
                  )}
                  {pendingTagsCount > 0 && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Tag className="h-3 w-3 mr-1" />
                      Tagged ({pendingTagsCount})
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Full Profile</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className={`grid w-full ${isOwnProfile ? 'grid-cols-6' : 'grid-cols-4'} bg-gray-100 h-auto p-1 gap-1`}>
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            {member && (canEdit || isOwnProfile) && (
              <TabsTrigger value="biography" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-50 data-[state=active]:to-emerald-50 data-[state=active]:text-green-700 data-[state=active]:border data-[state=active]:border-green-200 font-semibold">
                <Sparkles className="h-4 w-4 mr-2" />
                Sage AI
              </TabsTrigger>
            )}
            <TabsTrigger value="audio" className="data-[state=active]:bg-white">
              <Mic className="h-4 w-4 mr-2" />
              Audio ({audioFiles.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-white">
              <Video className="h-4 w-4 mr-2" />
              Videos ({documents.filter(d => d.mimeType?.startsWith('video')).length})
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-white">
              <Image className="h-4 w-4 mr-2" />
              Photos ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="relationships" className="data-[state=active]:bg-white">
              <Users className="h-4 w-4 mr-2" />
              Relations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Edit Button - Show at top if can edit */}
            {member && (canEdit || isOwnProfile) && !isEditing && (
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={() => {
                    initializeEditForm()
                    setIsEditing(true)
                  }}
                  className="bg-[#819171] text-white hover:bg-[#6e7a5d]"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}

            {/* Profile Photo Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  {profilePhoto && (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
                      <img src={profilePhoto.filePath} alt={member.firstName} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <Button
                      size="sm"
                      onClick={() => document.getElementById('profile-photo-upload')?.click()}
                      className="bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {profilePhoto ? "Change Photo" : "Upload Photo"}
                    </Button>
                    <input
                      id="profile-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isEditing ? (
              // View Mode
              <>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Full Name</Label>
                      <p className="font-medium">{member.firstName} {member.middleName || ""} {member.lastName} {member.suffix || ""}</p>
                    </div>
                    {member.maidenName && (
                      <div>
                        <Label className="text-sm text-gray-500">Maiden Name</Label>
                        <p className="font-medium">{member.maidenName}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm text-gray-500">Birth Date</Label>
                      <p className="font-medium">{member.birthDate ? new Date(member.birthDate).toLocaleDateString() : "N/A"}</p>
                    </div>
                    {!member.isAlive && (
                      <div>
                        <Label className="text-sm text-gray-500">Death Date</Label>
                        <p className="font-medium">{member.deathDate ? new Date(member.deathDate).toLocaleDateString() : "N/A"}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm text-gray-500">Status</Label>
                      <p className="font-medium">{member.isAlive ? "Living" : "Deceased"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Birth Place</Label>
                      <p className="font-medium">
                        {[member.birthCity, member.birthState, member.birthCountry].filter(Boolean).join(", ") || "N/A"}
                      </p>
                    </div>
                    {!member.isAlive && (
                      <div>
                        <Label className="text-sm text-gray-500">Death Place</Label>
                        <p className="font-medium">
                          {[member.deathCity, member.deathState, member.deathCountry].filter(Boolean).join(", ") || "N/A"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Invitation Section - Only show if not own profile */}
              {!isOwnProfile && (
                <Card className="col-span-2 border-2 border-[#819171]/20 bg-gradient-to-br from-[#819171]/5 to-white">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-[#819171]" />
                      <CardTitle className="text-lg">Invite {member.firstName} to Join</CardTitle>
                    </div>
                    <CardDescription>
                      Send an invitation so they can claim their profile, approve relationships, and add their own stories and photos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {invitationStatus ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                        {invitationStatus === "PENDING" && (
                          <>
                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">Invitation Sent</p>
                              <p className="text-sm text-gray-600">
                                An invitation was sent to <span className="font-semibold text-gray-900">{invitationEmail}</span>. They can accept it to claim their profile.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleSendInvitation}
                              disabled={isSendingInvitation}
                              className="border-[#819171] text-[#819171] hover:bg-[#819171] hover:text-white"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Resend
                            </Button>
                          </>
                        )}
                        {invitationStatus === "ACCEPTED" && (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">Profile Claimed</p>
                              <p className="text-sm text-gray-600">
                                {member.firstName} has claimed their profile and can now manage it.
                              </p>
                            </div>
                          </>
                        )}
                        {(invitationStatus === "DECLINED" || invitationStatus === "EXPIRED") && (
                          <>
                            <X className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {invitationStatus === "DECLINED" ? "Invitation Declined" : "Invitation Expired"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {invitationEmail && (
                                  <>The invitation sent to <span className="font-semibold">{invitationEmail}</span> was {invitationStatus === "DECLINED" ? "declined" : "expired"}. </>
                                )}
                                You can send a new invitation with an updated email address.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={handleSendInvitation}
                              disabled={isSendingInvitation}
                              className="bg-[#819171] text-white hover:bg-[#6e7a5d]"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send New Invite
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="invitation-email" className="text-sm font-medium text-gray-700">
                            Email Address
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="invitation-email"
                              type="email"
                              placeholder="family.member@example.com"
                              value={invitationEmail}
                              onChange={(e) => setInvitationEmail(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleSendInvitation}
                              disabled={isSendingInvitation || !invitationEmail || !invitationEmail.includes("@")}
                              className="bg-[#819171] text-white hover:bg-[#6e7a5d] px-6"
                            >
                              {isSendingInvitation ? (
                                <>
                                  <span className="animate-spin mr-2">⏳</span>
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Invitation
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 flex items-start gap-2">
                          <Info className="h-4 w-4 text-[#819171] mt-0.5 flex-shrink-0" />
                          <span>
                            When they accept, {member.firstName} will be able to verify relationships, add their own stories, photos, and complete their profile information.
                          </span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {member.bio && (
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Biography</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{member.bio}</p>
                  </CardContent>
                </Card>
              )}

              {member.notes && (
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{member.notes}</p>
                  </CardContent>
                </Card>
              )}
              </>
            ) : (
              // Edit Mode
              <form onSubmit={async (e) => {
                e.preventDefault()
                if (!member || isSaving) return
                
                setIsSaving(true)
                try {
                  const response = await fetch(`/api/family-members/${member.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editFormData),
                  })
                  
                  const result = await response.json()
                  if (result.success) {
                    setIsEditing(false)
                    onUpdate()
                  } else {
                    alert(result.error || "Failed to update profile")
                  }
                } catch (error) {
                  console.error("Error updating profile:", error)
                  alert("Failed to update profile")
                } finally {
                  setIsSaving(false)
                }
              }} className="space-y-6">
                {/* Personal Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-firstName">First Name *</Label>
                        <Input
                          id="edit-firstName"
                          value={editFormData.firstName}
                          onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-middleName">Middle Name</Label>
                        <Input
                          id="edit-middleName"
                          value={editFormData.middleName}
                          onChange={(e) => setEditFormData({ ...editFormData, middleName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-lastName">Last Name *</Label>
                        <Input
                          id="edit-lastName"
                          value={editFormData.lastName}
                          onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-suffix">Suffix</Label>
                        <Input
                          id="edit-suffix"
                          value={editFormData.suffix || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, suffix: e.target.value })}
                          placeholder="Jr., Sr., III, etc."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-maidenName">Maiden Name</Label>
                      <Input
                        id="edit-maidenName"
                        value={editFormData.maidenName}
                        onChange={(e) => setEditFormData({ ...editFormData, maidenName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-birthDate">Birth Date</Label>
                      <Input
                        id="edit-birthDate"
                        type="date"
                        value={editFormData.birthDate}
                        onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-isAlive"
                        checked={editFormData.isAlive}
                        onChange={(e) => setEditFormData({ ...editFormData, isAlive: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="edit-isAlive">This person is alive</Label>
                    </div>

                    {!editFormData.isAlive && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-deathDate">Death Date</Label>
                        <Input
                          id="edit-deathDate"
                          type="date"
                          value={editFormData.deathDate}
                          onChange={(e) => setEditFormData({ ...editFormData, deathDate: e.target.value })}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Location Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Birth Place</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-birthCity" className="text-xs text-gray-500">City</Label>
                          <Input
                            id="edit-birthCity"
                            value={editFormData.birthCity}
                            onChange={(e) => setEditFormData({ ...editFormData, birthCity: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-birthState" className="text-xs text-gray-500">State/Province</Label>
                          <Input
                            id="edit-birthState"
                            value={editFormData.birthState}
                            onChange={(e) => setEditFormData({ ...editFormData, birthState: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-birthCountry" className="text-xs text-gray-500">Country</Label>
                          <Input
                            id="edit-birthCountry"
                            value={editFormData.birthCountry}
                            onChange={(e) => setEditFormData({ ...editFormData, birthCountry: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {!editFormData.isAlive && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Death Place</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-deathCity" className="text-xs text-gray-500">City</Label>
                            <Input
                              id="edit-deathCity"
                              value={editFormData.deathCity}
                              onChange={(e) => setEditFormData({ ...editFormData, deathCity: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-deathState" className="text-xs text-gray-500">State/Province</Label>
                            <Input
                              id="edit-deathState"
                              value={editFormData.deathState}
                              onChange={(e) => setEditFormData({ ...editFormData, deathState: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-deathCountry" className="text-xs text-gray-500">Country</Label>
                            <Input
                              id="edit-deathCountry"
                              value={editFormData.deathCountry}
                              onChange={(e) => setEditFormData({ ...editFormData, deathCountry: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      initializeEditForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#819171] text-white hover:bg-[#6e7a5d]"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>

          <TabsContent value="audio" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Audio Files</CardTitle>
                  <CardDescription>Record memories, stories, and oral histories</CardDescription>
                </div>
                {isOwnProfile && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => document.getElementById('audio-upload')?.click()}
                      className="bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Audio
                    </Button>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleAudioUpload}
                    />
                  </>
                )}
              </CardHeader>
              <CardContent>
                {audioFiles.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No audio files yet</p>
                    <p className="text-sm text-gray-400">Upload audio files to preserve oral histories</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {audioFiles.map((audio) => (
                      <div key={audio.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Play className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{audio.originalName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(audio.fileSize)}</p>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteAudio(audio.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <audio controls className="w-full mt-2">
                          <source src={audio.filePath} />
                        </audio>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Videos & Documents</CardTitle>
                  <CardDescription>Upload videos and documents</CardDescription>
                </div>
                {isOwnProfile && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => document.getElementById('document-upload')?.click()}
                      className="bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    <input
                      id="document-upload"
                      type="file"
                      className="hidden"
                      onChange={handleDocumentUpload}
                      multiple
                    />
                  </>
                )}
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No files yet</p>
                    <p className="text-sm text-gray-400">Upload videos and documents</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {doc.mimeType?.startsWith('video') ? (
                              <Video className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FileText className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{doc.title || doc.originalName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {doc.mimeType?.startsWith('video') && (
                          <video controls className="w-full mt-3 rounded">
                            <source src={doc.filePath} />
                          </video>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Photo Gallery</CardTitle>
                  <CardDescription>Upload and manage photos</CardDescription>
                </div>
                {isOwnProfile && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      className="bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </>
                )}
              </CardHeader>
              <CardContent>
                {photos.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <Image className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No photos yet</p>
                    <p className="text-sm text-gray-400">Upload photos to preserve memories</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="group relative">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={photo.filePath} 
                            alt={photo.caption || photo.originalName}
                            className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setTaggingContentType("photo")
                              setTaggingContentId(photo.id)
                              setTagDialogOpen(true)
                            }}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            <Tag className="h-4 w-4 mr-2" />
                            Tag People
                          </Button>
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                            {photo.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Old edit tab removed - editing is now in overview tab */}

          {member && (canEdit || isOwnProfile) && (
            <>
              <TabsContent value="biography" className="mt-6">
                <AIBiographerSection member={member} />
              </TabsContent>
            </>
          )}

          <TabsContent value="relationships" className="mt-6">
            <RelationshipManagement
              familyMemberId={member.id}
              familyMemberName={`${member.firstName} ${member.lastName}`}
              onRelationshipAdded={onUpdate}
            />
          </TabsContent>
        </Tabs>

        {/* Image Cropper Dialog for Profile Photo */}
        <ImageCropperDialog
          open={isCropperOpen}
          onOpenChange={setIsCropperOpen}
          imageFile={fileToCrop}
          aspectRatio={1}
          onCropComplete={handleProfileCropComplete}
        />

        <TagPeopleDialog
          open={tagDialogOpen}
          onOpenChange={setTagDialogOpen}
          contentType={taggingContentType}
          contentId={taggingContentId}
          onTagged={() => {
            fetchPendingCounts()
            fetchMedia()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
