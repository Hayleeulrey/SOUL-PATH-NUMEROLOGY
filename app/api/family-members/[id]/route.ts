import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const familyMember = await prisma.familyMember.findUnique({
      where: {
        id,
      },
      include: {
        relationshipsAsPerson: {
          include: {
            related: true,
          },
        },
        relationshipsAsRelated: {
          include: {
            person: true,
          },
        },
        photos: true,
        audioFiles: true,
        documents: true,
        stories: true,
        numerologyProfile: true,
      },
    })

    if (!familyMember) {
      return NextResponse.json(
        {
          success: false,
          error: 'Family member not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: familyMember,
    })
  } catch (error) {
    console.error('Error fetching family member:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch family member',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const {
      firstName,
      middleName,
      lastName,
      maidenName,
      birthDate,
      deathDate,
      birthCity,
      birthState,
      birthCountry,
      deathCity,
      deathState,
      deathCountry,
      bio,
      notes,
      isAlive,
    } = body

    // Check permissions
    const { canEditProfile } = await import('@/lib/permissions')
    const canEdit = await canEditProfile(id, userId)

    if (!canEdit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - you do not have permission to edit this profile',
        },
        { status: 403 }
      )
    }

    // Helper to parse date string in local timezone (avoids UTC conversion issues)
    const parseLocalDate = (dateString: string | null | undefined): Date | null => {
      if (!dateString) return null
      // Parse YYYY-MM-DD format and create date in local timezone
      const [year, month, day] = dateString.split('-').map(Number)
      if (year && month && day) {
        return new Date(year, month - 1, day)
      }
      return null
    }

    const familyMember = await prisma.familyMember.update({
      where: {
        id,
      },
      data: {
        firstName,
        middleName,
        lastName,
        maidenName,
        birthDate: parseLocalDate(birthDate),
        deathDate: parseLocalDate(deathDate),
        birthCity,
        birthState,
        birthCountry,
        deathCity,
        deathState,
        deathCountry,
        bio,
        notes,
        isAlive,
      },
      include: {
        relationshipsAsPerson: {
          include: {
            related: true,
          },
        },
        relationshipsAsRelated: {
          include: {
            person: true,
          },
        },
        photos: true,
        audioFiles: true,
        documents: true,
        stories: true,
        numerologyProfile: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: familyMember,
      message: 'Family member updated successfully',
    })
  } catch (error) {
    console.error('Error updating family member:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update family member',
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
    const { id } = await params
    const { userId } = await auth()
    
    console.log('DELETE request - userId:', userId, 'familyMemberId:', id)

    if (!userId) {
      console.log('No userId found, returning unauthorized')
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if the family member exists and belongs to the user
    const familyMember = await prisma.familyMember.findUnique({
      where: {
        id,
      },
    })

    console.log('Family member found:', familyMember ? 'yes' : 'no')
    console.log('Family member userId:', familyMember?.userId)
    console.log('Current userId:', userId)

    if (!familyMember) {
      console.log('Family member not found')
      return NextResponse.json(
        {
          success: false,
          error: 'Family member not found',
        },
        { status: 404 }
      )
    }

    // Only allow deletion if the family member belongs to the current user
    if (familyMember.userId !== userId) {
      console.log('User not authorized to delete this family member')
      console.log('Family member userId:', familyMember.userId)
      console.log('Current userId:', userId)
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized to delete this family member',
        },
        { status: 403 }
      )
    }

    console.log('Attempting to delete family member')
    await prisma.familyMember.delete({
      where: {
        id,
      },
    })

    console.log('Family member deleted successfully')
    return NextResponse.json({
      success: true,
      message: 'Family member deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting family member:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete family member',
      },
      { status: 500 }
    )
  }
}
