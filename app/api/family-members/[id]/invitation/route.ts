import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { randomUUID } from 'crypto'
import { sendFamilyInvitationEmail } from '@/lib/email-notifications'

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

    const { id } = await params

    // Get the most recent invitation for this family member
    const invitation = await prisma.familyInvitation.findFirst({
      where: {
        familyMemberId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      invitation: invitation || null,
    })
  } catch (error: any) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch invitation',
      },
      { status: 500 }
    )
  }
}

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
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Verify the family member exists and user has access
    const familyMember = await prisma.familyMember.findUnique({
      where: { id },
    })

    if (!familyMember) {
      return NextResponse.json(
        { success: false, error: 'Family member not found' },
        { status: 404 }
      )
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.familyInvitation.findFirst({
      where: {
        familyMemberId: id,
        email: email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
    })

    if (existingInvitation) {
      return NextResponse.json({
        success: true,
        invitation: existingInvitation,
        message: 'Invitation already exists and is pending',
      })
    }

    // Create new invitation
    const token = randomUUID()
    const invitation = await prisma.familyInvitation.create({
      data: {
        inviterId: userId,
        familyMemberId: id,
        email: email,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'PENDING' as any, // InvitationStatus enum
      },
    })

    console.log('Invitation created for family member:', id, email)

    // Send invitation email
    let emailSent = false
    let emailError: string | null = null
    
    try {
      // Get inviter's name
      const inviter = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      })
      const inviterName = inviter?.name || inviter?.email || 'A family member'

      // Get family member's name
      const familyMemberName = `${familyMember.firstName} ${familyMember.lastName}`

      await sendFamilyInvitationEmail(
        email,
        token,
        inviterName,
        familyMemberName
      )
      emailSent = true
      console.log('✅ Invitation email sent successfully to:', email)
    } catch (error: any) {
      emailError = error?.message || 'Unknown error'
      console.error('❌ Error sending invitation email:', error)
      // Don't fail the request if email fails - invitation is still created
    }

    return NextResponse.json({
      success: true,
      invitation,
      message: emailSent 
        ? 'Invitation created and email sent successfully' 
        : 'Invitation created, but email sending failed',
      emailSent,
      emailError: emailError || undefined,
    })
  } catch (error: any) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to create invitation',
      },
      { status: 500 }
    )
  }
}

