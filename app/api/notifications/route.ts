import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  getAllNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
} from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const notifications = await getAllNotifications(userId)
    const unreadCount = await getUnreadNotificationCount(userId)

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'read-all') {
      await markAllNotificationsRead(userId)
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notifications',
      },
      { status: 500 }
    )
  }
}

