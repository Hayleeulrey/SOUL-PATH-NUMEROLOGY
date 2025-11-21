"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, Heart, Baby, UserCheck, UserX, X, Mail, Search } from "lucide-react"
import { RelationshipType } from "@/lib/lineage-types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Photo {
  id: string
  filePath: string
  isProfile: boolean
}

interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  maidenName?: string
  birthDate?: Date | string | null
  isAlive: boolean
  photos?: Photo[]
}

interface Relationship {
  id: string
  personId: string
  relatedId: string
  relationshipType: RelationshipType
  notes?: string
  person: FamilyMember
  related: FamilyMember
}

interface RelationshipManagementProps {
  familyMemberId: string
  familyMemberName: string
  onRelationshipAdded?: () => void
}

const relationshipTypeLabels: Record<RelationshipType, string> = {
  PARENT: "Parent",
  CHILD: "Child", 
  SPOUSE: "Spouse",
  SIBLING: "Sibling",
  GRANDPARENT: "Grandparent",
  GRANDCHILD: "Grandchild",
  UNCLE_AUNT: "Uncle/Aunt",
  NEPHEW_NIECE: "Nephew/Niece",
  COUSIN: "Cousin",
  STEP_PARENT: "Step Parent",
  STEP_CHILD: "Step Child",
  HALF_SIBLING: "Half Sibling",
  ADOPTED_PARENT: "Adopted Parent",
  ADOPTED_CHILD: "Adopted Child",
  IN_LAW: "In-Law",
  PARTNER: "Partner",
  FRIEND: "Friend",
  OTHER: "Other"
}

const relationshipIcons: Record<RelationshipType, React.ReactNode> = {
  PARENT: <Users className="h-4 w-4" />,
  CHILD: <Baby className="h-4 w-4" />,
  SPOUSE: <Heart className="h-4 w-4" />,
  SIBLING: <UserCheck className="h-4 w-4" />,
  GRANDPARENT: <Users className="h-4 w-4" />,
  GRANDCHILD: <Baby className="h-4 w-4" />,
  UNCLE_AUNT: <UserCheck className="h-4 w-4" />,
  NEPHEW_NIECE: <Baby className="h-4 w-4" />,
  COUSIN: <UserCheck className="h-4 w-4" />,
  STEP_PARENT: <Users className="h-4 w-4" />,
  STEP_CHILD: <Baby className="h-4 w-4" />,
  HALF_SIBLING: <UserCheck className="h-4 w-4" />,
  ADOPTED_PARENT: <Users className="h-4 w-4" />,
  ADOPTED_CHILD: <Baby className="h-4 w-4" />,
  IN_LAW: <Heart className="h-4 w-4" />,
  PARTNER: <Heart className="h-4 w-4" />,
  FRIEND: <UserCheck className="h-4 w-4" />,
  OTHER: <UserX className="h-4 w-4" />
}

// Map to get inverse relationship types for display
const inverseRelationshipType: Partial<Record<RelationshipType, RelationshipType>> = {
  PARENT: 'CHILD',
  CHILD: 'PARENT',
  GRANDPARENT: 'GRANDCHILD',
  GRANDCHILD: 'GRANDPARENT',
  UNCLE_AUNT: 'NEPHEW_NIECE',
  NEPHEW_NIECE: 'UNCLE_AUNT',
  STEP_PARENT: 'STEP_CHILD',
  STEP_CHILD: 'STEP_PARENT',
  ADOPTED_PARENT: 'ADOPTED_CHILD',
  ADOPTED_CHILD: 'ADOPTED_PARENT',
  // SPOUSE, SIBLING, PARTNER, COUSIN, HALF_SIBLING are symmetric (no inverse needed)
}

interface RelationshipItem {
  id?: string // existing member ID
  newMember?: {
    firstName: string
    lastName: string
    maidenName?: string
    suffix?: string
    birthDate?: string
    email?: string
  } // new member to create
  relationshipType: RelationshipType
  notes?: string
}

