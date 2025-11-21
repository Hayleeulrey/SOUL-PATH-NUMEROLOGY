"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Users, Edit, Trash2, Calendar, MapPin, Search, Filter, ChevronDown, ChevronUp, UserCircle, Sparkles, Mail, X, CheckCircle, AlertCircle, Info, Clock, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { FamilyMemberWithRelations } from "@/lib/lineage-types"
import { RelationshipManagement } from "./relationship-management"
import { FullProfileDialog } from "./full-profile-dialog"
import { ImageCropperDialog } from "@/components/ui/image-cropper-dialog"
import { FloatingProfileBubble } from "@/components/lineage/floating-profile-bubble"

export function FamilyMemberManagement() {
  const { userId: currentUserId } = useAuth()
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberWithRelations[]>([])
  const [userFamilyMemberId, setUserFamilyMemberId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMemberWithRelations | null>(null)
  const [isAddRelatedDialogOpen, setIsAddRelatedDialogOpen] = useState(false)
  const [addRelatedContext, setAddRelatedContext] = useState<{
    memberIndex: number
    relationshipType: 'parents' | 'siblings' | 'spouse' | 'children'
  } | null>(null)
  const [newRelatedMember, setNewRelatedMember] = useState({
    firstName: "",
    lastName: "",
    maidenName: "",
    suffix: "",
    birthDate: "",
    birthCity: "",
    birthState: "",
    birthCountry: "",
    email: "",
  })
  const [viewingRelationships, setViewingRelationships] = useState<string | null>(null)
  const [viewingFullProfile, setViewingFullProfile] = useState<FamilyMemberWithRelations | null>(null)
  const [initialTab, setInitialTab] = useState<string>("overview")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [existingPhotoPath, setExistingPhotoPath] = useState<string | null>(null)
  const [removeProfilePhoto, setRemoveProfilePhoto] = useState(false)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [fileToCrop, setFileToCrop] = useState<File | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "living" | "deceased">("all")
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [filterBirthYearMin, setFilterBirthYearMin] = useState("")
  const [filterBirthYearMax, setFilterBirthYearMax] = useState("")
  const [filterBirthCity, setFilterBirthCity] = useState("")
  const [filterBirthState, setFilterBirthState] = useState("")
  const [filterBirthCountry, setFilterBirthCountry] = useState("")
  
  // Post-submission dialog state
  const [isPostSubmissionDialogOpen, setIsPostSubmissionDialogOpen] = useState(false)
  const [submittedMembers, setSubmittedMembers] = useState<Array<{
    member: any
    missingFields: string[]
    hasEmail: boolean
    invitationStatus?: string
  }>>([])
  
  // Search state for relationship builder dropdowns
  const [relationshipSearchQueries, setRelationshipSearchQueries] = useState<Record<string, Record<string, string>>>({})
  
  // Store scroll position to prevent jump when dialog closes
  const scrollPositionRef = useRef<number>(0)
  
  // Helper to filter members by search query for relationship builder
  const filterMembersForRelationship = (members: FamilyMemberWithRelations[], searchQuery: string, excludeIds: string[] = []) => {
    if (!searchQuery.trim()) {
      return members.filter(m => !excludeIds.includes(m.id))
    }
    const query = searchQuery.toLowerCase()
    return members.filter(m => 
      !excludeIds.includes(m.id) &&
      (m.firstName.toLowerCase().includes(query) ||
       m.lastName.toLowerCase().includes(query) ||
       m.maidenName?.toLowerCase().includes(query) ||
       `${m.firstName} ${m.lastName}`.toLowerCase().includes(query))
    )
  }
  
  // Helper to format birth year
  const getBirthYear = (birthDate: Date | string | null | undefined): string => {
    if (!birthDate) return ""
    const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    if (isNaN(date.getTime())) return ""
    return date.getFullYear().toString()
  }
  
  // Helper to get profile photo
  const getProfilePhoto = (member: FamilyMemberWithRelations): string | null => {
    if (!member.photos || member.photos.length === 0) return null
    const profilePhoto = member.photos.find(p => p.isProfile)
    return profilePhoto ? profilePhoto.filePath : null
  }
  
  // Helper to get search query for a specific member and relationship type
  const getRelationshipSearchQuery = (memberIndex: number, relationshipType: string) => {
    return relationshipSearchQueries[memberIndex]?.[relationshipType] || ""
  }
  
  // Helper to set search query for a specific member and relationship type
  const setRelationshipSearchQuery = (memberIndex: number, relationshipType: string, value: string) => {
    setRelationshipSearchQueries(prev => ({
      ...prev,
      [memberIndex]: {
        ...prev[memberIndex],
        [relationshipType]: value
      }
    }))
  }

  // Form state - support for multiple members (like onboarding)
  // Extended to include relationships
  interface RelationshipItem {
    id?: string // existing member ID
    newMember?: {
      firstName: string
      lastName: string
      maidenName?: string
      suffix?: string
      birthDate?: string
      birthCity?: string
      birthState?: string
      birthCountry?: string
      email?: string
    } // new member to create
  }

  interface MemberFormData {
    firstName: string
    lastName: string
    maidenName: string
    suffix: string
    relationshipType: string
    birthDate: string
    birthCity: string
    birthState: string
    birthCountry: string
    email: string
    parents: RelationshipItem[]
    siblings: RelationshipItem[]
    spouse: RelationshipItem | null
    children: RelationshipItem[]
  }

  const [members, setMembers] = useState<MemberFormData[]>([
    { 
      firstName: "", 
      lastName: "", 
      maidenName: "", 
      suffix: "", 
      relationshipType: "", 
      birthDate: "", 
      birthCity: "",
      birthState: "",
      birthCountry: "",
      email: "",
      parents: [],
      siblings: [],
      spouse: null,
      children: []
    }
  ])
  
  // Legacy form state for editing
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    maidenName: "",
    birthDate: "",
    deathDate: "",
    birthCity: "",
    birthState: "",
    birthCountry: "",
    deathCity: "",
    deathState: "",
    deathCountry: "",
    email: "",
    isAlive: true,
  })

  useEffect(() => {
    setMounted(true)
    // Only fetch if we have a user ID (authentication is ready)
    if (currentUserId) {
      fetchUserProfile()
      fetchFamilyMembers()
    }
  }, [currentUserId])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user-profile")
      const result = await response.json()
      if (result.success && result.data?.familyMemberId) {
        setUserFamilyMemberId(result.data.familyMemberId)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  // Capture and restore scroll position when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      // Capture scroll position when dialog opens
      scrollPositionRef.current = window.scrollY
    } else if (scrollPositionRef.current > 0) {
      // Restore scroll position when dialog closes
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current)
      })
    }
  }, [isDialogOpen])

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true)
      console.log("Fetching family members...")
      const response = await fetch("/api/family-members")
      console.log("Response status:", response.status, response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API response not OK:", response.status, errorText)
        setError(`Failed to fetch family members: ${response.status}`)
        return
      }
      
      const result = await response.json()
      console.log("API result:", result)
      console.log("Family members count:", result.data?.length || 0)
      
      if (result.success) {
        const members = result.data || []
        console.log("Setting family members:", members.length)
        setFamilyMembers(members)
      } else {
        const errorMessage = result.error || result.message || "Failed to fetch family members"
        console.error("API error:", errorMessage, result)
        setError(errorMessage)
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Failed to fetch family members")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingMember 
        ? `/api/family-members/${editingMember.id}`
        : "/api/family-members"
      
      const method = editingMember ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        const memberId = editingMember ? editingMember.id : result.data.id
        
        // Handle photo updates
        if (editingMember) {
          // If removing photo (no new file selected)
          if (removeProfilePhoto && !selectedFile) {
            await removeProfilePhotoFromMember(memberId)
          }
          // If changing photo (new file selected)
          else if (selectedFile || (existingPhotoPath && selectedFile)) {
            // First remove old profile photos, then upload new one
            await removeProfilePhotoFromMember(memberId)
            if (selectedFile) {
              await uploadProfilePhoto(memberId)
            }
          }
        } else if (selectedFile) {
          // New member with photo
          await uploadProfilePhoto(memberId)
        }
        
        // Handle invitation if email is provided
        if (formData.email && formData.email.includes("@")) {
          try {
            const invResponse = await fetch(`/api/family-members/${memberId}/invitation`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: formData.email }),
            })
            const invResult = await invResponse.json()
            if (invResult.success) {
              console.log("Invitation sent successfully")
            }
          } catch (error) {
            console.error("Error sending invitation:", error)
            // Don't fail the entire update if invitation fails
          }
        }
        
        await fetchFamilyMembers()
        resetForm()
        setIsDialogOpen(false)
        setSelectedFile(null)
        setProfilePhotoUrl(null)
      } else {
        setError(result.error || "Failed to save family member")
      }
    } catch (err) {
      setError("Failed to save family member")
    }
  }

  const removeProfilePhotoFromMember = async (memberId: string) => {
    try {
      console.log("Removing profile photos for member:", memberId)
      const response = await fetch(`/api/photos?familyMemberId=${memberId}`)
      const result = await response.json()
      
      if (result.success) {
        const profilePhotos = result.data.filter((photo: any) => photo.isProfile)
        for (const photo of profilePhotos) {
          await fetch(`/api/photos/${photo.id}`, {
            method: "DELETE",
          })
        }
        console.log("Profile photos removed")
      }
    } catch (err) {
      console.error("Error removing photos:", err)
    }
  }

  const uploadProfilePhoto = async (memberId: string) => {
    if (!selectedFile) return

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("familyMemberId", memberId)
      formData.append("isProfile", "true")

      console.log("Uploading photo for member:", memberId)

      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("Photo upload result:", result)
      
      if (!result.success) {
        console.error("Failed to upload photo:", result.error)
      }
    } catch (err) {
      console.error("Error uploading photo:", err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileToCrop(file)
      setIsCropperOpen(true)
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    setSelectedFile(croppedFile)
    const url = URL.createObjectURL(croppedFile)
    setProfilePhotoUrl(url)
  }

  const handleEdit = async (member: FamilyMemberWithRelations) => {
    setEditingMember(member)
    
    // Fetch invitation email if exists
    let invitationEmail = ""
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
    
    setFormData({
      firstName: member.firstName,
      middleName: member.middleName || "",
      lastName: member.lastName,
      maidenName: member.maidenName || "",
      birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : "",
      deathDate: member.deathDate ? new Date(member.deathDate).toISOString().split('T')[0] : "",
      birthCity: (member as any).birthCity || "",
      birthState: (member as any).birthState || "",
      birthCountry: (member as any).birthCountry || "",
      deathCity: (member as any).deathCity || "",
      deathState: (member as any).deathState || "",
      deathCountry: (member as any).deathCountry || "",
      email: invitationEmail,
      isAlive: member.isAlive,
    })
    
    // Load existing profile photo if available
    const profilePhoto = member.photos?.find(p => p.isProfile)
    if (profilePhoto) {
      setExistingPhotoPath(profilePhoto.filePath)
    } else {
      setExistingPhotoPath(null)
    }
    
    // Reset photo-related states
    setSelectedFile(null)
    setProfilePhotoUrl(null)
    setRemoveProfilePhoto(false)
    
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this family member?")) return
    
    try {
      console.log("Attempting to delete family member:", id)
      const response = await fetch(`/api/family-members/${id}`, {
        method: "DELETE",
      })
      
      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)
      
      // Check if response has content
      const text = await response.text()
      console.log("Response text:", text)
      
      let result
      try {
        result = JSON.parse(text)
        console.log("Delete response:", JSON.stringify(result, null, 2))
      } catch (e) {
        console.error("Failed to parse JSON:", e, "Text was:", text)
        setError("Failed to parse server response")
        return
      }
      
      if (result.success) {
        console.log("Deletion successful, refreshing family members")
        await fetchFamilyMembers()
        // Force a re-render by updating the state
        setFamilyMembers(prev => prev.filter(m => m.id !== id))
      } else {
        console.error("Deletion failed - success:", result.success)
        console.error("Deletion failed - error:", result.error)
        console.error("Deletion failed - result:", result)
        setError(result.error || result.message || "Failed to delete family member")
      }
    } catch (err) {
      console.error("Error deleting family member:", err)
      setError("Failed to delete family member")
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      maidenName: "",
      birthDate: "",
      deathDate: "",
      birthCity: "",
      birthState: "",
      birthCountry: "",
      deathCity: "",
      deathState: "",
      deathCountry: "",
      email: "",
      isAlive: true,
    })
    setEditingMember(null)
    setSelectedFile(null)
    setProfilePhotoUrl(null)
    setExistingPhotoPath(null)
    setRemoveProfilePhoto(false)
  }

  const addMember = () => {
    setMembers([...members, { 
      firstName: "", 
      lastName: "", 
      maidenName: "", 
      suffix: "", 
      relationshipType: "", 
      birthDate: "", 
      birthCity: "",
      birthState: "",
      birthCountry: "",
      email: "",
      parents: [],
      siblings: [],
      spouse: null,
      children: []
    }])
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, field: string, value: any) => {
    const updated = [...members]
    updated[index] = { ...updated[index], [field]: value }
    setMembers(updated)
  }

  // Relationship management functions
  const addRelationship = (memberIndex: number, relationshipType: 'parents' | 'siblings' | 'spouse' | 'children', item: RelationshipItem) => {
    const updated = [...members]
    const member = updated[memberIndex]
    
    if (relationshipType === 'spouse') {
      member.spouse = item
    } else {
      member[relationshipType] = [...member[relationshipType], item]
    }
    
    setMembers(updated)
  }

  const removeRelationship = (memberIndex: number, relationshipType: 'parents' | 'siblings' | 'spouse' | 'children', itemIndex: number) => {
    const updated = [...members]
    const member = updated[memberIndex]
    
    if (relationshipType === 'spouse') {
      member.spouse = null
    } else {
      member[relationshipType] = member[relationshipType].filter((_, i) => i !== itemIndex)
    }
    
    setMembers(updated)
  }

  const addExistingRelationship = (memberIndex: number, relationshipType: 'parents' | 'siblings' | 'spouse' | 'children', memberId: string) => {
    if (!memberId) return
    addRelationship(memberIndex, relationshipType, { id: memberId })
  }

  const addNewRelationship = (memberIndex: number, relationshipType: 'parents' | 'siblings' | 'spouse' | 'children', newMemberData: { firstName: string; lastName: string; maidenName?: string; suffix?: string; birthDate?: string; birthCity?: string; birthState?: string; birthCountry?: string; email?: string }) => {
    addRelationship(memberIndex, relationshipType, { newMember: newMemberData })
  }

  const openAddRelatedDialog = (memberIndex: number, relationshipType: 'parents' | 'siblings' | 'spouse' | 'children') => {
    setAddRelatedContext({ memberIndex, relationshipType })
    setNewRelatedMember({
      firstName: "",
      lastName: "",
      maidenName: "",
      suffix: "",
      birthDate: "",
      birthCity: "",
      birthState: "",
      birthCountry: "",
      email: "",
    })
    setIsAddRelatedDialogOpen(true)
  }

  const handleAddRelatedSubmit = () => {
    if (!addRelatedContext || !newRelatedMember.firstName || !newRelatedMember.lastName) {
      return
    }

    addNewRelationship(
      addRelatedContext.memberIndex,
      addRelatedContext.relationshipType,
      {
        firstName: newRelatedMember.firstName,
        lastName: newRelatedMember.lastName,
        maidenName: newRelatedMember.maidenName || undefined,
        suffix: newRelatedMember.suffix || undefined,
        birthDate: newRelatedMember.birthDate || undefined,
        birthCity: newRelatedMember.birthCity || undefined,
        birthState: newRelatedMember.birthState || undefined,
        birthCountry: newRelatedMember.birthCountry || undefined,
        email: newRelatedMember.email || undefined,
      }
    )

    setIsAddRelatedDialogOpen(false)
    setAddRelatedContext(null)
    setNewRelatedMember({
      firstName: "",
      lastName: "",
      maidenName: "",
      suffix: "",
      birthDate: "",
      birthCity: "",
      birthState: "",
      birthCountry: "",
      email: "",
    })
  }

  const handleAddNew = () => {
    resetForm()
    setMembers([{ 
      firstName: "", 
      lastName: "", 
      maidenName: "", 
      suffix: "", 
      relationshipType: "", 
      birthDate: "", 
      birthCity: "",
      birthState: "",
      birthCountry: "",
      email: "",
      parents: [],
      siblings: [],
      spouse: null,
      children: []
    }])
    setIsDialogOpen(true)
  }
  
  const relationshipTypes = [
    { value: "PARENT", label: "Parent" },
    { value: "SIBLING", label: "Sibling" },
    { value: "SPOUSE", label: "Spouse" },
    { value: "CHILD", label: "Child" },
    { value: "GRANDPARENT", label: "Grandparent" },
  ]

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const handleViewRelationships = (memberId: string) => {
    setViewingRelationships(memberId)
  }

  const handleCloseRelationships = () => {
    setViewingRelationships(null)
  }

  const handleViewFullProfile = (member: FamilyMemberWithRelations, tab: string = "overview") => {
    // Always default to "overview" tab
    setInitialTab(tab)
    setViewingFullProfile(member)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown"
    return new Date(date).toLocaleDateString()
  }

  // Helper to get relationship type for a member (for display on card)
  const getMemberRelationshipType = (member: FamilyMemberWithRelations): string | null => {
    if (!userFamilyMemberId) return null
    
    // Check relationships where member is personId and user is relatedId
    const relationshipAsPerson = member.relationshipsAsPerson?.find(
      r => r.relatedId === userFamilyMemberId
    )
    
    // Check relationships where user is personId and member is relatedId
    const relationshipAsRelated = member.relationshipsAsRelated?.find(
      r => r.personId === userFamilyMemberId
    )

    let relationshipType: string | null = null
    
    if (relationshipAsPerson) {
      const type = relationshipAsPerson.relationshipType
      if (type === 'PARENT') relationshipType = 'PARENT'
      else if (type === 'CHILD') relationshipType = 'CHILD'
      else if (type === 'GRANDPARENT') relationshipType = 'GRANDPARENT'
      else if (type === 'GRANDCHILD') relationshipType = 'GRANDCHILD'
      else if (type === 'UNCLE_AUNT') relationshipType = 'UNCLE_AUNT'
      else if (type === 'NEPHEW_NIECE') relationshipType = 'NEPHEW_NIECE'
      else if (type === 'STEP_PARENT') relationshipType = 'STEP_PARENT'
      else if (type === 'STEP_CHILD') relationshipType = 'STEP_CHILD'
      else if (type === 'ADOPTED_PARENT') relationshipType = 'ADOPTED_PARENT'
      else if (type === 'ADOPTED_CHILD') relationshipType = 'ADOPTED_CHILD'
      else relationshipType = type
    } else if (relationshipAsRelated) {
      const type = relationshipAsRelated.relationshipType
      if (type === 'PARENT') relationshipType = 'CHILD'
      else if (type === 'CHILD') relationshipType = 'PARENT'
      else if (type === 'GRANDPARENT') relationshipType = 'GRANDCHILD'
      else if (type === 'GRANDCHILD') relationshipType = 'GRANDPARENT'
      else if (type === 'UNCLE_AUNT') relationshipType = 'NEPHEW_NIECE'
      else if (type === 'NEPHEW_NIECE') relationshipType = 'UNCLE_AUNT'
      else if (type === 'STEP_PARENT') relationshipType = 'STEP_CHILD'
      else if (type === 'STEP_CHILD') relationshipType = 'STEP_PARENT'
      else if (type === 'ADOPTED_PARENT') relationshipType = 'ADOPTED_CHILD'
      else if (type === 'ADOPTED_CHILD') relationshipType = 'ADOPTED_PARENT'
      else relationshipType = type
    }
    
    return relationshipType
  }

  // Group family members by relationship type to user
  const groupMembersByRelationship = () => {
    if (!userFamilyMemberId || familyMembers.length === 0) {
      return { myProfile: null, grouped: {}, ungrouped: familyMembers }
    }

    const myProfile = familyMembers.find(m => m.id === userFamilyMemberId) || null
    const others = familyMembers.filter(m => m.id !== userFamilyMemberId)

    // Group by relationship type
    const grouped: Record<string, FamilyMemberWithRelations[]> = {
      PARENT: [],
      SIBLING: [],
      CHILD: [],
      SPOUSE: [],
      GRANDPARENT: [],
      GRANDCHILD: [],
      UNCLE_AUNT: [],
      NEPHEW_NIECE: [],
      COUSIN: [],
      STEP_PARENT: [],
      STEP_CHILD: [],
      HALF_SIBLING: [],
      ADOPTED_PARENT: [],
      ADOPTED_CHILD: [],
      IN_LAW: [],
      OTHER: []
    }

    const ungrouped: FamilyMemberWithRelations[] = []

    others.forEach(member => {
      // Check relationships where member is personId and user is relatedId
      // (e.g., member is PARENT, user is CHILD - so member is user's parent)
      const relationshipAsPerson = member.relationshipsAsPerson?.find(
        r => r.relatedId === userFamilyMemberId
      )
      
      // Check relationships where user is personId and member is relatedId
      // (e.g., user is PARENT, member is CHILD - so member is user's child)
      const relationshipAsRelated = member.relationshipsAsRelated?.find(
        r => r.personId === userFamilyMemberId
      )

      // Determine relationship type from user's perspective
      let relationshipType: string | null = null
      
      if (relationshipAsPerson) {
        // Member is personId, user is relatedId
        // Need to invert for display (e.g., if member is PARENT of user, display as "Parent")
        const type = relationshipAsPerson.relationshipType
        if (type === 'PARENT') relationshipType = 'PARENT'
        else if (type === 'CHILD') relationshipType = 'CHILD'
        else if (type === 'GRANDPARENT') relationshipType = 'GRANDPARENT'
        else if (type === 'GRANDCHILD') relationshipType = 'GRANDCHILD'
        else if (type === 'UNCLE_AUNT') relationshipType = 'UNCLE_AUNT'
        else if (type === 'NEPHEW_NIECE') relationshipType = 'NEPHEW_NIECE'
        else if (type === 'STEP_PARENT') relationshipType = 'STEP_PARENT'
        else if (type === 'STEP_CHILD') relationshipType = 'STEP_CHILD'
        else if (type === 'ADOPTED_PARENT') relationshipType = 'ADOPTED_PARENT'
        else if (type === 'ADOPTED_CHILD') relationshipType = 'ADOPTED_CHILD'
        else relationshipType = type // SPOUSE, SIBLING, COUSIN, etc. are symmetric
      } else if (relationshipAsRelated) {
        // User is personId, member is relatedId
        // Need to invert for display (e.g., if user is PARENT of member, display as "Child")
        const type = relationshipAsRelated.relationshipType
        if (type === 'PARENT') relationshipType = 'CHILD'
        else if (type === 'CHILD') relationshipType = 'PARENT'
        else if (type === 'GRANDPARENT') relationshipType = 'GRANDCHILD'
        else if (type === 'GRANDCHILD') relationshipType = 'GRANDPARENT'
        else if (type === 'UNCLE_AUNT') relationshipType = 'NEPHEW_NIECE'
        else if (type === 'NEPHEW_NIECE') relationshipType = 'UNCLE_AUNT'
        else if (type === 'STEP_PARENT') relationshipType = 'STEP_CHILD'
        else if (type === 'STEP_CHILD') relationshipType = 'STEP_PARENT'
        else if (type === 'ADOPTED_PARENT') relationshipType = 'ADOPTED_CHILD'
        else if (type === 'ADOPTED_CHILD') relationshipType = 'ADOPTED_PARENT'
        else relationshipType = type // SPOUSE, SIBLING, COUSIN, etc. are symmetric
      }

      if (relationshipType && grouped[relationshipType]) {
        grouped[relationshipType].push(member)
      } else {
        ungrouped.push(member)
      }
    })

    // Sort each group alphabetically by name
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })
    })

    return { myProfile, grouped, ungrouped }
  }

  // Relationship type labels and order for display
  const relationshipTypeLabels: Record<string, string> = {
    PARENT: "Parents",
    SIBLING: "Siblings",
    CHILD: "Children",
    SPOUSE: "Spouse",
    GRANDPARENT: "Grandparents",
    GRANDCHILD: "Grandchildren",
    UNCLE_AUNT: "Uncles/Aunts",
    NEPHEW_NIECE: "Nephews/Nieces",
    COUSIN: "Cousins",
    STEP_PARENT: "Step Parents",
    STEP_CHILD: "Step Children",
    HALF_SIBLING: "Half Siblings",
    ADOPTED_PARENT: "Adopted Parents",
    ADOPTED_CHILD: "Adopted Children",
    IN_LAW: "In-Laws",
    OTHER: "Others"
  }

  const relationshipTypeOrder = [
    'PARENT',
    'SPOUSE',
    'SIBLING',
    'CHILD',
    'GRANDPARENT',
    'GRANDCHILD',
    'UNCLE_AUNT',
    'NEPHEW_NIECE',
    'COUSIN',
    'STEP_PARENT',
    'STEP_CHILD',
    'HALF_SIBLING',
    'ADOPTED_PARENT',
    'ADOPTED_CHILD',
    'IN_LAW',
    'OTHER'
  ]

  // Filter family members based on search query and status filter
  const filteredMembers = familyMembers.filter((member) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchLower) ||
      member.lastName.toLowerCase().includes(searchLower) ||
      member.middleName?.toLowerCase().includes(searchLower) ||
      member.maidenName?.toLowerCase().includes(searchLower) ||
      member.bio?.toLowerCase().includes(searchLower)
    
    // Status filter
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "living" && member.isAlive) ||
      (filterStatus === "deceased" && !member.isAlive)
    
    // Birth year filter
    let matchesYear = true
    if (filterBirthYearMin || filterBirthYearMax) {
      const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : null
      if (filterBirthYearMin && birthYear) {
        matchesYear = matchesYear && birthYear >= parseInt(filterBirthYearMin)
      }
      if (filterBirthYearMax && birthYear) {
        matchesYear = matchesYear && birthYear <= parseInt(filterBirthYearMax)
      }
    }
    
    // Location filters
    const matchesCity = !filterBirthCity || (member as any).birthCity?.toLowerCase().includes(filterBirthCity.toLowerCase())
    const matchesState = !filterBirthState || (member as any).birthState?.toLowerCase().includes(filterBirthState.toLowerCase())
    const matchesCountry = !filterBirthCountry || (member as any).birthCountry?.toLowerCase().includes(filterBirthCountry.toLowerCase())
    
    return matchesSearch && matchesStatus && matchesYear && matchesCity && matchesState && matchesCountry
  })

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Add Member Button */}
      <div className="flex justify-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-[#819171] text-white hover:bg-[#6e7a5d] px-8 py-3 rounded-xl font-medium shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-2xl">
                {editingMember ? "Edit Family Member" : "Add Family Members"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingMember 
                  ? "Update the family member's information below."
                  : "Add family members directly or invite them to join and claim their profile"
                }
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {!editingMember && (
              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  const createdMembers: Array<{
                    member: any
                    missingFields: string[]
                    hasEmail: boolean
                    invitationStatus?: string
                  }> = []
                  
                  const promises = members.map(async (member, index) => {
                    if (member.firstName && member.lastName && member.relationshipType) {
                      try {
                        // Prepare relationships data
                        const relationships = {
                          parents: member.parents,
                          siblings: member.siblings,
                          spouse: member.spouse,
                          children: member.children
                        }

                        const response = await fetch("/api/family-members", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            firstName: member.firstName,
                            lastName: member.lastName,
                            maidenName: member.maidenName || undefined,
                            suffix: member.suffix || undefined,
                            birthDate: member.birthDate || null,
                            birthCity: member.birthCity || undefined,
                            birthState: member.birthState || undefined,
                            birthCountry: member.birthCountry || undefined,
                            email: member.email || undefined,
                            isAlive: true,
                            relationshipTypeToUser: member.relationshipType, // Create relationship to user
                            relationships: relationships, // Include relationships
                          }),
                        })
                        
                        if (!response.ok) {
                          const errorData = await response.json()
                          console.error('Error creating family member:', errorData)
                          const error = new Error(errorData.error || 'Failed to create family member')
                          ;(error as any).details = errorData.details
                          throw error
                        }
                        
                        const result = await response.json()
                        console.log('Family member created with relationships:', result)
                        
                        // Determine missing fields
                        const missingFields: string[] = []
                        if (!member.birthDate) missingFields.push("Birth Date")
                        if (!member.birthCity && !member.birthState && !member.birthCountry) {
                          missingFields.push("Place of Birth")
                        } else {
                          if (!member.birthCity) missingFields.push("Birth City")
                          if (!member.birthState) missingFields.push("Birth State/Province")
                          if (!member.birthCountry) missingFields.push("Birth Country")
                        }
                        if (!member.email) missingFields.push("Email Address")
                        // Note: Profile photo is handled separately, not in this form
                        
                        createdMembers.push({
                          member: result.data || result,
                          missingFields,
                          hasEmail: !!member.email,
                          invitationStatus: result.invitationStatus || (member.email ? 'PENDING' : undefined)
                        })
                        
                        return result
                      } catch (error) {
                        console.error('Error creating family member:', error)
                        throw error
                      }
                    }
                    return Promise.resolve()
                  })
                  
                  await Promise.all(promises)
                  
                  // Show post-submission dialog if members were created
                  if (createdMembers.length > 0) {
                    setSubmittedMembers(createdMembers)
                    setIsPostSubmissionDialogOpen(true)
                  }
                  
                  // Refresh family members to get updated relationships
                  fetchFamilyMembers()
                  resetForm()
                  setMembers([{ 
                    firstName: "", 
                    lastName: "", 
                    maidenName: "", 
                    suffix: "", 
                    relationshipType: "", 
                    birthDate: "", 
                    birthCity: "",
                    birthState: "",
                    birthCountry: "",
                    email: "",
                    parents: [],
                    siblings: [],
                    spouse: null,
                    children: []
                  }])
                  setIsDialogOpen(false)
                } catch (error: any) {
                  console.error('Error creating family members:', error)
                  const errorMessage = error.message || 'Unknown error'
                  const errorDetails = error.details ? `\n\nDetails: ${JSON.stringify(error.details, null, 2)}` : ''
                  alert(`Failed to create family member: ${errorMessage}${errorDetails}`)
                }
              }} className="space-y-6">
              
              {/* Multi-member form like onboarding */}
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

                  {/* Place of Birth */}
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#819171]" />
                      <Label className="text-sm font-medium">Place of Birth</Label>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      This information will be used for mapping and visualizing your family's geographic history
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={member.birthCity || ""}
                          onChange={(e) => updateMember(index, "birthCity", e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State/Province</Label>
                        <Input
                          value={member.birthState || ""}
                          onChange={(e) => updateMember(index, "birthState", e.target.value)}
                          placeholder="State or Province"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={member.birthCountry || ""}
                          onChange={(e) => updateMember(index, "birthCountry", e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Relationships Section */}
                  <div className="border-t pt-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="relationships">
                        <AccordionTrigger className="text-sm font-medium text-gray-700 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Add Relationships (Optional)</span>
                            {(member.parents.length > 0 || member.siblings.length > 0 || member.spouse || member.children.length > 0) && (
                              <Badge variant="secondary" className="ml-2">
                                {member.parents.length + member.siblings.length + (member.spouse ? 1 : 0) + member.children.length}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          {/* Parents */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Parents</Label>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <Select
                                  onValueChange={(value) => {
                                    if (value && value !== "search") {
                                      addExistingRelationship(index, 'parents', value)
                                      setRelationshipSearchQuery(index, 'parents', "")
                                    }
                                  }}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select existing parent..." />
                                  </SelectTrigger>
                                  <SelectContent className="p-0">
                                    <div className="p-2 border-b">
                                      <div className="relative">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                          placeholder="Search parents..."
                                          value={getRelationshipSearchQuery(index, 'parents')}
                                          onChange={(e) => {
                                            e.stopPropagation()
                                            setRelationshipSearchQuery(index, 'parents', e.target.value)
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="pl-8 h-9"
                                        />
                                      </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                      {filterMembersForRelationship(
                                        familyMembers,
                                        getRelationshipSearchQuery(index, 'parents'),
                                        [(member as any).id || "", ...member.parents.map(p => p.id || "").filter(Boolean)]
                                      ).length > 0 ? (
                                        filterMembersForRelationship(
                                          familyMembers,
                                          getRelationshipSearchQuery(index, 'parents'),
                                          [(member as any).id || "", ...member.parents.map(p => p.id || "").filter(Boolean)]
                                        ).map((m) => {
                                          const profilePhoto = getProfilePhoto(m)
                                          const birthYear = getBirthYear(m.birthDate)
                                          return (
                                            <SelectItem key={m.id} value={m.id}>
                                              <div className="flex items-center gap-3 py-1">
                                                {profilePhoto ? (
                                                  <div className="relative w-10 h-10 flex-shrink-0">
                                                    <img 
                                                      src={profilePhoto} 
                                                      alt={`${m.firstName} ${m.lastName}`}
                                                      className="w-10 h-10 rounded-full object-cover"
                                                      onError={(e) => {
                                                        const target = e.currentTarget
                                                        target.style.display = 'none'
                                                        const fallback = target.nextElementSibling as HTMLElement
                                                        if (fallback) fallback.style.display = 'flex'
                                                      }}
                                                    />
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hidden">
                                                      <span className="text-sm font-medium text-gray-600">
                                                        {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-medium text-gray-600">
                                                      {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                                                    </span>
                                                  </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <div className="font-medium text-gray-900 truncate">
                                                    {m.firstName} {m.lastName}
                                                    {m.maidenName && ` (${m.maidenName})`}
                                                  </div>
                                                  {birthYear && (
                                                    <div className="text-xs text-gray-500">Born {birthYear}</div>
                                                  )}
                                                </div>
                                              </div>
                                            </SelectItem>
                                          )
                                        })
                                      ) : (
                                        <div className="px-2 py-6 text-center text-sm text-gray-500">
                                          {getRelationshipSearchQuery(index, 'parents') ? "No parents found" : "No parents available"}
                                        </div>
                                      )}
                                    </div>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openAddRelatedDialog(index, 'parents')}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add New
                              </Button>
                            </div>
                            {member.parents.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {member.parents.map((parent, pIndex) => {
                                  const parentMember = parent.id ? familyMembers.find(m => m.id === parent.id) : null
                                  return (
                                    <Badge key={pIndex} variant="secondary" className="flex items-center gap-1">
                                      {parentMember 
                                        ? `${parentMember.firstName} ${parentMember.lastName}`
                                        : `${parent.newMember?.firstName} ${parent.newMember?.lastName}${parent.newMember?.suffix ? ` ${parent.newMember.suffix}` : ''} (new)`
                                      }
                                      <button
                                        type="button"
                                        onClick={() => removeRelationship(index, 'parents', pIndex)}
                                        className="ml-1 hover:text-red-600"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Siblings */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Siblings</Label>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <Select
                                  onValueChange={(value) => {
                                    if (value && value !== "search") {
                                      addExistingRelationship(index, 'siblings', value)
                                      setRelationshipSearchQuery(index, 'siblings', "")
                                    }
                                  }}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select existing sibling..." />
                                  </SelectTrigger>
                                  <SelectContent className="p-0">
                                    <div className="p-2 border-b">
                                      <div className="relative">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                          placeholder="Search siblings..."
                                          value={getRelationshipSearchQuery(index, 'siblings')}
                                          onChange={(e) => {
                                            e.stopPropagation()
                                            setRelationshipSearchQuery(index, 'siblings', e.target.value)
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="pl-8 h-9"
                                        />
                                      </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                      {filterMembersForRelationship(
                                        familyMembers,
                                        getRelationshipSearchQuery(index, 'siblings'),
                                        [(member as any).id || "", ...member.siblings.map(s => s.id || "").filter(Boolean)]
                                      ).length > 0 ? (
                                        filterMembersForRelationship(
                                          familyMembers,
                                          getRelationshipSearchQuery(index, 'siblings'),
                                          [(member as any).id || "", ...member.siblings.map(s => s.id || "").filter(Boolean)]
                                        ).map((m) => {
                                          const profilePhoto = getProfilePhoto(m)
                                          const birthYear = getBirthYear(m.birthDate)
                                          return (
                                            <SelectItem key={m.id} value={m.id}>
                                              <div className="flex items-center gap-3 py-1">
                                                {profilePhoto ? (
                                                  <div className="relative w-10 h-10 flex-shrink-0">
                                                    <img 
                                                      src={profilePhoto} 
                                                      alt={`${m.firstName} ${m.lastName}`}
                                                      className="w-10 h-10 rounded-full object-cover"
                                                      onError={(e) => {
                                                        const target = e.currentTarget
                                                        target.style.display = 'none'
                                                        const fallback = target.nextElementSibling as HTMLElement
                                                        if (fallback) fallback.style.display = 'flex'
                                                      }}
                                                    />
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hidden">
                                                      <span className="text-sm font-medium text-gray-600">
                                                        {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-medium text-gray-600">
                                                      {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                                                    </span>
                                                  </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <div className="font-medium text-gray-900 truncate">
                                                    {m.firstName} {m.lastName}
                                                    {m.maidenName && ` (${m.maidenName})`}
                                                  </div>
                                                  {birthYear && (
                                                    <div className="text-xs text-gray-500">Born {birthYear}</div>
                                                  )}
                                                </div>
                                              </div>
                                            </SelectItem>
                                          )
                                        })
                                      ) : (
                                        <div className="px-2 py-6 text-center text-sm text-gray-500">
                                          {getRelationshipSearchQuery(index, 'siblings') ? "No siblings found" : "No siblings available"}
                                        </div>
                                      )}
                                    </div>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openAddRelatedDialog(index, 'siblings')}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add New
                              </Button>
                            </div>
                            {member.siblings.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {member.siblings.map((sibling, sIndex) => {
                                  const siblingMember = sibling.id ? familyMembers.find(m => m.id === sibling.id) : null
                                  return (
                                    <Badge key={sIndex} variant="secondary" className="flex items-center gap-1">
                                      {siblingMember 
                                        ? `${siblingMember.firstName} ${siblingMember.lastName}`
                                        : `${sibling.newMember?.firstName} ${sibling.newMember?.lastName}${sibling.newMember?.suffix ? ` ${sibling.newMember.suffix}` : ''} (new)`
                                      }
                                      <button
                                        type="button"
                                        onClick={() => removeRelationship(index, 'siblings', sIndex)}
                                        className="ml-1 hover:text-red-600"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Spouse */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Spouse/Partner</Label>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <Select
                                  value={member.spouse?.id || undefined}
                                  onValueChange={(value) => {
                                    if (value === "clear") {
                                      removeRelationship(index, 'spouse', 0)
                                      setRelationshipSearchQuery(index, 'spouse', "")
                                    } else if (value && value !== "search") {
                                      addExistingRelationship(index, 'spouse', value)
                                      setRelationshipSearchQuery(index, 'spouse', "")
                                    }
                                  }}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder={member.spouse ? "Change spouse..." : "Select existing spouse..."} />
                                  </SelectTrigger>
                                  <SelectContent className="p-0">
                                    <div className="p-2 border-b">
                                      <div className="relative">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                          placeholder="Search spouse..."
                                          value={getRelationshipSearchQuery(index, 'spouse')}
                                          onChange={(e) => {
                                            e.stopPropagation()
                                            setRelationshipSearchQuery(index, 'spouse', e.target.value)
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="pl-8 h-9"
                                        />
                                      </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                      {member.spouse && (
                                        <SelectItem value="clear">Clear selection</SelectItem>
                                      )}
                                      {filterMembersForRelationship(
                                        familyMembers,
                                        getRelationshipSearchQuery(index, 'spouse'),
                                        [(member as any).id || "", ...(member.spouse?.id ? [member.spouse.id] : [])]
                                      ).length > 0 ? (
                                        filterMembersForRelationship(
                                          familyMembers,
                                          getRelationshipSearchQuery(index, 'spouse'),
                                          [(member as any).id || "", ...(member.spouse?.id ? [member.spouse.id] : [])]
                                        ).map((m) => {
                                          const profilePhoto = getProfilePhoto(m)
                                          const birthYear = getBirthYear(m.birthDate)
                                          return (
                                            <SelectItem key={m.id} value={m.id}>
                                              <div className="flex items-center gap-3 py-1">
                                                {profilePhoto ? (
                                                  <div className="relative w-10 h-10 flex-shrink-0">
                                                    <img 
                                                      src={profilePhoto} 
                                                      alt={`${m.firstName} ${m.lastName}`}
                                                      className="w-10 h-10 rounded-full object-cover"
                                                      onError={(e) => {
                                                        const target = e.currentTarget
                                                        target.style.display = 'none'
                                                        const fallback = target.nextElementSibling as HTMLElement
                                                        if (fallback) fallback.style.display = 'flex'
                                                      }}
                                                    />
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hidden">
                                                      <span className="text-sm font-medium text-gray-600">
                                                        {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-medium text-gray-600">
                                                      {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                                                    </span>
                                                  </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <div className="font-medium text-gray-900 truncate">
                                                    {m.firstName} {m.lastName}
                                                    {m.maidenName && ` (${m.maidenName})`}
                                                  </div>
                                                  {birthYear && (
                                                    <div className="text-xs text-gray-500">Born {birthYear}</div>
                                                  )}
                                                </div>
                                              </div>
                                            </SelectItem>
                                          )
                                        })
                                      ) : (
                                        <div className="px-2 py-6 text-center text-sm text-gray-500">
                                          {getRelationshipSearchQuery(index, 'spouse') ? "No spouse found" : "No spouse available"}
                                        </div>
                                      )}
                                    </div>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openAddRelatedDialog(index, 'spouse')}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add New
                              </Button>
                            </div>
                            {member.spouse && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  {member.spouse?.id 
                                    ? `${familyMembers.find(m => m.id === member.spouse!.id)?.firstName} ${familyMembers.find(m => m.id === member.spouse!.id)?.lastName}`
                                    : `${member.spouse?.newMember?.firstName} ${member.spouse?.newMember?.lastName}${member.spouse?.newMember?.suffix ? ` ${member.spouse.newMember.suffix}` : ''} (new)`
                                  }
                                  <button
                                    type="button"
                                    onClick={() => removeRelationship(index, 'spouse', 0)}
                                    className="ml-1 hover:text-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Children */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Children</Label>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <Select
                                  onValueChange={(value) => {
                                    if (value && value !== "search") {
                                      addExistingRelationship(index, 'children', value)
                                      setRelationshipSearchQuery(index, 'children', "")
                                    }
                                  }}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select existing child..." />
                                  </SelectTrigger>
                                  <SelectContent className="p-0">
                                    <div className="p-2 border-b">
                                      <div className="relative">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                          placeholder="Search children..."
                                          value={getRelationshipSearchQuery(index, 'children')}
                                          onChange={(e) => {
                                            e.stopPropagation()
                                            setRelationshipSearchQuery(index, 'children', e.target.value)
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="pl-8 h-9"
                                        />
                                      </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                      {filterMembersForRelationship(
                                        familyMembers,
                                        getRelationshipSearchQuery(index, 'children'),
                                        [(member as any).id || "", ...member.children.map(c => c.id || "").filter(Boolean)]
                                      ).length > 0 ? (
                                        filterMembersForRelationship(
                                          familyMembers,
                                          getRelationshipSearchQuery(index, 'children'),
                                          [(member as any).id || "", ...member.children.map(c => c.id || "").filter(Boolean)]
                                        ).map((m) => {
                                          const profilePhoto = getProfilePhoto(m)
                                          const birthYear = getBirthYear(m.birthDate)
                                          return (
                                            <SelectItem key={m.id} value={m.id}>
                                              <div className="flex items-center gap-3 py-1">
                                                {profilePhoto ? (
                                                  <div className="relative w-10 h-10 flex-shrink-0">
                                                    <img 
                                                      src={profilePhoto} 
                                                      alt={`${m.firstName} ${m.lastName}`}
                                                      className="w-10 h-10 rounded-full object-cover"
                                                      onError={(e) => {
                                                        const target = e.currentTarget
                                                        target.style.display = 'none'
                                                        const fallback = target.nextElementSibling as HTMLElement
                                                        if (fallback) fallback.style.display = 'flex'
                                                      }}
                                                    />
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hidden">
                                                      <span className="text-sm font-medium text-gray-600">
                                                        {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-medium text-gray-600">
                                                      {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                                                    </span>
                                                  </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <div className="font-medium text-gray-900 truncate">
                                                    {m.firstName} {m.lastName}
                                                    {m.maidenName && ` (${m.maidenName})`}
                                                  </div>
                                                  {birthYear && (
                                                    <div className="text-xs text-gray-500">Born {birthYear}</div>
                                                  )}
                                                </div>
                                              </div>
                                            </SelectItem>
                                          )
                                        })
                                      ) : (
                                        <div className="px-2 py-6 text-center text-sm text-gray-500">
                                          {getRelationshipSearchQuery(index, 'children') ? "No children found" : "No children available"}
                                        </div>
                                      )}
                                    </div>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openAddRelatedDialog(index, 'children')}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add New
                              </Button>
                            </div>
                            {member.children.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {member.children.map((child, cIndex) => {
                                  const childMember = child.id ? familyMembers.find(m => m.id === child.id) : null
                                  return (
                                    <Badge key={cIndex} variant="secondary" className="flex items-center gap-1">
                                      {childMember 
                                        ? `${childMember.firstName} ${childMember.lastName}`
                                        : `${child.newMember?.firstName} ${child.newMember?.lastName}${child.newMember?.suffix ? ` ${child.newMember.suffix}` : ''} (new)`
                                      }
                                      <button
                                        type="button"
                                        onClick={() => removeRelationship(index, 'children', cIndex)}
                                        className="ml-1 hover:text-red-600"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
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
                className="w-full border-dashed border-[#819171] text-[#819171] hover:bg-[#819171]/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Family Member
              </Button>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#819171] hover:bg-[#6e7a5d] text-white">
                  Add Family Members
                </Button>
              </div>
              </form>
            )}
            
            {/* Edit form for when editingMember exists */}
            {editingMember && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName" className="text-gray-700 font-medium">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maidenName" className="text-gray-700 font-medium">Maiden Name (Optional)</Label>
                <Input
                  id="maidenName"
                  value={formData.maidenName}
                  onChange={(e) => setFormData({ ...formData, maidenName: e.target.value })}
                  placeholder="Enter maiden name if applicable"
                  className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-gray-700 font-medium">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              {/* Profile Photo Upload */}
              <div className="space-y-3">
                <Label htmlFor="profilePhoto" className="text-gray-700 font-medium">Profile Photo</Label>
                
                {/* Show existing photo or new preview */}
                {(profilePhotoUrl || existingPhotoPath) && !removeProfilePhoto && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300">
                      <img 
                        src={profilePhotoUrl || existingPhotoPath || ''} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        {existingPhotoPath && !selectedFile ? 'Current photo' : 'New photo selected'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {existingPhotoPath && !selectedFile ? 'Upload a new image to replace' : 'Ready to update'}
                      </p>
                    </div>
                    {existingPhotoPath && !selectedFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setRemoveProfilePhoto(true)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                      >
                        Remove Photo
                      </Button>
                    )}
                  </div>
                )}
                
                {/* File input - only show if no photo or want to change */}
                {(!profilePhotoUrl && !existingPhotoPath) || removeProfilePhoto ? (
                  <Input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null)
                      setProfilePhotoUrl(null)
                      setRemoveProfilePhoto(true)
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Change Photo
                  </Button>
                )}
              </div>

              {/* Place of Birth Section */}
              <div className="space-y-4">
                <div className="border-l-4 border-gray-300 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Place of Birth</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthCity" className="text-gray-700 font-medium">City</Label>
                      <Input
                        id="birthCity"
                        value={formData.birthCity}
                        onChange={(e) => setFormData({ ...formData, birthCity: e.target.value })}
                        placeholder="City"
                        className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthState" className="text-gray-700 font-medium">State/Province</Label>
                      <Input
                        id="birthState"
                        value={formData.birthState}
                        onChange={(e) => setFormData({ ...formData, birthState: e.target.value })}
                        placeholder="State/Province"
                        className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthCountry" className="text-gray-700 font-medium">Country</Label>
                      <Input
                        id="birthCountry"
                        value={formData.birthCountry}
                        onChange={(e) => setFormData({ ...formData, birthCountry: e.target.value })}
                        placeholder="Country"
                        className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAlive"
                  checked={formData.isAlive}
                  onChange={(e) => setFormData({ ...formData, isAlive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isAlive" className="text-gray-700 font-medium">This person is alive</Label>
              </div>

              {!formData.isAlive && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="deathDate" className="text-gray-700 font-medium">Death Date</Label>
                    <Input
                      id="deathDate"
                      type="date"
                      value={formData.deathDate}
                      onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                      className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>

                  {/* Place of Death Section */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Place of Death</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="deathCity" className="text-gray-700 font-medium">City</Label>
                          <Input
                            id="deathCity"
                            value={formData.deathCity}
                            onChange={(e) => setFormData({ ...formData, deathCity: e.target.value })}
                            placeholder="City"
                            className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deathState" className="text-gray-700 font-medium">State/Province</Label>
                          <Input
                            id="deathState"
                            value={formData.deathState}
                            onChange={(e) => setFormData({ ...formData, deathState: e.target.value })}
                            placeholder="State/Province"
                            className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deathCountry" className="text-gray-700 font-medium">Country</Label>
                          <Input
                            id="deathCountry"
                            value={formData.deathCountry}
                            onChange={(e) => setFormData({ ...formData, deathCountry: e.target.value })}
                            placeholder="Country"
                            className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Invitation Section */}
              <div className="border-t pt-6 space-y-4">
                <div className="bg-gradient-to-br from-[#819171]/5 to-white border-2 border-[#819171]/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-5 w-5 text-[#819171]" />
                    <Label className="text-lg font-semibold text-gray-900">
                      Invite {formData.firstName || "Family Member"} to Join
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Adding an email allows them to claim their profile, approve relationships, and add their own stories, photos, and information.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="family.member@example.com"
                      className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.email && formData.email.includes("@") 
                        ? "An invitation will be sent when you save this profile."
                        : "Enter an email address to send an invitation."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#819171] hover:bg-[#6e7a5d] text-white">
                  Update Family Member
                </Button>
              </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Post-Submission Dialog */}
        <Dialog open={isPostSubmissionDialogOpen} onOpenChange={setIsPostSubmissionDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-2xl flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Family Member{submittedMembers.length > 1 ? 's' : ''} Added!
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Review what was created and complete any missing information to build an accurate lineage.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {submittedMembers.map((submitted, index) => {
                const member = submitted.member
                const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim()
                const relationshipLabel = relationshipTypes.find(t => t.value === member.relationshipTypeToUser)?.label || member.relationshipTypeToUser
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{fullName}</h3>
                        <p className="text-sm text-gray-600">Added as: {relationshipLabel}</p>
                      </div>
                      {submitted.hasEmail && (
                        <Badge variant={submitted.invitationStatus === 'PENDING' ? 'secondary' : 'default'} className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {submitted.invitationStatus === 'PENDING' ? 'Invitation Pending' : 'Invited'}
                        </Badge>
                      )}
                    </div>

                    {/* What was created */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-green-900 mb-2">What was created:</p>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Profile for {fullName}</li>
                            {member.birthDate && <li>• Birth Date: {new Date(member.birthDate).toLocaleDateString()}</li>}
                            {(member.birthCity || member.birthState || member.birthCountry) && (
                              <li>• Place of Birth: {[member.birthCity, member.birthState, member.birthCountry].filter(Boolean).join(', ')}</li>
                            )}
                            {submitted.hasEmail && <li>• Email invitation sent to {member.email || 'the provided email'}</li>}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* What's missing */}
                    {submitted.missingFields.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-amber-900 mb-2">Missing information:</p>
                            <p className="text-xs text-amber-800 mb-2">
                              Complete profiles help create an accurate family lineage. All information is important for mapping, stories, and preserving your family history.
                            </p>
                            <ul className="text-sm text-amber-800 space-y-1">
                              {submitted.missingFields.map((field, idx) => (
                                <li key={idx}>• {field}</li>
                              ))}
                              <li>• Profile Photo (add from their profile page)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2 border-t">
                      {!submitted.hasEmail && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                          <div className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-blue-900 font-medium mb-1">
                                Invite {fullName} to join?
                              </p>
                              <p className="text-xs text-blue-800">
                                Adding an email allows them to approve their relationship, add their own stories, photos, and complete their profile.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (member.id) {
                              setViewingFullProfile(member)
                              setInitialTab("overview")
                              setIsPostSubmissionDialogOpen(false)
                            }
                          }}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Complete Profile
                        </Button>
                        {submitted.hasEmail && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              // TODO: Resend invitation email
                              alert('Invitation email will be resent (feature coming soon)')
                            }}
                            className="flex-1"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Invitation
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsPostSubmissionDialogOpen(false)
                    setSubmittedMembers([])
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      {familyMembers.length > 0 && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
            />
          </div>

          {/* Advanced Filters Panel */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Advanced Filters</span>
              </div>
              {isFilterPanelOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {isFilterPanelOpen && (
              <div className="p-6 border-t border-gray-200 space-y-4">
                {/* Status Filter */}
                <div>
                  <Label className="text-gray-700 font-medium mb-3 block">Status</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      onClick={() => setFilterStatus("all")}
                      className={`px-4 py-2 rounded-md transition-all ${
                        filterStatus === "all" 
                          ? "bg-[#819171] text-white hover:bg-[#6e7a5d]" 
                          : "border-gray-300 text-gray-700 hover:border-[#819171] hover:text-[#819171]"
                      }`}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === "living" ? "default" : "outline"}
                      onClick={() => setFilterStatus("living")}
                      className={`px-4 py-2 rounded-md transition-all ${
                        filterStatus === "living" 
                          ? "bg-[#819171] text-white hover:bg-[#6e7a5d]" 
                          : "border-gray-300 text-gray-700 hover:border-[#819171] hover:text-[#819171]"
                      }`}
                    >
                      Living
                    </Button>
                    <Button
                      variant={filterStatus === "deceased" ? "default" : "outline"}
                      onClick={() => setFilterStatus("deceased")}
                      className={`px-4 py-2 rounded-md transition-all ${
                        filterStatus === "deceased" 
                          ? "bg-[#819171] text-white hover:bg-[#6e7a5d]" 
                          : "border-gray-300 text-gray-700 hover:border-[#819171] hover:text-[#819171]"
                      }`}
                    >
                      Deceased
                    </Button>
                  </div>
                </div>

                {/* Birth Year Range */}
                <div>
                  <Label className="text-gray-700 font-medium mb-3 block">Birth Year Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Min year (e.g., 1900)"
                      value={filterBirthYearMin}
                      onChange={(e) => setFilterBirthYearMin(e.target.value)}
                      className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                    <Input
                      type="number"
                      placeholder="Max year (e.g., 2000)"
                      value={filterBirthYearMax}
                      onChange={(e) => setFilterBirthYearMax(e.target.value)}
                      className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>
                </div>

                {/* Birth Location Filters */}
                <div>
                  <Label className="text-gray-700 font-medium mb-3 block">Birth Location</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      type="text"
                      placeholder="City"
                      value={filterBirthCity}
                      onChange={(e) => setFilterBirthCity(e.target.value)}
                      className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                    <Input
                      type="text"
                      placeholder="State/Province"
                      value={filterBirthState}
                      onChange={(e) => setFilterBirthState(e.target.value)}
                      className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                    <Input
                      type="text"
                      placeholder="Country"
                      value={filterBirthCountry}
                      onChange={(e) => setFilterBirthCountry(e.target.value)}
                      className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterStatus("all")
                      setFilterBirthYearMin("")
                      setFilterBirthYearMax("")
                      setFilterBirthCity("")
                      setFilterBirthState("")
                      setFilterBirthCountry("")
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading family members...</p>
        </div>
      ) : familyMembers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <p className="text-gray-500 mb-6 text-lg">No family members added yet</p>
          <Button onClick={handleAddNew} className="bg-[#819171] text-white hover:bg-[#6e7a5d] px-8 py-3 rounded-xl font-medium shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Family Member
          </Button>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <p className="text-gray-500 mb-2 text-lg">No family members found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (() => {
        // Get grouped data
        const { myProfile, grouped, ungrouped } = groupMembersByRelationship()
        
        // Helper function to check if a profile is claimed
        // Only check isClaimed flag - don't check userId alone to avoid false positives
        const isProfileClaimed = (member: FamilyMemberWithRelations): boolean => {
          // Explicitly check isClaimed (handles both boolean true and SQLite 1)
          return member.isClaimed === true || member.isClaimed === 1
        }
        
        // Helper function to render a compact member card
        const renderMemberCard = (member: FamilyMemberWithRelations) => {
          const memberIsOwnProfile = (member as any).userId === currentUserId
          const profilePhoto = member.photos?.find(p => p.isProfile)
          const relationshipType = getMemberRelationshipType(member)
          const relationshipLabel = relationshipType ? relationshipTypeLabels[relationshipType] : null
          const storiesCount = member.stories?.length || 0
          const photosCount = member.photos?.filter(p => !p.isProfile).length || 0
          const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : null
          
          return (
            <div
              key={member.id}
              onClick={() => handleViewFullProfile(member)}
              className={`
                bg-white border rounded-xl overflow-hidden 
                hover:shadow-lg hover:scale-[1.02] transition-all duration-200 
                cursor-pointer group relative min-h-[200px]
                ${memberIsOwnProfile 
                  ? 'border-2 border-[#819171]' 
                  : 'border border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex flex-col h-full p-4 relative min-h-[200px]">
                {/* Profile Photo/Avatar */}
                <div className="flex justify-center mb-3">
                  {profilePhoto ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#819171] transition-colors">
                      <img
                        src={profilePhoto.filePath}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const initialsDiv = e.currentTarget.parentElement?.querySelector('.initials-fallback')
                          if (initialsDiv) {
                            initialsDiv.classList.remove('hidden')
                          }
                        }}
                      />
                      <div className="initials-fallback hidden w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                        <span className="text-xl font-light text-gray-600">
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-gray-200 group-hover:border-[#819171] transition-colors flex items-center justify-center">
                      <span className="text-xl font-light text-gray-600">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-sm font-medium text-gray-900 text-center mb-1 line-clamp-1">
                  {member.firstName} {member.lastName}
                </h3>

                {/* Relationship Badge */}
                {relationshipLabel && (
                  <div className="text-center mb-2">
                    <span className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full">
                      {relationshipLabel}
                    </span>
                  </div>
                )}

                {/* Status & Birth Year */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${member.isAlive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">
                    {member.isAlive ? 'Living' : 'Deceased'}
                    {birthYear && ` • ${birthYear}`}
                  </span>
                </div>

                {/* Quick Stats */}
                {(storiesCount > 0 || photosCount > 0) && (
                  <div className="flex gap-1 justify-center mt-auto pt-2">
                    {storiesCount > 0 && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {storiesCount} {storiesCount === 1 ? 'story' : 'stories'}
                      </span>
                    )}
                    {photosCount > 0 && (
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        {photosCount} {photosCount === 1 ? 'photo' : 'photos'}
                      </span>
                    )}
                  </div>
                )}

                {/* Status Badges */}
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {/* Claimed/Unclaimed Badge */}
                  {isProfileClaimed(member) ? (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Claimed
                    </Badge>
                  ) : (
                    <>
                      {/* Invitation Status Badge */}
                      {(member as any).hasInvitation && (member as any).invitationStatus ? (
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            (member as any).invitationStatus === 'PENDING' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : (member as any).invitationStatus === 'ACCEPTED'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {(member as any).invitationStatus === 'PENDING' ? 'Pending Invite' : 
                           (member as any).invitationStatus === 'ACCEPTED' ? 'Accepted' : 
                           (member as any).invitationStatus === 'DECLINED' ? 'Declined' : 
                           (member as any).invitationStatus === 'EXPIRED' ? 'Expired' : 'Invited'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                          <User className="h-3 w-3 mr-1" />
                          Uninvited
                        </Badge>
                      )}
                    </>
                  )}
                  
                  {/* Show email for claimed profiles (user email) or invitation email */}
                  {isProfileClaimed(member) && (member as any).userEmail ? (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <Mail className="h-3 w-3 mr-1" />
                      {(member as any).userEmail}
                    </Badge>
                  ) : (member as any).invitationsSent?.[0]?.email ? (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <Mail className="h-3 w-3 mr-1" />
                      {(member as any).invitationsSent[0].email}
                    </Badge>
                  ) : null}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none z-10">
                  <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
                    <span className="text-base font-semibold text-[#819171]">View Profile</span>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        // Filter grouped data based on search/filters
        const filterMembers = (members: FamilyMemberWithRelations[]) => {
          return members.filter(member => filteredMembers.includes(member))
        }

        return (
          <div className="space-y-8">
            {/* Relationship Categories */}
            {relationshipTypeOrder.map(type => {
              const members = filterMembers(grouped[type] || [])
              if (members.length === 0) return null

              return (
                <div key={type}>
                  <h2 className="text-lg font-medium text-gray-700 mb-4 sticky top-20 bg-white/95 backdrop-blur-sm py-2 z-10">
                    {relationshipTypeLabels[type]}
                    <span className="ml-2 text-gray-400 font-normal text-sm">
                      ({members.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {members.map(member => renderMemberCard(member))}
                  </div>
                </div>
              )
            })}

            {/* Ungrouped Members */}
            {filterMembers(ungrouped).length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-700 mb-4 sticky top-20 bg-white/95 backdrop-blur-sm py-2 z-10">
                  Others
                  <span className="ml-2 text-gray-400 font-normal text-sm">
                    ({filterMembers(ungrouped).length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filterMembers(ungrouped).map(member => renderMemberCard(member))}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Relationship Management Dialog */}
      <Dialog open={!!viewingRelationships} onOpenChange={() => setViewingRelationships(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 p-6 rounded-lg shadow-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900">
              Manage Relationships
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {viewingRelationships && familyMembers.find(m => m.id === viewingRelationships) && 
                `Add and manage relationships for ${familyMembers.find(m => m.id === viewingRelationships)?.firstName} ${familyMembers.find(m => m.id === viewingRelationships)?.lastName}`
              }
            </DialogDescription>
          </DialogHeader>
          
          {viewingRelationships && (
            <RelationshipManagement
              familyMemberId={viewingRelationships}
              familyMemberName={`${familyMembers.find(m => m.id === viewingRelationships)?.firstName} ${familyMembers.find(m => m.id === viewingRelationships)?.lastName}`}
              onRelationshipAdded={() => {
                fetchFamilyMembers()
                setViewingRelationships(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Full Profile Dialog */}
      <FullProfileDialog
        member={viewingFullProfile}
        open={!!viewingFullProfile}
        initialTab={initialTab}
        userFamilyMemberId={userFamilyMemberId}
        onOpenChange={(open) => {
          if (!open) {
            setViewingFullProfile(null)
            fetchFamilyMembers()
          }
        }}
        onUpdate={fetchFamilyMembers}
      />

      {/* Floating "You" Profile Bubble */}
      {(() => {
        const { myProfile } = groupMembersByRelationship()
        if (myProfile && filteredMembers.includes(myProfile)) {
          return (
            <FloatingProfileBubble
              member={myProfile}
              onOpenProfile={() => handleViewFullProfile(myProfile)}
            />
          )
        }
        return null
      })()}

      {/* Floating Sage AI Button */}
      {familyMembers.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <Button
            onClick={() => {
              // Find "Your" member or first member as fallback
              const yourMember = familyMembers.find(m => m.firstName === "Your") || familyMembers[0]
              if (yourMember) {
                handleViewFullProfile(yourMember, "biography")
              }
            }}
            className="bg-[#819171] hover:bg-[#6e7a5d] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all rounded-full p-4 h-14 w-14 flex items-center justify-center"
          >
            <Sparkles className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-[#819171] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
            Chat with Sage
          </div>
        </div>
      )}

      {/* Add Related Member Dialog */}
      <Dialog open={isAddRelatedDialogOpen} onOpenChange={setIsAddRelatedDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-2xl">
              Add New {addRelatedContext?.relationshipType === 'parents' ? 'Parent' : 
                       addRelatedContext?.relationshipType === 'siblings' ? 'Sibling' :
                       addRelatedContext?.relationshipType === 'spouse' ? 'Spouse/Partner' :
                       addRelatedContext?.relationshipType === 'children' ? 'Child' : 'Family Member'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter the information for this family member. They will be created and linked as a relationship.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault()
            handleAddRelatedSubmit()
          }} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={newRelatedMember.firstName}
                  onChange={(e) => setNewRelatedMember({ ...newRelatedMember, firstName: e.target.value })}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  value={newRelatedMember.lastName}
                  onChange={(e) => setNewRelatedMember({ ...newRelatedMember, lastName: e.target.value })}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Maiden Name</Label>
                <Input
                  value={newRelatedMember.maidenName}
                  onChange={(e) => setNewRelatedMember({ ...newRelatedMember, maidenName: e.target.value })}
                  placeholder="Previous surname"
                />
              </div>

              <div className="space-y-2">
                <Label>Suffix</Label>
                <Input
                  value={newRelatedMember.suffix}
                  onChange={(e) => setNewRelatedMember({ ...newRelatedMember, suffix: e.target.value })}
                  placeholder="Jr., Sr., III, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="whitespace-nowrap">Birth Date (Optional)</Label>
              <Input
                type="date"
                value={newRelatedMember.birthDate}
                onChange={(e) => setNewRelatedMember({ ...newRelatedMember, birthDate: e.target.value })}
              />
            </div>

            {/* Place of Birth */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#819171]" />
                <Label className="text-sm font-medium">Place of Birth (Optional)</Label>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                This information will be used for mapping and visualizing your family's geographic history
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={newRelatedMember.birthCity || ""}
                    onChange={(e) => setNewRelatedMember({ ...newRelatedMember, birthCity: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Input
                    value={newRelatedMember.birthState || ""}
                    onChange={(e) => setNewRelatedMember({ ...newRelatedMember, birthState: e.target.value })}
                    placeholder="State or Province"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={newRelatedMember.birthCountry || ""}
                    onChange={(e) => setNewRelatedMember({ ...newRelatedMember, birthCountry: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#819171]" />
                  <Label htmlFor="related-email" className="text-sm font-medium">
                    Invite to Join (Optional)
                  </Label>
                </div>
                <Input
                  id="related-email"
                  type="email"
                  value={newRelatedMember.email}
                  onChange={(e) => setNewRelatedMember({ ...newRelatedMember, email: e.target.value })}
                  placeholder="family.member@example.com"
                />
                <p className="text-xs text-gray-500">
                  Send an invitation for them to claim and manage their own profile
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddRelatedDialogOpen(false)
                  setAddRelatedContext(null)
                  setNewRelatedMember({
                    firstName: "",
                    lastName: "",
                    maidenName: "",
                    suffix: "",
                    birthDate: "",
                    birthCity: "",
                    birthState: "",
                    birthCountry: "",
                    email: "",
                  })
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#819171] text-white hover:bg-[#6e7a5d]"
                disabled={!newRelatedMember.firstName || !newRelatedMember.lastName}
              >
                Add {addRelatedContext?.relationshipType === 'parents' ? 'Parent' : 
                      addRelatedContext?.relationshipType === 'siblings' ? 'Sibling' :
                      addRelatedContext?.relationshipType === 'spouse' ? 'Spouse' :
                      addRelatedContext?.relationshipType === 'children' ? 'Child' : 'Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Cropper Dialog */}
      <ImageCropperDialog
        open={isCropperOpen}
        onOpenChange={setIsCropperOpen}
        imageFile={fileToCrop}
        aspectRatio={1}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
