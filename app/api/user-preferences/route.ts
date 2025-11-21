import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let preference = await prisma.userPreference.findUnique({
      where: { userId },
    })

    // Create default preference if doesn't exist
    if (!preference) {
      preference = await prisma.userPreference.create({
        data: {
          userId,
          allowTaggingWithoutPermission: true,
          emailNotifications: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: preference,
    })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user preferences',
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
    const { allowTaggingWithoutPermission, emailNotifications } = body

    const preference = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        ...(allowTaggingWithoutPermission !== undefined && {
          allowTaggingWithoutPermission,
        }),
        ...(emailNotifications !== undefined && { emailNotifications }),
      },
      create: {
        userId,
        allowTaggingWithoutPermission:
          allowTaggingWithoutPermission ?? true,
        emailNotifications: emailNotifications ?? true,
      },
    })

    return NextResponse.json({
      success: true,
      data: preference,
      message: 'Preferences updated successfully',
    })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user preferences',
      },
      { status: 500 }
    )
  }
}

