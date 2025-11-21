import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        familyMember: true
      }
    })

    return NextResponse.json({ success: true, data: userProfile })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
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
    const { familyMemberId, onboardingComplete, onboardingStep } = body

    const userProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        familyMemberId,
        onboardingComplete,
        onboardingStep,
      },
      create: {
        userId,
        familyMemberId,
        onboardingComplete: false,
        onboardingStep: 0,
      },
    })

    // Ensure the linked FamilyMember has userId set for consistency
    if (familyMemberId) {
      await prisma.familyMember.update({
        where: { id: familyMemberId },
        data: {
          userId,
          isClaimed: true,
          claimedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, data: userProfile })
  } catch (error) {
    console.error("Error creating user profile:", error)
    return NextResponse.json(
      { error: "Failed to create user profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { familyMemberId, onboardingComplete, onboardingStep } = body

    const userProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(familyMemberId !== undefined && { familyMemberId }),
        ...(onboardingComplete !== undefined && { onboardingComplete }),
        ...(onboardingStep !== undefined && { onboardingStep }),
      },
      create: {
        userId,
        familyMemberId: familyMemberId || null,
        onboardingComplete: onboardingComplete || false,
        onboardingStep: onboardingStep || 0,
      },
    })

    // Ensure the linked FamilyMember has userId set for consistency
    if (familyMemberId) {
      await prisma.familyMember.update({
        where: { id: familyMemberId },
        data: {
          userId,
          isClaimed: true,
          claimedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, data: userProfile })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    )
  }
}
