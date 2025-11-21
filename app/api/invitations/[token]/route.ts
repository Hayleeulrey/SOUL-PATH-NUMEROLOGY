import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invitation = await prisma.familyInvitation.findUnique({
      where: { token },
      include: {
        familyMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            maidenName: true,
            suffix: true,
            birthDate: true,
            birthCity: true,
            birthState: true,
            birthCountry: true,
            isClaimed: true,
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invitation not found',
        },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json({
        success: true,
        invitation,
        expired: true,
      })
    }

    return NextResponse.json({
      success: true,
      invitation,
    })
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch invitation',
      },
      { status: 500 }
    )
  }
}

