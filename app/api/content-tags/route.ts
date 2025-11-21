import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { TagStatus } from '@prisma/client'
import { sendTagNotification } from '@/lib/notifications'
import { sendTagNotificationEmail } from '@/lib/email-notifications'
import { sendNotificationIfEnabled } from '@/lib/email-notifications'

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
    const { contentType, contentId, taggedMemberIds } = body

    if (!contentType || !contentId || !taggedMemberIds || !Array.isArray(taggedMemberIds)) {
      return NextResponse.json(
        {
          success: false,
          error: 'contentType, contentId, and taggedMemberIds array are required',
        },
        { status: 400 }
      )
    }

    const tags = []

    for (const taggedMemberId of taggedMemberIds) {
      // Check if tag already exists
      const existing = await prisma.contentTag.findUnique({
        where: {
          contentType_contentId_taggedMemberId: {
            contentType,
            contentId,
            taggedMemberId,
          },
        },
      })

      if (existing) {
        tags.push(existing)
        continue
      }

      // Get tagged member info
      const taggedMember = await prisma.familyMember.findUnique({
        where: { id: taggedMemberId },
        include: {
          user: true,
        },
      })

      if (!taggedMember) {
        continue
      }

      // Create tag
      const tag = await prisma.contentTag.create({
        data: {
          contentType,
          contentId,
          taggedMemberId,
          taggedBy: userId,
          status: TagStatus.PENDING,
        },
      })

      tags.push(tag)

      // Get content title for notification
      let contentTitle = 'content'
      try {
        if (contentType === 'photo') {
          const photo = await prisma.photo.findUnique({
            where: { id: contentId },
          })
          contentTitle = photo?.caption || 'a photo'
        } else if (contentType === 'story') {
          const story = await prisma.story.findUnique({
            where: { id: contentId },
          })
          contentTitle = story?.title || 'a story'
        } else if (contentType === 'document') {
          const doc = await prisma.document.findUnique({
            where: { id: contentId },
          })
          contentTitle = doc?.title || doc?.originalName || 'a document'
        } else if (contentType === 'audio') {
          const audio = await prisma.audioFile.findUnique({
            where: { id: contentId },
          })
          contentTitle = audio?.originalName || 'an audio file'
        }
      } catch (error) {
        console.error('Error fetching content for tag notification:', error)
      }

      // Get tagger name
      const tagger = await prisma.user.findUnique({
        where: { id: userId },
      })
      const taggerName = tagger?.name || tagger?.email || 'Someone'

      // Send notifications
      if (taggedMember.userId) {
        // Profile is claimed - send in-app notification
        await sendTagNotification(taggedMemberId, tag.id, userId)

        // Send email if enabled and profile is claimed
        if (taggedMember.user?.email) {
          await sendNotificationIfEnabled(
            taggedMember.userId,
            () =>
              sendTagNotificationEmail(
                taggedMember.user!.email!,
                taggerName,
                contentType,
                contentTitle
              )
          )
        }
      } else if (taggedMember.isClaimed === false) {
        // Profile is unclaimed - check if there's an invitation with email
        const invitation = await prisma.familyInvitation.findFirst({
          where: {
            familyMemberId: taggedMemberId,
            status: 'PENDING',
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        if (invitation?.email) {
          // Send email notification even if profile is unclaimed
          await sendTagNotificationEmail(
            invitation.email,
            taggerName,
            contentType,
            contentTitle
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { tags },
      message: 'Tags created successfully',
    })
  } catch (error) {
    console.error('Error creating tags:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create tags',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType')
    const contentId = searchParams.get('contentId')
    const taggedMemberId = searchParams.get('taggedMemberId')
    const status = searchParams.get('status')

    // If taggedMemberId is provided, get user's profile to verify
    if (taggedMemberId) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId },
        include: { familyMember: true },
      })

      if (!userProfile?.familyMemberId || userProfile.familyMemberId !== taggedMemberId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 403 }
        )
      }
    }

    const where: any = {}
    if (contentType) where.contentType = contentType
    if (contentId) where.contentId = contentId
    if (taggedMemberId) where.taggedMemberId = taggedMemberId
    if (status) where.status = status

    const tags = await prisma.contentTag.findMany({
      where,
      include: {
        taggedMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: { tags },
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tags',
      },
      { status: 500 }
    )
  }
}

