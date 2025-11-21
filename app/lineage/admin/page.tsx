"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Shield, 
  Search, 
  Mail, 
  CheckCircle, 
  Clock, 
  User,
  Eye,
  Send
} from "lucide-react"
import { StatusSummary } from "../components/status-summary"
import { FullProfileDialog } from "../components/full-profile-dialog"
import { FamilyMemberWithRelations } from "@/lib/lineage-types"

export default function AdminPortalPage() {
  const { userId } = useAuth()
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMember, setSelectedMember] = useState<FamilyMemberWithRelations | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [adminProfiles, setAdminProfiles] = useState<Set<string>>(new Set())
  const [isSettingUpTestData, setIsSettingUpTestData] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteMember, setInviteMember] = useState<FamilyMemberWithRelations | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isSendingInvite, setIsSendingInvite] = useState(false)

  useEffect(() => {
    fetchFamilyMembers()
    fetchAdminProfiles()
  }, [userId])

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true)
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

  const fetchAdminProfiles = async () => {
    if (!userId) return
    try {
      const response = await fetch("/api/profile-admins")
      const data = await response.json()
      if (data.success && data.data?.admins) {
        const profileIds = data.data.admins
          .filter((admin: any) => admin.adminUserId === userId)
          .map((admin: any) => admin.profileId)
        setAdminProfiles(new Set(profileIds))
      }
    } catch (error) {
      console.error("Error fetching admin profiles:", error)
    }
  }

  const handleSetupTestData = async () => {
    if (!confirm("This will set up test data with Tanner (pending invite), Dillon (claimed), and Hope (claimed with you as admin). Continue?")) {
      return
    }

    setIsSettingUpTestData(true)
    try {
      const response = await fetch("/api/test-data/setup", {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        alert("Test data setup completed successfully!")
        await fetchFamilyMembers()
        await fetchAdminProfiles()
      } else {
        alert(`Failed to setup test data: ${data.error}`)
      }
    } catch (error) {
      console.error("Error setting up test data:", error)
      alert("Failed to setup test data")
    } finally {
      setIsSettingUpTestData(false)
    }
  }

  const handleOpenInviteDialog = (member: FamilyMemberWithRelations) => {
    setInviteMember(member)
    setInviteEmail("")
    setInviteDialogOpen(true)
  }

  const handleSendInvitation = async () => {
    if (!inviteMember || !inviteEmail || !inviteEmail.includes("@")) {
      alert("Please enter a valid email address")
      return
    }

    setIsSendingInvite(true)
    try {
      const response = await fetch(`/api/family-members/${inviteMember.id}/invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      })

      const result = await response.json()
      if (result.success) {
        alert("Invitation sent successfully!")
        setInviteDialogOpen(false)
        await fetchFamilyMembers()
      } else {
        alert(result.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      alert("Failed to send invitation")
    } finally {
      setIsSendingInvite(false)
    }
  }

  const getStatusBadges = (member: any) => {
    const badges = []
    
    // A profile is considered claimed ONLY if isClaimed is explicitly true (or 1 for SQLite)
    // We don't check userId alone because createdBy might be confused with userId
    const isClaimed = member.isClaimed === true || member.isClaimed === 1
    if (isClaimed) {
      badges.push(
        <Badge key="claimed" variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Claimed
        </Badge>
      )
    } else {
      const invitation = member.invitationsSent?.[0]
      if (invitation && invitation.status === "PENDING" && invitation.email) {
        badges.push(
          <Badge key="pending" variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Invite
          </Badge>
        )
      } else {
        badges.push(
          <Badge key="uninvited" variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            <User className="h-3 w-3 mr-1" />
            Uninvited
          </Badge>
        )
      }
    }

    if (adminProfiles.has(member.id)) {
      badges.push(
        <Badge key="admin" variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      )
    }

    return badges
  }

  const getInvitationEmail = (member: any) => {
    // For claimed profiles, show the user's email if available
    if (member.isClaimed === true || member.isClaimed === 1) {
      return member.userEmail || null
    }
    // For unclaimed profiles, show invitation email if available
    const invitation = member.invitationsSent?.[0]
    return invitation?.email || null
  }

  const getInvitationStatus = (member: any) => {
    const invitation = member.invitationsSent?.[0]
    if (!invitation) return "No Invitation"
    return invitation.status || "Unknown"
  }

  const filteredMembers = familyMembers.filter((member) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const fullName = `${member.firstName} ${member.middleName || ""} ${member.lastName} ${member.suffix || ""} ${member.maidenName || ""}`.toLowerCase()
      if (!fullName.includes(query)) return false
    }

    // Status filter
    if (statusFilter === "claimed" && !member.isClaimed) return false
    if (statusFilter === "unclaimed" && member.isClaimed) return false
    if (statusFilter === "pending" && (!member.invitationsSent?.[0] || member.invitationsSent[0].status !== "PENDING")) return false
    if (statusFilter === "admin" && !adminProfiles.has(member.id)) return false

    return true
  })

  const stats = {
    totalMembers: familyMembers.length,
    claimed: familyMembers.filter(m => m.isClaimed).length,
    unclaimed: familyMembers.filter(m => !m.isClaimed).length,
    pendingInvites: familyMembers.filter(m => 
      m.invitationsSent?.[0]?.status === "PENDING"
    ).length,
    adminAssignments: adminProfiles.size,
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading admin portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#819171]" />
            <div>
              <h1 className="text-3xl font-bold">Admin Portal</h1>
              <p className="text-gray-600">
                Manage family member profiles, invitations, and admin assignments
              </p>
            </div>
          </div>
          <Button
            onClick={handleSetupTestData}
            disabled={isSettingUpTestData}
            variant="outline"
            className="border-[#819171] text-[#819171] hover:bg-[#819171] hover:text-white"
          >
            {isSettingUpTestData ? "Setting up..." : "Setup Test Data"}
          </Button>
        </div>
      </div>

      <StatusSummary {...stats} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Family Members</CardTitle>
              <CardDescription>
                View and manage all family member profiles and their status
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 sm:w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="unclaimed">Unclaimed</SelectItem>
                  <SelectItem value="pending">Pending Invites</SelectItem>
                  <SelectItem value="admin">My Admin Roles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No family members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Suffix</TableHead>
                    <TableHead>Maiden Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invitation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const invitationEmail = getInvitationEmail(member)
                    const invitationStatus = getInvitationStatus(member)
                    
                    // Format birth date
                    const formatBirthDate = (date: Date | string | null | undefined) => {
                      if (!date) return "—"
                      try {
                        const d = typeof date === 'string' ? new Date(date) : date
                        if (isNaN(d.getTime())) return "—"
                        return d.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      } catch {
                        return "—"
                      }
                    }
                    
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.firstName} {member.middleName || ""} {member.lastName}
                        </TableCell>
                        <TableCell>
                          {member.suffix ? (
                            <span className="text-sm">{member.suffix}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.maidenName ? (
                            <span className="text-sm">{member.maidenName}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatBirthDate(member.birthDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {invitationEmail ? (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{invitationEmail}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getStatusBadges(member)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 capitalize">
                            {invitationStatus.toLowerCase().replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMember(member)
                                setIsProfileDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {!member.isClaimed && !invitationEmail && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenInviteDialog(member)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Invite
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMember && (
        <FullProfileDialog
          member={selectedMember}
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
          onUpdate={() => {
            fetchFamilyMembers()
            fetchAdminProfiles()
          }}
        />
      )}

      {/* Invitation Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#819171]" />
              Invite {inviteMember?.firstName} to Join
            </DialogTitle>
            <DialogDescription>
              Send an invitation so they can claim their profile, approve relationships, and add their own stories and photos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="family.member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inviteEmail && inviteEmail.includes("@")) {
                    handleSendInvitation()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendInvitation}
                disabled={isSendingInvite || !inviteEmail || !inviteEmail.includes("@")}
                className="bg-[#819171] text-white hover:bg-[#6e7a5d]"
              >
                {isSendingInvite ? (
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
        </DialogContent>
      </Dialog>
    </div>
  )
}

