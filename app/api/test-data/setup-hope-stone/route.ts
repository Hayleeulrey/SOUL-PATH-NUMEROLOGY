import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const results = {
      created: [] as string[],
      updated: [] as string[],
      errors: [] as string[],
    }

    // Find or create Hope Stone user
    let hopeUser = await prisma.user.findFirst({
      where: { email: 'hope.stone@example.com' },
    })

    if (!hopeUser) {
      hopeUser = await prisma.user.create({
        data: {
          id: `user_${randomUUID()}`,
          email: 'hope.stone@example.com',
          name: 'Hope Stone',
        },
      })
      results.created.push(`Created Hope Stone user (${hopeUser.id})`)
    } else {
      // Update name if needed
      if (hopeUser.name !== 'Hope Stone') {
        hopeUser = await prisma.user.update({
          where: { id: hopeUser.id },
          data: { name: 'Hope Stone' },
        })
        results.updated.push(`Updated Hope Stone user name (${hopeUser.id})`)
      } else {
        results.updated.push(`Hope Stone user already exists (${hopeUser.id})`)
      }
    }

    // Find or create Hope Stone profile
    let hopeProfile = await prisma.familyMember.findFirst({
      where: {
        firstName: 'Hope',
        lastName: 'Stone',
      },
    })

    if (!hopeProfile) {
      hopeProfile = await prisma.familyMember.create({
        data: {
          firstName: 'Hope',
          lastName: 'Stone',
          isAlive: true,
          isClaimed: true,
          userId: hopeUser.id,
          claimedAt: new Date(),
          createdBy: userId,
          bio: 'Hope Stone is a claimed profile with admin access for testing purposes.',
        },
      })
      results.created.push(`Created Hope Stone profile (${hopeProfile.id})`)
    } else {
      // Update to ensure it's claimed and linked to Hope's user
      hopeProfile = await prisma.familyMember.update({
        where: { id: hopeProfile.id },
        data: {
          isClaimed: true,
          userId: hopeUser.id,
          claimedAt: hopeProfile.claimedAt || new Date(),
          firstName: 'Hope',
          lastName: 'Stone',
        },
      })
      results.updated.push(`Updated Hope Stone profile (${hopeProfile.id})`)
    }

    // Create or update UserProfile link for Hope
    const existingUserProfile = await prisma.userProfile.findUnique({
      where: { userId: hopeUser.id },
    })

    if (!existingUserProfile) {
      await prisma.userProfile.create({
        data: {
          userId: hopeUser.id,
          familyMemberId: hopeProfile.id,
          onboardingComplete: true,
        },
      })
      results.created.push(`Created UserProfile link for Hope Stone`)
    } else {
      await prisma.userProfile.update({
        where: { userId: hopeUser.id },
        data: {
          familyMemberId: hopeProfile.id,
          onboardingComplete: true,
        },
      })
      results.updated.push(`Updated UserProfile link for Hope Stone`)
    }

    // Create ProfileAdmin for current user on Hope's profile
    const existingAdmin = await prisma.profileAdmin.findUnique({
      where: {
        profileId_adminUserId: {
          profileId: hopeProfile.id,
          adminUserId: userId,
        },
      },
    })

    if (!existingAdmin) {
      const admin = await prisma.profileAdmin.create({
        data: {
          profileId: hopeProfile.id,
          adminUserId: userId,
          assignedBy: hopeUser.id, // Hope assigned you as admin
          canEditProfile: true,
          canManageAdmins: false,
        },
      })
      results.created.push(`Created admin assignment for Hope Stone's profile (${admin.id})`)
    } else {
      // Update existing admin to ensure proper permissions
      await prisma.profileAdmin.update({
        where: { id: existingAdmin.id },
        data: {
          canEditProfile: true,
          assignedBy: hopeUser.id,
        },
      })
      results.updated.push(`Updated admin assignment for Hope Stone's profile (${existingAdmin.id})`)
    }

    return NextResponse.json({
      success: true,
      message: 'Hope Stone profile setup completed successfully',
      results,
      data: {
        hopeUser: {
          id: hopeUser.id,
          email: hopeUser.email,
          name: hopeUser.name,
        },
        hopeProfile: {
          id: hopeProfile.id,
          firstName: hopeProfile.firstName,
          lastName: hopeProfile.lastName,
          isClaimed: hopeProfile.isClaimed,
          userId: hopeProfile.userId,
        },
        adminSetup: {
          profileId: hopeProfile.id,
          adminUserId: userId,
        },
      },
    })
  } catch (error: any) {
    console.error('Error setting up Hope Stone profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to setup Hope Stone profile',
      },
      { status: 500 }
    )
  }
}

