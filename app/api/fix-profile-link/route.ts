import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, email } = body

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // Get the current user's email from Clerk to verify
    const clerkClientInstance = await clerkClient()
    const clerkUser = await clerkClientInstance.users.getUser(userId)
    const userEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Could not find your email address in Clerk' },
        { status: 400 }
      )
    }

    // If email is provided, verify it matches
    if (email && userEmail.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return NextResponse.json(
        { success: false, error: `Email mismatch. You're signed in as ${userEmail}, but provided ${email}` },
        { status: 400 }
      )
    }

    // First, check if user is already linked to a different profile
    const currentLinkedProfile = await prisma.familyMember.findFirst({
      where: { userId },
    })

    if (currentLinkedProfile) {
      console.log(`User is currently linked to: ${currentLinkedProfile.firstName} ${currentLinkedProfile.lastName}`)
      
      // Unlink the current profile (set userId to null, but keep isClaimed as true for history)
      await prisma.familyMember.update({
        where: { id: currentLinkedProfile.id },
        data: {
          userId: null,
          // Don't set isClaimed to false - keep it as true to show it was claimed before
        },
      })
    }

    // Find the family member profile we want to link to
    // SQLite doesn't support case-insensitive mode well, so we'll search all and filter
    const allMembers = await prisma.familyMember.findMany()
    const familyMember = allMembers.find(
      m => m.firstName.toLowerCase().trim() === firstName.toLowerCase().trim() &&
           m.lastName.toLowerCase().trim() === lastName.toLowerCase().trim()
    ) || null

    if (!familyMember) {
      return NextResponse.json(
        { success: false, error: `Profile not found for ${firstName} ${lastName}` },
        { status: 404 }
      )
    }

    // Check if this profile is already linked to a different user
    if (familyMember.userId && familyMember.userId !== userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: `This profile is already linked to another user. Please contact support to transfer it.` 
        },
        { status: 400 }
      )
    }

    // Update the family member to link to current user
    const updated = await prisma.familyMember.update({
      where: { id: familyMember.id },
      data: {
        userId,
        isClaimed: true,
        claimedAt: new Date(),
      },
    })

    // Update or create user profile link
    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        familyMemberId: familyMember.id,
      },
      create: {
        userId,
        familyMemberId: familyMember.id,
        onboardingComplete: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully linked ${userEmail} to ${firstName} ${lastName} profile`,
      data: {
        familyMemberId: familyMember.id,
        userId,
        email: userEmail,
      },
    })
  } catch (error: any) {
    console.error('Error fixing profile link:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fix profile link',
        details: error?.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    )
  }
}

