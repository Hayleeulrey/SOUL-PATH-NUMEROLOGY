import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { profileId } = await params

    const admins = await prisma.profileAdmin.findMany({
      where: { profileId },
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
        const user = await prisma.user.findUnique({
          where: { id: admin.adminUserId },
        })

        const assignedByUser = await prisma.user.findUnique({
          where: { id: admin.assignedBy },
        })

        return {
          ...admin,
          adminUser: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
              }
            : null,
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
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admins',
      },
      { status: 500 }
    )
  }
}

