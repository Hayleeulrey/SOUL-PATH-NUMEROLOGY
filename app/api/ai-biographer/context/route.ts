import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const familyMemberId = searchParams.get("familyMemberId")

    if (!familyMemberId) {
      return NextResponse.json(
        { error: "familyMemberId is required" },
        { status: 400 }
      )
    }

    // Fetch comprehensive context about the family member
    const member = await prisma.familyMember.findUnique({
      where: { id: familyMemberId },
      include: {
        relationshipsAsPerson: {
          include: {
            related: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        relationshipsAsRelated: {
          include: {
            person: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        photos: true,
        audioFiles: true,
        documents: true,
        stories: true,
        biographyResponses: {
          include: {
            prompt: true
          }
        },
        numerologyProfile: true
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: "Family member not found" },
        { status: 404 }
      )
    }

    // Build detailed relationships for better context
    // Combine both directions: where they're the person and where they're the related person
    const relationshipsAsPerson = member.relationshipsAsPerson.map(r => ({
      type: r.relationshipType,
      relatedTo: r.related ? `${r.related.firstName} ${r.related.lastName || ''}`.trim() : 'Unknown',
      relatedId: r.relatedId,
      notes: r.notes
    }))
    
    // When they're the "related" person, the type is already from the correct perspective
    const relationshipsAsRelated = member.relationshipsAsRelated.map(r => ({
      type: r.relationshipType, // Keep as-is, already correct from their perspective
      relatedTo: r.person ? `${r.person.firstName} ${r.person.lastName || ''}`.trim() : 'Unknown',
      relatedId: r.personId,
      notes: r.notes
    }))
    
    const relationshipsWithDetails = [...relationshipsAsPerson, ...relationshipsAsRelated]

    // Build the AI's "brain" - what it knows
    const context = {
      member: {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        birthDate: member.birthDate,
        isAlive: member.isAlive,
        birthLocation: member.birthCity || member.birthState || member.birthCountry
      },
      hasExistingData: {
        relationships: member.relationshipsAsPerson.length > 0 || member.relationshipsAsRelated.length > 0,
        photos: member.photos.length > 0,
        audio: member.audioFiles.length > 0,
        videos: member.documents.filter(d => d.mimeType?.startsWith('video')).length > 0,
        stories: member.stories.length > 0,
        biography: member.biographyResponses.length > 0,
        numerology: !!member.numerologyProfile
      },
      dataCounts: {
        relationships: member.relationshipsAsPerson.length + member.relationshipsAsRelated.length,
        photos: member.photos.length,
        audioFiles: member.audioFiles.length,
        documents: member.documents.length,
        stories: member.stories.length,
        biographyResponses: member.biographyResponses.length
      },
      relationships: relationshipsWithDetails,
      suggestedTopics: generateSuggestedTopics(member, relationshipsWithDetails),
      // Track what's missing to help guide the conversation
      missingData: {
        hasNoRelationships: member.relationshipsAsPerson.length === 0 && member.relationshipsAsRelated.length === 0,
        hasNoPhotos: member.photos.length === 0,
        hasNoAudio: member.audioFiles.length === 0,
        hasNoStories: member.stories.length === 0,
        hasNoBiography: member.biographyResponses.length === 0
      },
      // This is the AI's "brain" - what it knows to ask about
      knownInformation: {
        hasName: !!member.firstName,
        hasBirthInfo: !!(member.birthDate || member.birthCity),
        hasFamily: member.relationshipsAsPerson.length > 0 || member.relationshipsAsRelated.length > 0,
        hasMedia: member.photos.length > 0 || member.audioFiles.length > 0,
        hasStories: member.stories.length > 0
      }
    }

    return NextResponse.json({ success: true, data: { context } })
  } catch (error) {
    console.error("Error fetching AI context:", error)
    return NextResponse.json(
      { error: "Failed to fetch context", details: String(error) },
      { status: 500 }
    )
  }
}

function generateSuggestedTopics(member: any, relationships: any[]): string[] {
  const topics: string[] = []
  const totalRelationships = (member.relationshipsAsPerson?.length || 0) + (member.relationshipsAsRelated?.length || 0)
  
  const hasExistingData = {
    childhood: member.biographyResponses.some((r: any) => r.prompt.category === "CHILDHOOD"),
    family: member.biographyResponses.some((r: any) => r.prompt.category === "FAMILY"),
    career: member.biographyResponses.some((r: any) => r.prompt.category === "CAREER"),
    education: member.biographyResponses.some((r: any) => r.prompt.category === "EDUCATION"),
    relationships: totalRelationships > 0,
    traditions: member.biographyResponses.some((r: any) => r.prompt.category === "TRADITIONS")
  }

  // Prioritize missing content
  if (!hasExistingData.childhood) topics.push("childhood memories")
  if (!hasExistingData.family && relationships.length > 0) {
    // Find specific family members we could ask about
    const familyMembers = relationships.map(r => r.relatedTo).filter(Boolean)
    if (familyMembers.length > 0) {
      topics.push(`stories about ${familyMembers.slice(0, 2).join(' and ')}`)
    } else {
      topics.push("family relationships")
    }
  }
  if (!hasExistingData.career) topics.push("career and work life")
  if (!hasExistingData.education) topics.push("education and learning")
  if (member.photos.length > 0) topics.push("the stories behind your photos")
  if (member.audioFiles.length === 0) topics.push("recording an audio memory")
  
  // Add relationship-specific prompts
  if (relationships.length > 0 && !hasExistingData.family) {
    const parentRelations = relationships.filter(r => r.type === 'PARENT' || r.type === 'CHILD')
    const siblingRelations = relationships.filter(r => r.type === 'SIBLING')
    
    if (parentRelations.length > 0) {
      topics.push("family upbringing and parental influence")
    }
    if (siblingRelations.length > 0) {
      topics.push("sibling memories and adventures")
    }
  }

  return topics.length > 0 ? topics : ["early life", "family history", "personal values"]
}

