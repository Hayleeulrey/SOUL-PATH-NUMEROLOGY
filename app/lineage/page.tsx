"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { FamilyMemberManagement } from "./components/family-member-management"
import { FamilyTreeView } from "./components/family-tree-view"
import { Users, TreePine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FamilyMemberWithRelations } from "@/lib/lineage-types"

export default function LineagePage() {
  const [activeView, setActiveView] = useState<'directory' | 'tree'>('directory')
  const router = useRouter()
  const { userId } = useAuth()
  const [familyStats, setFamilyStats] = useState<{
    totalMembers: number
    living: number
    deceased: number
    totalStories: number
    totalPhotos: number
  } | null>(null)

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!userId) return

      try {
        const response = await fetch("/api/user-profile")
        const result = await response.json()

        console.log("Onboarding check result:", result)

        // Check if onboarding is complete (handle both boolean and number from SQLite)
        const isComplete = result.data?.onboardingComplete === true || 
                          result.data?.onboardingComplete === 1 ||
                          result.data?.onboardingComplete === "1" ||
                          Boolean(result.data?.onboardingComplete)
        
        console.log("Is onboarding complete?", isComplete, "Value:", result.data?.onboardingComplete, "Type:", typeof result.data?.onboardingComplete)
        
        // TEMPORARILY DISABLED: Allow access even if onboarding not complete
        // This prevents redirect loops while we debug
        // TODO: Re-enable once we confirm the boolean check works correctly
        /*
        if (!result.data || !isComplete) {
          console.log("Redirecting to onboarding - profile:", !!result.data, "complete:", isComplete)
          router.push("/onboarding")
        } else {
          console.log("Onboarding complete, allowing access")
        }
        */
        console.log("Onboarding check complete - allowing access for debugging")
      } catch (error) {
        console.error("Error checking onboarding:", error)
        // If there's an error, don't redirect - allow access
      }
    }

    checkOnboarding()
  }, [userId, router])

  // Fetch family stats for hero section
  useEffect(() => {
    const fetchFamilyStats = async () => {
      try {
        const response = await fetch("/api/family-members")
        const result = await response.json()
        
        if (result.success && result.data) {
          const members: FamilyMemberWithRelations[] = result.data
          const stats = {
            totalMembers: members.length,
            living: members.filter(m => m.isAlive).length,
            deceased: members.filter(m => !m.isAlive).length,
            totalStories: members.reduce((sum, m) => sum + (m.stories?.length || 0), 0),
            totalPhotos: members.reduce((sum, m) => sum + (m.photos?.filter(p => !p.isProfile).length || 0), 0),
          }
          setFamilyStats(stats)
        }
      } catch (error) {
        console.error("Error fetching family stats:", error)
      }
    }
    
    if (userId) {
      fetchFamilyStats()
    }
  }, [userId])

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-4 tracking-tight">
            Family Directory
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Discover the connections and stories that weave through your family tree. 
            Explore relationships, preserve memories, and honor your ancestors.
          </p>
          
          {/* Family Stats */}
          {familyStats && familyStats.totalMembers > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="text-3xl font-light text-blue-600 mb-1">
                  {familyStats.totalMembers}
                </div>
                <div className="text-xs text-blue-700 font-medium uppercase tracking-wide">
                  Total Members
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="text-3xl font-light text-green-600 mb-1">
                  {familyStats.living}
                </div>
                <div className="text-xs text-green-700 font-medium uppercase tracking-wide">
                  Living
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="text-3xl font-light text-gray-600 mb-1">
                  {familyStats.deceased}
                </div>
                <div className="text-xs text-gray-700 font-medium uppercase tracking-wide">
                  Deceased
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="text-3xl font-light text-purple-600 mb-1">
                  {familyStats.totalStories}
                </div>
                <div className="text-xs text-purple-700 font-medium uppercase tracking-wide">
                  Stories
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="text-3xl font-light text-orange-600 mb-1">
                  {familyStats.totalPhotos}
                </div>
                <div className="text-xs text-orange-700 font-medium uppercase tracking-wide">
                  Photos
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-2xl p-1 flex">
            <Button
              variant={activeView === 'directory' ? 'default' : 'ghost'}
              onClick={() => setActiveView('directory')}
              className={`px-8 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeView === 'directory' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Directory
            </Button>
            <Button
              variant={activeView === 'tree' ? 'default' : 'ghost'}
              onClick={() => setActiveView('tree')}
              className={`px-8 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeView === 'tree' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <TreePine className="h-4 w-4 mr-2" />
              Family Tree
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {activeView === 'directory' ? (
            <FamilyMemberManagement />
          ) : (
            <FamilyTreeView />
          )}
        </div>
      </div>
    </div>
  )
}