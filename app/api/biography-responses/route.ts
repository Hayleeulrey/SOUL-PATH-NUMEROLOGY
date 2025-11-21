import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { familyMemberId, promptId, answer, audioFileId } = body

    if (!familyMemberId || !promptId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the family member exists
    const familyMember = await prisma.familyMember.findUnique({
      where: { id: familyMemberId },
    })

    if (!familyMember) {
      return NextResponse.json({ error: "Family member not found" }, { status: 404 })
    }

    // Check permissions - anyone can add biography responses, but if profile is claimed
    // and user is not owner/admin, we'll create an approval record
    const { canEditProfile } = await import('@/lib/permissions')
    const canEdit = await canEditProfile(familyMemberId, userId)

    const response = await prisma.biographyResponse.create({
      data: {
        familyMemberId,
        promptId,
        answer,
        audioFileId,
        createdBy: userId,
      },
    })

    // If profile is claimed and user doesn't have edit permissions, create approval record
    if (familyMember.isClaimed && !canEdit) {
      const { createContentWithApproval } = await import('@/lib/content-helpers')
      await createContentWithApproval('biography', response.id, familyMemberId, userId)
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error("Error creating biography response:", error)
    return NextResponse.json(
      { error: "Failed to create response", details: String(error) },
      { status: 500 }
    )
  }
}

