"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Search, X, Tag } from "lucide-react"

interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  isClaimed: boolean
}

interface TagPeopleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentType: "photo" | "story" | "document" | "audio"
  contentId: string
  onTagged: () => void
}

export function TagPeopleDialog({
  open,
  onOpenChange,
  contentType,
  contentId,
  onTagged,
}: TagPeopleDialogProps) {
  const { userId } = useAuth()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [tagging, setTagging] = useState(false)
  const [existingTags, setExistingTags] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      fetchFamilyMembers()
      fetchExistingTags()
    } else {
      setSelectedMembers([])
      setSearchQuery("")
    }
  }, [open, contentId])

  const fetchFamilyMembers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/family-members")
      const data = await response.json()
      if (data.success) {
        setFamilyMembers(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching family members:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingTags = async () => {
    try {
      const response = await fetch(`/api/content-tags?contentType=${contentType}&contentId=${contentId}`)
      const data = await response.json()
      if (data.success) {
        setExistingTags(data.data.tags || [])
        // Pre-select already tagged members
        const taggedIds = data.data.tags.map((tag: any) => tag.taggedMemberId)
        setSelectedMembers(taggedIds)
      }
    } catch (error) {
      console.error("Error fetching existing tags:", error)
    }
  }

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleSave = async () => {
    if (selectedMembers.length === 0) {
      onOpenChange(false)
      return
    }

    setTagging(true)
    try {
      const response = await fetch("/api/content-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          taggedMemberIds: selectedMembers,
        }),
      })

      const data = await response.json()
      if (data.success) {
        onTagged()
        onOpenChange(false)
      } else {
        alert(data.error || "Failed to tag people")
      }
    } catch (error) {
      console.error("Error tagging people:", error)
      alert("Failed to tag people")
    } finally {
      setTagging(false)
    }
  }

  const filteredMembers = familyMembers.filter((member) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const fullName = `${member.firstName} ${member.middleName || ""} ${member.lastName}`.toLowerCase()
    return fullName.includes(query) || member.firstName.toLowerCase().includes(query) || member.lastName.toLowerCase().includes(query)
  })

  const getTagStatus = (memberId: string) => {
    const existingTag = existingTags.find((tag) => tag.taggedMemberId === memberId)
    if (!existingTag) return null
    return existingTag.status
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tag People
          </DialogTitle>
          <DialogDescription>
            Select family members to tag in this {contentType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search family members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="border rounded-lg max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No family members found</div>
            ) : (
              <div className="divide-y">
                {filteredMembers.map((member) => {
                  const isSelected = selectedMembers.includes(member.id)
                  const tagStatus = getTagStatus(member.id)
                  
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleToggleMember(member.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleMember(member.id)}
                      />
                      <div className="flex-1 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {member.firstName} {member.middleName} {member.lastName}
                        </span>
                        {!member.isClaimed && (
                          <Badge variant="outline" className="text-xs">
                            Pending
                          </Badge>
                        )}
                      </div>
                      {tagStatus && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            tagStatus === "APPROVED"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : tagStatus === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {tagStatus === "APPROVED"
                            ? "Approved"
                            : tagStatus === "PENDING"
                            ? "Pending"
                            : "Denied"}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 mr-2">Selected:</span>
              {selectedMembers.map((memberId) => {
                const member = familyMembers.find((m) => m.id === memberId)
                if (!member) return null
                return (
                  <Badge
                    key={memberId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {member.firstName} {member.lastName}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleMember(memberId)
                      }}
                    />
                  </Badge>
                )
              })}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={tagging}>
              {tagging ? "Tagging..." : `Tag ${selectedMembers.length} ${selectedMembers.length === 1 ? "Person" : "People"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

