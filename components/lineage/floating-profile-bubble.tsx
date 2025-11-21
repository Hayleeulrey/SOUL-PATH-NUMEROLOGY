"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { UserCircle, Sparkles } from "lucide-react"
import { FamilyMemberWithRelations } from "@/lib/lineage-types"
import { Badge } from "@/components/ui/badge"

interface FloatingProfileBubbleProps {
  member: FamilyMemberWithRelations | null
  onOpenProfile: () => void
}

export function FloatingProfileBubble({ member, onOpenProfile }: FloatingProfileBubbleProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (!member) return null

  const profilePhoto = member.photos?.find(p => p.isProfile)
  const storiesCount = member.stories?.length || 0
  const photosCount = member.photos?.filter(p => !p.isProfile).length || 0

  return (
    <div
      className="fixed top-20 right-6 z-40 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={onOpenProfile}
        className={`
          bg-white rounded-2xl shadow-lg border-2 border-[#819171] 
          cursor-pointer transition-all duration-300 overflow-hidden
          ${isHovered ? 'shadow-xl scale-105' : 'shadow-md'}
        `}
      >
        <div className="p-4 flex flex-col items-center gap-3 min-w-[140px]">
          {/* Profile Photo/Avatar */}
          <div className="relative">
            {profilePhoto ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#819171]">
                <img
                  src={profilePhoto.filePath}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#819171]/20 to-gray-100 border-2 border-[#819171] flex items-center justify-center">
                <span className="text-2xl font-light text-[#819171]">
                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                </span>
              </div>
            )}
            {/* "You" Badge */}
            <div className="absolute -top-1 -right-1">
              <Badge className="bg-[#819171] text-white text-xs px-2 py-0.5 border-2 border-white">
                <UserCircle className="h-3 w-3 mr-1" />
                You
              </Badge>
            </div>
          </div>

          {/* Name */}
          <div className="text-center">
            <h3 className="font-medium text-gray-900 text-sm leading-tight">
              {member.firstName} {member.lastName}
            </h3>
          </div>

          {/* Quick Stats - Show on hover */}
          {isHovered && (
            <div className="flex gap-2 mt-1 animate-in fade-in duration-200">
              {storiesCount > 0 && (
                <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                  {storiesCount} {storiesCount === 1 ? 'story' : 'stories'}
                </div>
              )}
              {photosCount > 0 && (
                <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                  {photosCount} {photosCount === 1 ? 'photo' : 'photos'}
                </div>
              )}
            </div>
          )}

          {/* Click hint */}
          <div className="text-xs text-gray-500 mt-1 text-center">
            Click to view profile
          </div>
        </div>
      </div>
    </div>
  )
}

