import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { canManageAdmins, isProfileOwner } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all admin assignments for the current user
    const admins = await prisma.profileAdmin.findMany({
      where: { adminUserId: userId },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Enrich with user info
    const enrichedAdmins = await Promise.all(
      admins.map(async (admin) => {
        const assignedByUser = await prisma.user.findUnique({
          where: { id: admin.assignedBy },
        })

        return {
          ...admin,
          assignedByUser: assignedByUser
            ? {
                id: assignedByUser.id,
                name: assignedByUser.name,
                email: assignedByUser.email,
              }
            : null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: { admins: enrichedAdmins },
    })
  } catch (error) {
    console.error('Error fetching admin profiles:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin profiles',
      },
      { status: 500 }
    )
  }
}

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
    const { profileId, adminUserId, canEditProfile, canManageAdmins: canManageAdminsFlag } = body

    if (!profileId || !adminUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'profileId and adminUserId are required',
        },
        { status: 400 }
      )
    }

    // Verify user can manage admins
    const canManage = await canManageAdmins(profileId, userId)
    if (!canManage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - you do not have permission to manage admins',
        },
        { status: 403 }
      )
    }

    // Verify profile exists and is claimed
    const profile = await prisma.familyMember.findUnique({
      where: { id: profileId },
    })

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not found',
        },
        { status: 404 }
      )
    }

    if (!profile.isClaimed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot assign admins to unclaimed profiles',
        },
        { status: 400 }
      )
    }

    // Verify admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
    })

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin user not found',
        },
        { status: 404 }
      )
    }

    // Check if already an admin
    const existing = await prisma.profileAdmin.findUnique({
      where: {
        profileId_adminUserId: {
          profileId,
          adminUserId,
        },
      },
    })

    if (existing) {
      // Update existing admin
      const updated = await prisma.profileAdmin.update({
        where: { id: existing.id },
        data: {
          canEditProfile: canEditProfile ?? existing.canEditProfile,
          canManageAdmins: canManageAdminsFlag ?? existing.canManageAdmins,
        },
      })

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Admin updated successfully',
      })
    }

    // Create new admin
    const admin = await prisma.profileAdmin.create({
      data: {
        profileId,
        adminUserId,
        assignedBy: userId,
        canEditProfile: canEditProfile ?? true,
        canManageAdmins: canManageAdminsFlag ?? false,
      },
    })

    return NextResponse.json({
      success: true,
      data: admin,
      message: 'Admin assigned successfully',
    })
  } catch (error) {
    console.error('Error assigning admin:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to assign admin',
      },
      { status: 500 }
    )
  }
}