export function RelationshipManagement({ 
  familyMemberId, 
  familyMemberName,
  onRelationshipAdded 
}: RelationshipManagementProps) {
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // New relationship builder state
  const [relationshipBuilder, setRelationshipBuilder] = useState({
    parents: [] as RelationshipItem[],
    siblings: [] as RelationshipItem[],
    spouse: null as RelationshipItem | null,
    children: [] as RelationshipItem[],
    grandparents: [] as RelationshipItem[],
    grandchildren: [] as RelationshipItem[],
    unclesAunts: [] as RelationshipItem[],
    nephewsNieces: [] as RelationshipItem[],
    cousins: [] as RelationshipItem[],
    stepParents: [] as RelationshipItem[],
    stepChildren: [] as RelationshipItem[],
    halfSiblings: [] as RelationshipItem[],
    adoptedParents: [] as RelationshipItem[],
    adoptedChildren: [] as RelationshipItem[],
    inLaws: [] as RelationshipItem[],
    others: [] as RelationshipItem[],
  })
  
  const [isAddRelatedDialogOpen, setIsAddRelatedDialogOpen] = useState(false)
  const [addRelatedContext, setAddRelatedContext] = useState<{
    relationshipType: keyof typeof relationshipBuilder
  } | null>(null)
  const [newRelatedMember, setNewRelatedMember] = useState({
    firstName: "",
    lastName: "",
    maidenName: "",
    suffix: "",
    birthDate: "",
    email: "",
  })
  
  // Search state for each relationship type
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({
    parents: "",
    siblings: "",
    spouse: "",
    children: "",
  })
  
  // Legacy form state for editing existing relationships
  const [formData, setFormData] = useState({
    relatedId: "",
    relationshipType: "" as RelationshipType,
    notes: "",
  })
  
  // Helper to filter members by search query
  const filterMembersBySearch = (members: FamilyMember[], searchQuery: string, excludeIds: string[] = []) => {
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
  const getProfilePhoto = (member: FamilyMember): string | null => {
    if (!member.photos || member.photos.length === 0) return null
    const profilePhoto = member.photos.find(p => p.isProfile)
    return profilePhoto ? profilePhoto.filePath : null
  }

  useEffect(() => {
    fetchData()
  }, [familyMemberId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [relationshipsRes, familyMembersRes] = await Promise.all([
        fetch("/api/relationships"),
        fetch("/api/family-members")
      ])
      
      // Check if responses are ok
      if (!relationshipsRes.ok || !familyMembersRes.ok) {
        throw new Error("Failed to fetch data")
      }
      
      const [relationshipsData, familyMembersData] = await Promise.all([
        relationshipsRes.json(),
        familyMembersRes.json()
      ])

      // Handle relationships data (returns array directly)
      if (!Array.isArray(relationshipsData)) {
        console.error("Relationships data is not an array:", relationshipsData)
        setRelationships([])
      } else {
        // Filter relationships for this family member
        let memberRelationships = relationshipsData.filter(
          (rel: Relationship) => rel.personId === familyMemberId || rel.relatedId === familyMemberId
        )
        
        // Deduplicate: if we have both A->B and B->A, only keep one
        // Prefer keeping the one where familyMemberId is the personId (viewing from their perspective)
        const relationshipMap = new Map<string, Relationship>()
        
        memberRelationships.forEach((rel: Relationship) => {
          // Create a canonical pair ID (sorted IDs to handle both directions)
          const pairId = [rel.personId, rel.relatedId].sort().join('|')
          
          const existing = relationshipMap.get(pairId)
          if (!existing) {
            // First time seeing this pair, add it
            relationshipMap.set(pairId, rel)
          } else {
            // We already have this pair, prefer the one where familyMemberId is personId
            if (rel.personId === familyMemberId && existing.personId !== familyMemberId) {
              relationshipMap.set(pairId, rel)
            }
          }
        })
        
        memberRelationships = Array.from(relationshipMap.values())
        
        setRelationships(memberRelationships)
      }

      // Handle family members data (returns { success: true, data: [...] })
      if (familyMembersData.success && Array.isArray(familyMembersData.data)) {
        setFamilyMembers(familyMembersData.data)
      } else if (Array.isArray(familyMembersData)) {
        // Fallback in case the API format changes
        setFamilyMembers(familyMembersData)
      } else {
        console.error("Family members data is not in expected format:", familyMembersData)
        setFamilyMembers([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setRelationships([])
      setFamilyMembers([])
    } finally {
      setLoading(false)
    }
  }

  // Helper functions for relationship builder
  const addExistingRelationship = (type: keyof typeof relationshipBuilder, memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId)
    if (!member) return
    
    // Determine relationship type based on the category
    const relationshipTypeMap: Record<string, RelationshipType> = {
      parents: 'PARENT',
      siblings: 'SIBLING',
      spouse: 'SPOUSE',
      children: 'CHILD',
      grandparents: 'GRANDPARENT',
      grandchildren: 'GRANDCHILD',
      unclesAunts: 'UNCLE_AUNT',
      nephewsNieces: 'NEPHEW_NIECE',
      cousins: 'COUSIN',
      stepParents: 'STEP_PARENT',
      stepChildren: 'STEP_CHILD',
      halfSiblings: 'HALF_SIBLING',
      adoptedParents: 'ADOPTED_PARENT',
      adoptedChildren: 'ADOPTED_CHILD',
      inLaws: 'IN_LAW',
      others: 'OTHER',
    }
    
    const relationshipType = relationshipTypeMap[type] || 'OTHER'
    
    if (type === 'spouse') {
      setRelationshipBuilder(prev => ({ ...prev, spouse: { id: memberId, relationshipType } }))
    } else {
      const array = relationshipBuilder[type] as RelationshipItem[]
      if (!array.some(item => item.id === memberId)) {
        setRelationshipBuilder(prev => ({
          ...prev,
          [type]: [...array, { id: memberId, relationshipType }]
        }))
      }
    }
  }
  
  const removeRelationship = (type: keyof typeof relationshipBuilder, index?: number) => {
    if (type === 'spouse') {
      setRelationshipBuilder(prev => ({ ...prev, spouse: null }))
    } else {
      const array = relationshipBuilder[type] as RelationshipItem[]
      if (index !== undefined) {
        setRelationshipBuilder(prev => ({
          ...prev,
          [type]: array.filter((_, i) => i !== index)
        }))
      }
    }
  }
  
  const openAddRelatedDialog = (type: keyof typeof relationshipBuilder) => {
    setAddRelatedContext({ relationshipType: type })
    setIsAddRelatedDialogOpen(true)
  }
  
  const addNewRelationship = async () => {
    if (!addRelatedContext || !newRelatedMember.firstName || !newRelatedMember.lastName) {
      alert('First name and last name are required')
      return
    }
    
    const relationshipTypeMap: Record<string, RelationshipType> = {
      parents: 'PARENT',
      siblings: 'SIBLING',
      spouse: 'SPOUSE',
      children: 'CHILD',
      grandparents: 'GRANDPARENT',
      grandchildren: 'GRANDCHILD',
      unclesAunts: 'UNCLE_AUNT',
      nephewsNieces: 'NEPHEW_NIECE',
      cousins: 'COUSIN',
      stepParents: 'STEP_PARENT',
      stepChildren: 'STEP_CHILD',
      halfSiblings: 'HALF_SIBLING',
      adoptedParents: 'ADOPTED_PARENT',
      adoptedChildren: 'ADOPTED_CHILD',
      inLaws: 'IN_LAW',
      others: 'OTHER',
    }
    
    const relationshipType = relationshipTypeMap[addRelatedContext.relationshipType] || 'OTHER'
    const newItem: RelationshipItem = {
      newMember: {
        firstName: newRelatedMember.firstName.trim(),
        lastName: newRelatedMember.lastName.trim(),
        maidenName: newRelatedMember.maidenName?.trim() || undefined,
        suffix: newRelatedMember.suffix?.trim() || undefined,
        birthDate: newRelatedMember.birthDate || undefined,
        email: newRelatedMember.email?.trim() || undefined,
      },
      relationshipType,
    }
    
    if (addRelatedContext.relationshipType === 'spouse') {
      setRelationshipBuilder(prev => ({ ...prev, spouse: newItem }))
    } else {
      const array = relationshipBuilder[addRelatedContext.relationshipType] as RelationshipItem[]
      setRelationshipBuilder(prev => ({
        ...prev,
        [addRelatedContext.relationshipType]: [...array, newItem]
      }))
    }
    
    // Reset form
    setNewRelatedMember({
      firstName: "",
      lastName: "",
      maidenName: "",
      suffix: "",
      birthDate: "",
      email: "",
    })
    setIsAddRelatedDialogOpen(false)
    setAddRelatedContext(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // If editing, use legacy form
    if (editingRelationship) {
      try {
        const response = await fetch(`/api/relationships/${editingRelationship.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            relationshipType: formData.relationshipType,
            notes: formData.notes,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to update relationship")
        }

        await fetchData()
        resetForm()
        setIsDialogOpen(false)
        onRelationshipAdded?.()
      } catch (error) {
        console.error("Error updating relationship:", error)
        setError(error instanceof Error ? error.message : "Failed to update relationship")
      }
      return
    }
    
    // New: Submit all relationships from builder
    try {
      // Collect all relationships to create
      const relationshipsToCreate: Array<{
        personId: string
        relatedId?: string
        relationshipType: RelationshipType
        notes?: string
        newMember?: any
      }> = []
      
      // Helper to add relationships
      // The direction matters: personId is the one who HAS the relationship type to relatedId
      // e.g., personId=Jerry, relatedId=Haylee, type=PARENT means "Jerry is parent of Haylee"
      const addRelationships = (type: keyof typeof relationshipBuilder, relationshipType: RelationshipType) => {
        const items = type === 'spouse' 
          ? (relationshipBuilder.spouse ? [relationshipBuilder.spouse] : [])
          : (relationshipBuilder[type] as RelationshipItem[])
        
        items.forEach(item => {
          if (item.id) {
            // Existing member - need to determine correct direction based on relationship type
            if (relationshipType === 'PARENT' || relationshipType === 'GRANDPARENT' || relationshipType === 'STEP_PARENT' || relationshipType === 'ADOPTED_PARENT') {
              // The selected member is the parent, familyMemberId is the child
              // personId = selected member (parent), relatedId = familyMemberId (child)
              relationshipsToCreate.push({
                personId: item.id,
                relatedId: familyMemberId,
                relationshipType,
                notes: item.notes,
              })
            } else if (relationshipType === 'CHILD' || relationshipType === 'GRANDCHILD' || relationshipType === 'STEP_CHILD' || relationshipType === 'ADOPTED_CHILD') {
              // The selected member is the child, familyMemberId is the parent
              // personId = selected member (child), relatedId = familyMemberId (parent)
              relationshipsToCreate.push({
                personId: item.id,
                relatedId: familyMemberId,
                relationshipType,
                notes: item.notes,
              })
            } else {
              // Symmetric relationships (SPOUSE, SIBLING, COUSIN, etc.) - direction doesn't matter
              relationshipsToCreate.push({
                personId: familyMemberId,
                relatedId: item.id,
                relationshipType,
                notes: item.notes,
              })
            }
          } else if (item.newMember) {
            // New member - will be created via family-members API
            // The relationship direction is handled in the new member creation
            relationshipsToCreate.push({
              personId: familyMemberId,
              relationshipType,
              notes: item.notes,
              newMember: item.newMember,
            })
          }
        })
      }
      
      // Add all relationship types
      addRelationships('parents', 'PARENT')
      addRelationships('siblings', 'SIBLING')
      addRelationships('spouse', 'SPOUSE')
      addRelationships('children', 'CHILD')
      addRelationships('grandparents', 'GRANDPARENT')
      addRelationships('grandchildren', 'GRANDCHILD')
      addRelationships('unclesAunts', 'UNCLE_AUNT')
      addRelationships('nephewsNieces', 'NEPHEW_NIECE')
      addRelationships('cousins', 'COUSIN')
      addRelationships('stepParents', 'STEP_PARENT')
      addRelationships('stepChildren', 'STEP_CHILD')
      addRelationships('halfSiblings', 'HALF_SIBLING')
      addRelationships('adoptedParents', 'ADOPTED_PARENT')
      addRelationships('adoptedChildren', 'ADOPTED_CHILD')
      addRelationships('inLaws', 'IN_LAW')
      addRelationships('others', 'OTHER')
      
      if (relationshipsToCreate.length === 0) {
        setError('Please add at least one relationship')
        return
      }
      
      // Separate existing and new member relationships
      const existingRelationships = relationshipsToCreate.filter(r => r.relatedId)
      const newMemberRelationships = relationshipsToCreate.filter(r => r.newMember)
      
      // Create existing relationships
      const existingPromises = existingRelationships.map(rel => 
        fetch("/api/relationships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personId: rel.personId,
            relatedId: rel.relatedId,
            relationshipType: rel.relationshipType,
            notes: rel.notes,
          }),
        }).then(res => {
          if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Failed to create relationship') })
          return res.json()
        })
      )
      
      // Create new members with relationships
      const newMemberPromises = newMemberRelationships.map(rel => {
        // Set up the inverse relationship structure
        let relationships: any = {}
        
        if (rel.relationshipType === 'PARENT') {
          // New member is parent, so familyMemberId is their child
          relationships.children = [{ id: familyMemberId }]
        } else if (rel.relationshipType === 'CHILD') {
          // New member is child, so familyMemberId is their parent
          relationships.parents = [{ id: familyMemberId }]
        } else if (rel.relationshipType === 'SIBLING') {
          // New member is sibling, so familyMemberId is also their sibling
          relationships.siblings = [{ id: familyMemberId }]
        } else if (rel.relationshipType === 'SPOUSE') {
          // New member is spouse, so familyMemberId is also their spouse
          relationships.spouse = { id: familyMemberId }
        } else {
          // For other relationship types, we'll create the relationship separately
          relationships = {}
        }
        
        return fetch("/api/family-members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: rel.newMember!.firstName,
            lastName: rel.newMember!.lastName,
            maidenName: rel.newMember!.maidenName,
            suffix: rel.newMember!.suffix,
            birthDate: rel.newMember!.birthDate || null,
            email: rel.newMember!.email,
            isAlive: true,
            relationshipTypeToUser: rel.relationshipType,
            relationships: Object.keys(relationships).length > 0 ? relationships : undefined,
          }),
        }).then(res => {
          if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Failed to create family member') })
          return res.json()
        })
      })
      
      await Promise.all([...existingPromises, ...newMemberPromises])
      
      await fetchData()
      resetRelationshipBuilder()
      setIsDialogOpen(false)
      onRelationshipAdded?.()
    } catch (error) {
      console.error("Error saving relationships:", error)
      setError(error instanceof Error ? error.message : "Failed to save relationships")
    }
  }
  
  const resetRelationshipBuilder = () => {
    setRelationshipBuilder({
      parents: [],
      siblings: [],
      spouse: null,
      children: [],
      grandparents: [],
      grandchildren: [],
      unclesAunts: [],
      nephewsNieces: [],
      cousins: [],
      stepParents: [],
      stepChildren: [],
      halfSiblings: [],
      adoptedParents: [],
      adoptedChildren: [],
      inLaws: [],
      others: [],
    })
    setSearchQueries({
      parents: "",
      siblings: "",
      spouse: "",
      children: "",
    })
  }

  const handleEdit = (relationship: Relationship) => {
    setEditingRelationship(relationship)
    setFormData({
      relatedId: relationship.relatedId,
      relationshipType: relationship.relationshipType,
      notes: relationship.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this relationship?")) return

    try {
      const response = await fetch(`/api/relationships/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete relationship")
      }

      await fetchData()
      onRelationshipAdded?.()
    } catch (error) {
      console.error("Error deleting relationship:", error)
      alert("Failed to delete relationship")
    }
  }

  const resetForm = () => {
    setFormData({
      relatedId: "",
      relationshipType: "" as RelationshipType,
      notes: "",
    })
    setEditingRelationship(null)
    resetRelationshipBuilder()
    setError(null)
  }

  const handleAddNew = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Get available family members (exclude current member and already related members)
  const availableFamilyMembers = Array.isArray(familyMembers) ? familyMembers.filter(member => 
    member.id !== familyMemberId && 
    Array.isArray(relationships) && !relationships.some(rel => 
      (rel.personId === member.id && rel.relatedId === familyMemberId) ||
      (rel.relatedId === member.id && rel.personId === familyMemberId)
    )
  ) : []


  const getRelatedMemberName = (relationship: Relationship) => {
    return relationship.personId === familyMemberId 
      ? `${relationship.related.firstName} ${relationship.related.lastName}`
      : `${relationship.person.firstName} ${relationship.person.lastName}`
  }

  const getDisplayRelationshipType = (relationship: Relationship): RelationshipType => {
    // Determine which person we're viewing from
    const isViewingFromPersonSide = relationship.personId === familyMemberId
    const isViewingFromRelatedSide = relationship.relatedId === familyMemberId
    
    if (isViewingFromPersonSide) {
      // Viewing from the person's perspective: "I am the person, the related is my X"
      // e.g., personId=Jerry, relatedId=Haylee, type=PARENT means "Jerry is parent of Haylee"
      // When viewing Jerry's profile, we want to show "Haylee is my Child" (invert PARENT to CHILD)
      // e.g., personId=Haylee, relatedId=Jerry, type=CHILD means "Haylee is child of Jerry"
      // When viewing Haylee's profile, we want to show "Jerry is my Parent" (invert CHILD to PARENT)
      if (relationship.relationshipType === 'CHILD') {
        return 'PARENT' // If I'm someone's child, they are my parent
      }
      if (relationship.relationshipType === 'PARENT') {
        return 'CHILD' // If I'm someone's parent, they are my child
      }
      if (relationship.relationshipType === 'GRANDCHILD') {
        return 'GRANDPARENT'
      }
      if (relationship.relationshipType === 'GRANDPARENT') {
        return 'GRANDCHILD'
      }
      if (relationship.relationshipType === 'STEP_CHILD') {
        return 'STEP_PARENT'
      }
      if (relationship.relationshipType === 'STEP_PARENT') {
        return 'STEP_CHILD'
      }
      if (relationship.relationshipType === 'ADOPTED_CHILD') {
        return 'ADOPTED_PARENT'
      }
      if (relationship.relationshipType === 'ADOPTED_PARENT') {
        return 'ADOPTED_CHILD'
      }
      if (relationship.relationshipType === 'NEPHEW_NIECE') {
        return 'UNCLE_AUNT'
      }
      if (relationship.relationshipType === 'UNCLE_AUNT') {
        return 'NEPHEW_NIECE'
      }
      // For symmetric relationships (SPOUSE, SIBLING, COUSIN, etc.), no inversion needed
      return relationship.relationshipType
    } else if (isViewingFromRelatedSide) {
      // Viewing from the related person's perspective: "I am the related, the person is my X"
      // e.g., personId=Jerry, relatedId=Haylee, type=PARENT means "Jerry is parent of Haylee"
      // When viewing Haylee's profile (relatedId=Haylee), we want to show "Jerry is my Parent"
      // So we use the type as-is (no inversion needed)
      return relationship.relationshipType
    }
    
    // Fallback (shouldn't happen if filtering is correct)
    return relationship.relationshipType
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Loading relationships...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Relationships</h3>
        <Button onClick={handleAddNew} size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Relationship
        </Button>
      </div>

      {!Array.isArray(relationships) || relationships.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <p className="text-gray-600 mb-2 text-lg">No relationships added yet</p>
          <p className="text-sm text-gray-500">
            Add relationships to connect {familyMemberName} with other family members
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(() => {
            // Group relationships by type
            const grouped: Record<string, typeof relationships> = {}
            const typeOrder = [
              'PARENT', 
              'GRANDPARENT', 
              'STEP_PARENT', 
              'ADOPTED_PARENT',
              'SPOUSE', 
              'PARTNER',
              'SIBLING', 
              'HALF_SIBLING',
              'CHILD', 
              'GRANDCHILD',
              'STEP_CHILD',
              'ADOPTED_CHILD',
              'UNCLE_AUNT',
              'NEPHEW_NIECE',
              'COUSIN',
              'IN_LAW',
              'FRIEND', 
              'OTHER'
            ]
            
            relationships.forEach((rel) => {
              const displayType = getDisplayRelationshipType(rel)
              const typeKey = displayType
              if (!grouped[typeKey]) {
                grouped[typeKey] = []
              }
              grouped[typeKey].push(rel)
            })
            
            // Sort each group by name
            Object.keys(grouped).forEach((key) => {
              grouped[key].sort((a, b) => {
                const nameA = getRelatedMemberName(a).toLowerCase()
                const nameB = getRelatedMemberName(b).toLowerCase()
                return nameA.localeCompare(nameB)
              })
            })
            
            // Render grouped relationships
            return typeOrder
              .filter(type => grouped[type] && grouped[type].length > 0)
              .map((type) => (
                <div key={type} className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    {(() => {
                      const label = relationshipTypeLabels[type as RelationshipType]
                      // Handle special pluralizations
                      const plurals: Record<string, string> = {
                        'Child': 'Children',
                        'Grandchild': 'Grandchildren',
                        'Step Child': 'Step Children',
                        'Adopted Child': 'Adopted Children',
                        'In-Law': 'In-Laws',
                        'Uncle/Aunt': 'Uncles/Aunts',
                        'Nephew/Niece': 'Nephews/Nieces',
                      }
                      return plurals[label] || `${label}s`
                    })()}
                    <span className="ml-2 text-gray-400 font-normal normal-case">
                      ({grouped[type].length})
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {grouped[type].map((relationship) => (
                      <Card key={relationship.id} className="border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {relationshipIcons[getDisplayRelationshipType(relationship)]}
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                                    {relationshipTypeLabels[getDisplayRelationshipType(relationship)]}
                                  </Badge>
                                  <span className="font-semibold text-gray-900">
                                    {getRelatedMemberName(relationship)}
                                  </span>
                                </div>
                                {relationship.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{relationship.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(relationship)}
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(relationship.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
          })()}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-gray-200 p-6 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900">
              {editingRelationship ? "Edit Relationship" : "Add Relationships"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingRelationship 
                ? "Update the relationship details for this family member."
                : `Add relationships for ${familyMemberName}. Select existing family members or add new ones.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {editingRelationship ? (
              // Edit mode - simple form
              <>
                <div className="space-y-2">
                  <Label htmlFor="relationshipType" className="text-gray-700 font-medium">Relationship Type *</Label>
                  <Select
                    value={formData.relationshipType}
                    onValueChange={(value) => setFormData({ ...formData, relationshipType: value as RelationshipType })}
                    required
                  >
                    <SelectTrigger className="border-gray-300 focus:border-gray-900 focus:ring-gray-900">
                      <SelectValue placeholder="Select relationship type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {Object.entries(relationshipTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-gray-900 hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            {relationshipIcons[value as RelationshipType]}
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-gray-700 font-medium">Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    rows={3}
                    placeholder="Add any additional notes about this relationship..."
                  />
                </div>
              </>
            ) : (
              // Add mode - relationship builder
              <Accordion type="multiple" className="w-full">
                {/* Parents */}
                <AccordionItem value="parents">
                  <AccordionTrigger className="text-gray-900">Parents</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Select
                          onValueChange={(value) => {
                            if (value && value !== "search") {
                              addExistingRelationship('parents', value)
                              setSearchQueries(prev => ({ ...prev, parents: "" }))
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
                                  value={searchQueries.parents}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    setSearchQueries(prev => ({ ...prev, parents: e.target.value }))
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="pl-8 h-9"
                                />
                              </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {filterMembersBySearch(
                                familyMembers,
                                searchQueries.parents,
                                [familyMemberId, ...relationshipBuilder.parents.map(p => p.id || "").filter(Boolean)]
                              ).length > 0 ? (
                                filterMembersBySearch(
                                  familyMembers,
                                  searchQueries.parents,
                                  [familyMemberId, ...relationshipBuilder.parents.map(p => p.id || "").filter(Boolean)]
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
                                  {searchQueries.parents ? "No parents found" : "No parents available"}
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
                        onClick={() => openAddRelatedDialog('parents')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New
                      </Button>
                    </div>
                    {relationshipBuilder.parents.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {relationshipBuilder.parents.map((parent, pIndex) => {
                          const parentMember = parent.id ? familyMembers.find(m => m.id === parent.id) : null
                          return (
                            <Badge key={pIndex} variant="secondary" className="flex items-center gap-1">
                              {parentMember 
                                ? `${parentMember.firstName} ${parentMember.lastName}`
                                : `${parent.newMember?.firstName} ${parent.newMember?.lastName}${parent.newMember?.suffix ? ` ${parent.newMember.suffix}` : ''} (new)`
                              }
                              <button
                                type="button"
                                onClick={() => removeRelationship('parents', pIndex)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Siblings */}
                <AccordionItem value="siblings">
                  <AccordionTrigger className="text-gray-900">Siblings</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Select
                          onValueChange={(value) => {
                            if (value && value !== "search") {
                              addExistingRelationship('siblings', value)
                              setSearchQueries(prev => ({ ...prev, siblings: "" }))
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
                                  value={searchQueries.siblings}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    setSearchQueries(prev => ({ ...prev, siblings: e.target.value }))
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="pl-8 h-9"
                                />
                              </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {filterMembersBySearch(
                                familyMembers,
                                searchQueries.siblings,
                                [familyMemberId, ...relationshipBuilder.siblings.map(s => s.id || "").filter(Boolean)]
                              ).length > 0 ? (
                                filterMembersBySearch(
                                  familyMembers,
                                  searchQueries.siblings,
                                  [familyMemberId, ...relationshipBuilder.siblings.map(s => s.id || "").filter(Boolean)]
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
                                  {searchQueries.siblings ? "No siblings found" : "No siblings available"}
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
                        onClick={() => openAddRelatedDialog('siblings')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New
                      </Button>
                    </div>
                    {relationshipBuilder.siblings.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {relationshipBuilder.siblings.map((sibling, sIndex) => {
                          const siblingMember = sibling.id ? familyMembers.find(m => m.id === sibling.id) : null
                          return (
                            <Badge key={sIndex} variant="secondary" className="flex items-center gap-1">
                              {siblingMember 
                                ? `${siblingMember.firstName} ${siblingMember.lastName}`
                                : `${sibling.newMember?.firstName} ${sibling.newMember?.lastName}${sibling.newMember?.suffix ? ` ${sibling.newMember.suffix}` : ''} (new)`
                              }
                              <button
                                type="button"
                                onClick={() => removeRelationship('siblings', sIndex)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Spouse */}
                <AccordionItem value="spouse">
                  <AccordionTrigger className="text-gray-900">Spouse/Partner</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Select
                          value={relationshipBuilder.spouse?.id || undefined}
                          onValueChange={(value) => {
                            if (value === "clear") {
                              removeRelationship('spouse')
                              setSearchQueries(prev => ({ ...prev, spouse: "" }))
                            } else if (value && value !== "search") {
                              addExistingRelationship('spouse', value)
                              setSearchQueries(prev => ({ ...prev, spouse: "" }))
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder={relationshipBuilder.spouse ? "Change spouse..." : "Select existing spouse..."} />
                          </SelectTrigger>
                          <SelectContent className="p-0">
                            <div className="p-2 border-b">
                              <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  placeholder="Search spouse..."
                                  value={searchQueries.spouse}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    setSearchQueries(prev => ({ ...prev, spouse: e.target.value }))
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="pl-8 h-9"
                                />
                              </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {relationshipBuilder.spouse && (
                                <SelectItem value="clear">Clear selection</SelectItem>
                              )}
                              {filterMembersBySearch(
                                familyMembers,
                                searchQueries.spouse,
                                [familyMemberId, ...(relationshipBuilder.spouse?.id ? [relationshipBuilder.spouse.id] : [])]
                              ).length > 0 ? (
                                filterMembersBySearch(
                                  familyMembers,
                                  searchQueries.spouse,
                                  [familyMemberId, ...(relationshipBuilder.spouse?.id ? [relationshipBuilder.spouse.id] : [])]
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
                                  {searchQueries.spouse ? "No spouse found" : "No spouse available"}
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
                        onClick={() => openAddRelatedDialog('spouse')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New
                      </Button>
                    </div>
                    {relationshipBuilder.spouse && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {relationshipBuilder.spouse.id 
                            ? `${familyMembers.find(m => m.id === relationshipBuilder.spouse!.id)?.firstName} ${familyMembers.find(m => m.id === relationshipBuilder.spouse!.id)?.lastName}`
                            : `${relationshipBuilder.spouse.newMember?.firstName} ${relationshipBuilder.spouse.newMember?.lastName}${relationshipBuilder.spouse.newMember?.suffix ? ` ${relationshipBuilder.spouse.newMember.suffix}` : ''} (new)`
                          }
                          <button
                            type="button"
                            onClick={() => removeRelationship('spouse')}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Children */}
                <AccordionItem value="children">
                  <AccordionTrigger className="text-gray-900">Children</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Select
                          onValueChange={(value) => {
                            if (value && value !== "search") {
                              addExistingRelationship('children', value)
                              setSearchQueries(prev => ({ ...prev, children: "" }))
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
                                  value={searchQueries.children}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    setSearchQueries(prev => ({ ...prev, children: e.target.value }))
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="pl-8 h-9"
                                />
                              </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {filterMembersBySearch(
                                familyMembers,
                                searchQueries.children,
                                [familyMemberId, ...relationshipBuilder.children.map(c => c.id || "").filter(Boolean)]
                              ).length > 0 ? (
                                filterMembersBySearch(
                                  familyMembers,
                                  searchQueries.children,
                                  [familyMemberId, ...relationshipBuilder.children.map(c => c.id || "").filter(Boolean)]
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
                                  {searchQueries.children ? "No children found" : "No children available"}
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
                        onClick={() => openAddRelatedDialog('children')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New
                      </Button>
                    </div>
                    {relationshipBuilder.children.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {relationshipBuilder.children.map((child, cIndex) => {
                          const childMember = child.id ? familyMembers.find(m => m.id === child.id) : null
                          return (
                            <Badge key={cIndex} variant="secondary" className="flex items-center gap-1">
                              {childMember 
                                ? `${childMember.firstName} ${childMember.lastName}`
                                : `${child.newMember?.firstName} ${child.newMember?.lastName}${child.newMember?.suffix ? ` ${child.newMember.suffix}` : ''} (new)`
                              }
                              <button
                                type="button"
                                onClick={() => removeRelationship('children', cIndex)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
              >
                {editingRelationship ? "Update" : "Add"} Relationship{!editingRelationship && (relationshipBuilder.parents.length + relationshipBuilder.siblings.length + (relationshipBuilder.spouse ? 1 : 0) + relationshipBuilder.children.length) > 0 ? 's' : ''}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add New Related Member Dialog */}
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
          
          <div className="space-y-4">
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
                <Label>Maiden Name (Optional)</Label>
                <Input
                  value={newRelatedMember.maidenName}
                  onChange={(e) => setNewRelatedMember({ ...newRelatedMember, maidenName: e.target.value })}
                  placeholder="Enter maiden name"
                />
              </div>
              <div className="space-y-2">
                <Label>Suffix (Optional)</Label>
                <Input
                  value={newRelatedMember.suffix}
                  onChange={(e) => setNewRelatedMember({ ...newRelatedMember, suffix: e.target.value })}
                  placeholder="Jr., Sr., III, etc."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Birth Date (Optional)</Label>
              <Input
                type="date"
                value={newRelatedMember.birthDate}
                onChange={(e) => setNewRelatedMember({ ...newRelatedMember, birthDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <Label>Email (Optional)</Label>
              </div>
              <Input
                type="email"
                value={newRelatedMember.email}
                onChange={(e) => setNewRelatedMember({ ...newRelatedMember, email: e.target.value })}
                placeholder="family.member@example.com"
              />
              <p className="text-xs text-gray-500">
                Send an invitation for them to claim and manage their own profile
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddRelatedDialogOpen(false)
                  setNewRelatedMember({
                    firstName: "",
                    lastName: "",
                    maidenName: "",
                    suffix: "",
                    birthDate: "",
                    email: "",
                  })
                  setAddRelatedContext(null)
                }}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={addNewRelationship}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
              >
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
