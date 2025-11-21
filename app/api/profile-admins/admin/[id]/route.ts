import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { canManageAdmins } from '@/lib/permissions'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const admin = await prisma.profileAdmin.findUnique({
      where: { id },
    })

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin not found',
        },
        { status: 404 }
      )
    }

    // Verify user can manage admins
    const canManage = await canManageAdmins(admin.profileId, userId)
    if (!canManage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - you do not have permission to remove admins',
        },
        { status: 403 }
      )
    }

    await prisma.profileAdmin.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully',
    })
  } catch (error) {
    console.error('Error removing admin:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove admin',
      },
      { status: 500 }
    )
  }
}

