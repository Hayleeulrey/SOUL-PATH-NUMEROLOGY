import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import {
  getPendingApprovals,
  approveContent,
  denyContent,
} from '@/lib/approvals'
import { isProfileOwner } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's family member profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        familyMember: true,
      },
    })

    if (!userProfile?.familyMemberId) {
      return NextResponse.json({
        success: true,
        data: {
          approvals: [],
        },
      })
    }

    const approvals = await getPendingApprovals(userProfile.familyMemberId)

    // Enrich approvals with content details
    const enrichedApprovals = await Promise.all(
      approvals.map(async (approval) => {
        let content = null
        let creator = null

        try {
          // Fetch content based on type
          if (approval.contentType === 'photo') {
            content = await prisma.photo.findUnique({
              where: { id: approval.contentId },
            })
          } else if (approval.contentType === 'story') {
            content = await prisma.story.findUnique({
              where: { id: approval.contentId },
            })
          } else if (approval.contentType === 'document') {
            content = await prisma.document.findUnique({
              where: { id: approval.contentId },
            })
          } else if (approval.contentType === 'audio') {
            content = await prisma.audioFile.findUnique({
              where: { id: approval.contentId },
            })
          } else if (approval.contentType === 'relationship') {
            content = await prisma.relationship.findUnique({
              where: { id: approval.contentId },
              include: {
                person: true,
                related: true,
              },
            })
          } else if (approval.contentType === 'biography') {
            content = await prisma.biographyResponse.findUnique({
              where: { id: approval.contentId },
              include: {
                prompt: true,
              },
            })
          } else if (approval.contentType === 'profile') {
            content = await prisma.familyMember.findUnique({
              where: { id: approval.contentId },
            })
          }

          // Get creator info
          if (approval.createdBy) {
            const user = await prisma.user.findUnique({
              where: { id: approval.createdBy },
            })
            creator = user
              ? {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                }
              : null
          }
        } catch (error) {
          console.error('Error fetching content for approval:', error)
        }

        return {
          ...approval,
          content,
          creator,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        approvals: enrichedApprovals,
      },
    })
  } catch (error) {
    console.error('Error fetching pending approvals:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pending approvals',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { approvalId, action, notes } = body

    if (!approvalId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'approvalId and action are required',
        },
        { status: 400 }
      )
    }

    // Get approval
    const approval = await prisma.contentApproval.findUnique({
      where: { id: approvalId },
      include: {
        familyMember: true,
      },
    })

    if (!approval) {
      return NextResponse.json(
        {
          success: false,
          error: 'Approval not found',
        },
        { status: 404 }
      )
    }

    // Verify user owns the profile
    const isOwner = await isProfileOwner(approval.familyMemberId, userId)
    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - only profile owner can approve/deny',
        },
        { status: 403 }
      )
    }

    if (action === 'approve') {
      await approveContent(approvalId, userId)
    } else if (action === 'deny') {
      await denyContent(approvalId, userId, notes)
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
      message: `Content ${action === 'approve' ? 'approved' : 'denied'} successfully`,
    })
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process approval',
      },
      { status: 500 }
    )
  }
}

