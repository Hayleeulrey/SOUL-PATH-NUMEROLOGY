"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreePine, Users, Eye } from "lucide-react"
import { FamilyMemberWithRelations } from "@/lib/lineage-types"

export function FamilyTreeView() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFamilyMembers()
  }, [])

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/family-members")
      const result = await response.json()
      
      if (result.success) {
        setFamilyMembers(result.data)
      }
    } catch (err) {
      console.error("Failed to fetch family members:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown"
    return new Date(date).getFullYear().toString()
  }

  const getGenerationLevel = (member: FamilyMemberWithRelations): number => {
    // Simple generation calculation based on relationships
    const parentRelations = member.relationshipsAsRelated.filter(
      rel => rel.relationshipType === "PARENT"
    )
    
    if (parentRelations.length === 0) {
      // No parents found, assume oldest generation
      return 0
    }
    
    // Find the oldest parent's generation and add 1
    const parentGenerations = parentRelations.map(rel => {
      const parent = familyMembers.find(m => m.id === rel.personId)
      return parent ? getGenerationLevel(parent) : 0
    })
    
    return Math.max(...parentGenerations) + 1
  }

  const groupByGeneration = () => {
    const generations: { [key: number]: FamilyMemberWithRelations[] } = {}
    
    familyMembers.forEach(member => {
      const level = getGenerationLevel(member)
      if (!generations[level]) {
        generations[level] = []
      }
      generations[level].push(member)
    })
    
    return generations
  }

  const generations = groupByGeneration()
  const maxGeneration = Math.max(...Object.keys(generations).map(Number))

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-[#E07A5F] to-[#D46B4F] text-white rounded-t-lg">
        <CardTitle className="text-2xl flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <TreePine className="h-6 w-6" />
          </div>
          Family Tree
        </CardTitle>
        <CardDescription className="text-white/90 text-base">
          Visual representation of your family lineage
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading family tree...</p>
          </div>
        ) : familyMembers.length === 0 ? (
          <div className="text-center py-8">
            <TreePine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No family members to display</p>
            <p className="text-sm text-gray-400">
              Add family members to see your family tree
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Family Tree Visualization */}
            <div className="overflow-x-auto bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
              <div className="flex gap-8 min-w-max">
                {Array.from({ length: maxGeneration + 1 }, (_, generation) => (
                  <div key={generation} className="flex flex-col gap-6 min-w-[220px]">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                        <div className="w-2 h-2 bg-[#E07A5F] rounded-full"></div>
                        <h3 className="text-sm font-semibold text-[#333333]">
                          Generation {generation + 1}
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {generations[generation]?.map((member) => (
                        <div
                          key={member.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-[#E07A5F]/30 transition-all duration-200 group cursor-pointer"
                        >
                          <div className="text-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#E07A5F] to-[#D46B4F] rounded-full flex items-center justify-center text-white font-semibold text-sm mx-auto mb-3">
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </div>
                            <h4 className="font-semibold text-[#333333] text-sm group-hover:text-[#E07A5F] transition-colors">
                              {member.firstName} {member.lastName}
                            </h4>
                            <div className="flex items-center justify-center gap-1 mt-1 mb-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${member.isAlive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <p className="text-xs text-gray-600">
                                {formatDate(member.birthDate)} - {member.isAlive ? "Present" : formatDate(member.deathDate)}
                              </p>
                            </div>
                                   {((member as any).birthCity || (member as any).birthState || (member as any).birthCountry) && (
                                     <p className="text-xs text-gray-500 mb-3">
                                       {[
                                         (member as any).birthCity,
                                         (member as any).birthState,
                                         (member as any).birthCountry
                                       ].filter(Boolean).join(", ")}
                                     </p>
                                   )}
                            <div className="flex justify-center gap-1">
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                                {member.stories.length} stories
                              </span>
                              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                                {member.photos.length} photos
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Family Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {familyMembers.length}
                </div>
                <div className="text-sm text-blue-700 font-medium uppercase tracking-wide">Total Members</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {familyMembers.filter(m => m.isAlive).length}
                </div>
                <div className="text-sm text-green-700 font-medium uppercase tracking-wide">Living</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {familyMembers.reduce((sum, m) => sum + m.stories.length, 0)}
                </div>
                <div className="text-sm text-purple-700 font-medium uppercase tracking-wide">Stories</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {familyMembers.reduce((sum, m) => sum + m.photos.length, 0)}
                </div>
                <div className="text-sm text-orange-700 font-medium uppercase tracking-wide">Photos</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Full Tree
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Users className="h-4 w-4 mr-2" />
                Manage Relationships
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
