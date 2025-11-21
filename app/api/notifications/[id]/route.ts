import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { markNotificationRead } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

export async function PATCH(
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

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notification not found',
        },
        { status: 404 }
      )
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { isRead } = body

    if (isRead === false) {
      // Mark as unread
      await prisma.notification.update({
        where: { id },
        data: {
          isRead: false,
          readAt: null,
        },
      })
    } else {
      // Mark as read
      await markNotificationRead(id)
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated',
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notification',
      },
      { status: 500 }
    )
  }
}

