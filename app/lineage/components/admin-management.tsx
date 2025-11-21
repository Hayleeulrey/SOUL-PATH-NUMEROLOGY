"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Shield, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Search,
  User
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Admin {
  id: string
  profileId: string
  adminUserId: string
  assignedBy: string
  canEditProfile: boolean
  canManageAdmins: boolean
  createdAt: string
  adminUser?: {
    id: string
    name: string | null
    email: string
  } | null
  assignedByUser?: {
    id: string
    name: string | null
    email: string
  } | null
}

interface AdminManagementProps {
  profileId: string
  canManageAdmins: boolean
}

export function AdminManagement({ profileId, canManageAdmins }: AdminManagementProps) {
  const { userId } = useAuth()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [canEditProfile, setCanEditProfile] = useState(true)
  const [canManage, setCanManage] = useState(false)
  const [adding, setAdding] = useState(false)
  const [familyMembers, setFamilyMembers] = useState<any[]>([])

  useEffect(() => {
    if (profileId) {
      fetchAdmins()
      fetchFamilyMembers()
    }
  }, [profileId])

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/profile-admins/${profileId}`)
      const data = await response.json()
      if (data.success) {
        setAdmins(data.data.admins || [])
      }
    } catch (error) {
      console.error("Error fetching admins:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch("/api/family-members")
      const data = await response.json()
      if (data.success) {
        // Filter to only show family members that have user accounts (are claimed)
        const claimedMembers = (data.data || []).filter(
          (m: any) => m.userId && m.userId !== userId && m.isClaimed
        )
        setFamilyMembers(claimedMembers)
      }
    } catch (error) {
      console.error("Error fetching family members:", error)
    }
  }

  const handleAddAdmin = async () => {
    if (!selectedUserId) {
      alert("Please select a family member")
      return
    }

    setAdding(true)
    try {
      // Get the user ID for the selected family member
      const selectedMember = familyMembers.find((m) => m.id === selectedUserId)
      if (!selectedMember?.userId) {
        alert("Selected family member must have a claimed profile")
        return
      }

      const response = await fetch("/api/profile-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          adminUserId: selectedMember.userId,
          canEditProfile,
          canManageAdmins: canManage,
        }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchAdmins()
        setAddDialogOpen(false)
        setSelectedUserId("")
        setCanEditProfile(true)
        setCanManage(false)
      } else {
        alert(data.error || "Failed to add admin")
      }
    } catch (error) {
      console.error("Error adding admin:", error)
      alert("Failed to add admin")
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) {
      return
    }

    try {
      const response = await fetch(`/api/profile-admins/admin/${adminId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        await fetchAdmins()
      } else {
        alert(data.error || "Failed to remove admin")
      }
    } catch (error) {
      console.error("Error removing admin:", error)
      alert("Failed to remove admin")
    }
  }

  const filteredFamilyMembers = familyMembers.filter((member) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const fullName = `${member.firstName} ${member.middleName || ""} ${member.lastName}`.toLowerCase()
    return fullName.includes(query) || member.firstName.toLowerCase().includes(query) || member.lastName.toLowerCase().includes(query)
  })

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading admins...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profile Admins
            </CardTitle>
            <CardDescription>
              Assign family members to help manage this profile
            </CardDescription>
          </div>
          {canManageAdmins && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Profile Admin</DialogTitle>
                  <DialogDescription>
                    Select a family member to assign as an admin for this profile
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Family Members</Label>
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Select Family Member</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a family member" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredFamilyMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.middleName} {member.lastName}
                            {member.isClaimed && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Claimed
                              </Badge>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="can-edit"
                        checked={canEditProfile}
                        onChange={(e) => setCanEditProfile(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="can-edit">Can edit profile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="can-manage"
                        checked={canManage}
                        onChange={(e) => setCanManage(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="can-manage">Can manage other admins</Label>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddAdmin} disabled={adding || !selectedUserId}>
                      {adding ? "Adding..." : "Add Admin"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No admins assigned</p>
            {canManageAdmins && (
              <p className="text-sm mt-2">Click "Add Admin" to assign someone to help manage this profile</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {admin.adminUser?.name || admin.adminUser?.email || "Unknown User"}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {admin.canEditProfile && (
                        <Badge variant="outline" className="text-xs">
                          Can Edit
                        </Badge>
                      )}
                      {admin.canManageAdmins && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Can Manage Admins
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Assigned by {admin.assignedByUser?.name || admin.assignedByUser?.email || "Unknown"} •{" "}
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {canManageAdmins && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAdmin(admin.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

