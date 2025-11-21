import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Step 1: Get all family members that belong to this user
    const userFamilyMembers = await prisma.familyMember.findMany({
      where: { userId },
      select: { id: true },
    })

    const userFamilyMemberIds = userFamilyMembers.map(m => m.id)

    // If no family members found, return early
    if (userFamilyMemberIds.length === 0) {
      return NextResponse.json([])
    }

    // Step 2: Find all relationships where user's members are involved
    const userRelationships = await prisma.relationship.findMany({
      where: {
        OR: [
          { personId: { in: userFamilyMemberIds } },
          { relatedId: { in: userFamilyMemberIds } },
        ],
      },
      select: {
        personId: true,
        relatedId: true,
      },
    })

    // Step 3: Collect all related member IDs (members related to user's members)
    const relatedMemberIds = new Set<string>()
    userRelationships.forEach(rel => {
      if (!userFamilyMemberIds.includes(rel.personId)) {
        relatedMemberIds.add(rel.personId)
      }
      if (!userFamilyMemberIds.includes(rel.relatedId)) {
        relatedMemberIds.add(rel.relatedId)
      }
    })

    // Step 4: Get all relevant member IDs (user's members + related members)
    const allRelevantIds = [...userFamilyMemberIds, ...Array.from(relatedMemberIds)]

    // Step 5: Get all relationships involving any of these members
    // This ensures relationships show up for both people in the relationship
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [
          {
            personId: { in: allRelevantIds },
          },
          {
            relatedId: { in: allRelevantIds },
          },
        ],
      },
      include: {
        person: true,
        related: true,
      },
    })

    return NextResponse.json(relationships)
  } catch (error) {
    console.error("Error fetching relationships:", error)
    return NextResponse.json(
      { error: "Failed to fetch relationships" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      personId,
      relatedId,
      relationshipType,
      notes,
    } = body

    // Validate that both family members exist and belong to the user
    const [person, related] = await Promise.all([
      prisma.familyMember.findUnique({ where: { id: personId } }),
      prisma.familyMember.findUnique({ where: { id: relatedId } }),
    ])

    if (!person || !related) {
      return NextResponse.json(
        { error: "One or both family members not found" },
        { status: 404 }
      )
    }

    // Verify both family members belong to the user - use type assertion for userId
    const personUserId = (person as any).userId
    const relatedUserId = (related as any).userId
    
    if (personUserId !== userId || relatedUserId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - family members must belong to you" },
        { status: 403 }
      )
    }

    // Check if relationship already exists (in either direction)
    // Only reject if the existing relationship is between members that BOTH belong to this user
    // This allows creating relationships even if unassigned members (userId = null) have relationships
    const existingRelationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          {
            personId: personId,
            relatedId: relatedId,
          },
          {
            personId: relatedId,
            relatedId: personId,
          },
        ],
      },
      include: {
        person: true,
        related: true,
      },
    })

    if (existingRelationship) {
      const existingPerson = existingRelationship.person as any
      const existingRelated = existingRelationship.related as any
      
      // Only reject if BOTH members in the existing relationship belong to this user
      // This means the user already has this relationship and shouldn't create a duplicate
      const existingPersonBelongsToUser = existingPerson.userId === userId
      const existingRelatedBelongsToUser = existingRelated.userId === userId
      
      if (existingPersonBelongsToUser && existingRelatedBelongsToUser) {
        console.log('Rejecting: Relationship already exists for user', {
          userId,
          personId,
          relatedId,
          existingPersonUserId: existingPerson.userId,
          existingRelatedUserId: existingRelated.userId
        })
        return NextResponse.json(
          { error: "Relationship already exists between these family members" },
          { status: 400 }
        )
      }
      
      // If the existing relationship involves unassigned members (userId = null or different user),
      // we allow creating a new relationship for the user's members
      console.log('Allowing: Existing relationship is for different/unassigned members', {
        userId,
        personId,
        relatedId,
        existingPersonUserId: existingPerson.userId,
        existingRelatedUserId: existingRelated.userId
      })
    }

    const relationship = await prisma.relationship.create({
      data: {
        personId,
        relatedId,
        relationshipType,
        notes,
        createdBy: userId,
      },
      include: {
        person: true,
        related: true,
      },
    })

    // Create approval records if either profile is claimed
    const { createContentWithApproval } = await import('@/lib/content-helpers')
    
    // Check if person's profile is claimed
    if ((person as any).isClaimed && (person as any).userId !== userId) {
      await createContentWithApproval('relationship', relationship.id, personId, userId)
    }
    
    // Check if related's profile is claimed
    if ((related as any).isClaimed && (related as any).userId !== userId) {
      await createContentWithApproval('relationship', relationship.id, relatedId, userId)
    }

    return NextResponse.json(relationship)
  } catch (error) {
    console.error("Error creating relationship:", error)
    return NextResponse.json(
      { error: "Failed to create relationship" },
      { status: 500 }
    )
  }
}
