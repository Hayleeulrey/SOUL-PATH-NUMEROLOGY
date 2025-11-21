import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { canEditProfile, isProfileAdmin, isProfileOwner, isOriginalCreator } from '@/lib/permissions'

export async function GET(
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

    const resolvedParams = await params
    const { id } = resolvedParams

    const [canEdit, isAdmin, isOwner, isCreator] = await Promise.all([
      canEditProfile(id, userId),
      isProfileAdmin(id, userId),
      isProfileOwner(id, userId),
      isOriginalCreator(id, userId),
    ])

    return NextResponse.json({
      success: true,
      data: {
        canEdit,
        isAdmin,
        isOwner,
        isCreator,
      },
    })
  } catch (error) {
    console.error('Error checking permissions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check permissions',
      },
      { status: 500 }
    )
  }
}

