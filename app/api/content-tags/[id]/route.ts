import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TagStatus } from '@prisma/client'
import { isProfileOwner } from '@/lib/permissions'

export async function POST(
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
    const body = await request.json()
    const { action } = body

    const tag = await prisma.contentTag.findUnique({
      where: { id },
      include: {
        taggedMember: true,
      },
    })

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag not found',
        },
        { status: 404 }
      )
    }

    // Verify user owns the profile or is the tagger
    const isOwner = await isProfileOwner(tag.taggedMemberId, userId)
    const isTagger = tag.taggedBy === userId

    if (!isOwner && !isTagger) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 403 }
      )
    }

    if (action === 'approve') {
      if (!isOwner) {
        return NextResponse.json(
          {
            success: false,
            error: 'Only profile owner can approve tags',
          },
          { status: 403 }
        )
      }

      await prisma.contentTag.update({
        where: { id },
        data: {
          status: TagStatus.APPROVED,
          reviewedAt: new Date(),
        },
      })
    } else if (action === 'deny') {
      if (!isOwner) {
        return NextResponse.json(
          {
            success: false,
            error: 'Only profile owner can deny tags',
          },
          { status: 403 }
        )
      }

      await prisma.contentTag.update({
        where: { id },
        data: {
          status: TagStatus.DENIED,
          reviewedAt: new Date(),
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be "approve" or "deny"',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Tag ${action === 'approve' ? 'approved' : 'denied'} successfully`,
    })
  } catch (error) {
    console.error('Error processing tag:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process tag',
      },
      { status: 500 }
    )
  }
}

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

    const tag = await prisma.contentTag.findUnique({
      where: { id },
    })

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag not found',
        },
        { status: 404 }
      )
    }

    // Only tagger or profile owner can delete
    const isOwner = await isProfileOwner(tag.taggedMemberId, userId)
    const isTagger = tag.taggedBy === userId

    if (!isOwner && !isTagger) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - only tagger or profile owner can delete',
        },
        { status: 403 }
      )
    }

    await prisma.contentTag.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete tag',
      },
      { status: 500 }
    )
  }
}

