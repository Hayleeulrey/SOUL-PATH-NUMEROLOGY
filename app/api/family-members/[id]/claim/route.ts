import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createApprovalsForExistingContent } from '@/lib/approvals'
import {
  createNotification,
  sendTagNotification,
  getAllNotifications,
} from '@/lib/notifications'
import { NotificationType } from '@prisma/client'
import { sendProfileClaimedEmail, sendNotificationIfEnabled } from '@/lib/email-notifications'

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

    const familyMember = await prisma.familyMember.findUnique({
      where: { id },
      include: {
        invitationsSent: {
          where: {
            status: 'PENDING',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
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

    if (familyMember.isClaimed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile is already claimed',
        },
        { status: 400 }
      )
    }

    if (familyMember.userId && familyMember.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'This profile is already linked to another user',
        },
        { status: 403 }
      )
    }

    // Validate email match if invitation has an email
    if (familyMember.invitationsSent.length > 0) {
      const invitation = familyMember.invitationsSent[0]
      if (invitation.email) {
        // Get the current user's email from Clerk
        const clerkClientInstance = await clerkClient()
        const clerkUser = await clerkClientInstance.users.getUser(userId)
        const userEmail = clerkUser.emailAddresses.find(
          (email) => email.id === clerkUser.primaryEmailAddressId
        )?.emailAddress

        if (userEmail) {
          const invitationEmailNormalized = invitation.email.toLowerCase().trim()
          const userEmailNormalized = userEmail.toLowerCase().trim()

          if (userEmailNormalized !== invitationEmailNormalized) {
            return NextResponse.json(
              {
                success: false,
                error: `This invitation was sent to ${invitation.email}, but you're signed in as ${userEmail}. Please sign in with the email address the invitation was sent to.`,
              },
              { status: 403 }
            )
          }
        }
      }
    }

    // Get inviter info for email
    let inviterName = 'Someone'
    if (familyMember.invitationsSent.length > 0) {
      const inviter = await prisma.user.findUnique({
        where: { id: familyMember.invitationsSent[0].inviterId },
      })
      inviterName = inviter?.name || inviter?.email || 'Someone'
    }

    // Update family member to claimed
    const updated = await prisma.familyMember.update({
      where: { id },
      data: {
        isClaimed: true,
        claimedAt: new Date(),
        userId,
      },
    })

    // Update or create user profile link
    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        familyMemberId: id,
      },
      create: {
        userId,
        familyMemberId: id,
        onboardingComplete: true,
      },
    })

    // Update pending invitations
    await prisma.familyInvitation.updateMany({
      where: {
        familyMemberId: id,
        status: 'PENDING',
      },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    })

    // Create approval records for all existing content
    await createApprovalsForExistingContent(id)

    // Get all pending tags and create notifications
    const pendingTags = await prisma.contentTag.findMany({
      where: {
        taggedMemberId: id,
        status: 'PENDING',
      },
    })

    for (const tag of pendingTags) {
      await sendTagNotification(id, tag.id, tag.taggedBy)
    }

    // Get pending approvals count
    const pendingApprovals = await prisma.contentApproval.findMany({
      where: {
        familyMemberId: id,
        status: 'PENDING',
      },
    })

    // Create notification for profile being claimed
    await createNotification(
      userId,
      NotificationType.PROFILE_CLAIMED,
      'Profile Claimed',
      `You've successfully claimed your profile. You have ${pendingApprovals.length} item${pendingApprovals.length !== 1 ? 's' : ''} waiting for your review.`,
      'profile',
      id
    )

    // Send email notification if enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (user?.email) {
      await sendNotificationIfEnabled(userId, () =>
        sendProfileClaimedEmail(user.email!, inviterName)
      )
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Profile claimed successfully',
      pendingApprovals: pendingApprovals.length,
      pendingTags: pendingTags.length,
    })
  } catch (error) {
    console.error('Error claiming profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to claim profile',
      },
      { status: 500 }
    )
  }
}

