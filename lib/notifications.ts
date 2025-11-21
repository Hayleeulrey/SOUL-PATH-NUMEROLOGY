import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'

/**
 * Create a notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  relatedType?: string,
  relatedId?: string
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      relatedType: relatedType || null,
      relatedId: relatedId || null,
      isRead: false,
    },
  })
}

/**
 * Send tag notification to a tagged member
 */
export async function sendTagNotification(
  taggedMemberId: string,
  tagId: string,
  taggerUserId: string
) {
  const taggedMember = await prisma.familyMember.findUnique({
    where: { id: taggedMemberId },
    include: {
      user: true,
    },
  })

  if (!taggedMember) {
    return null
  }

  // Only send notification if the profile is claimed (has a userId)
  if (!taggedMember.userId) {
    return null
  }

  const tag = await prisma.contentTag.findUnique({
    where: { id: tagId },
  })

  if (!tag) {
    return null
  }

  // Get tagger's name
  const tagger = await prisma.user.findUnique({
    where: { id: taggerUserId },
  })

  const taggerName = tagger?.name || tagger?.email || 'Someone'

  // Determine content title based on type
  let contentTitle = 'content'
  try {
    if (tag.contentType === 'photo') {
      const photo = await prisma.photo.findUnique({
        where: { id: tag.contentId },
      })
      contentTitle = photo?.caption || 'a photo'
    } else if (tag.contentType === 'story') {
      const story = await prisma.story.findUnique({
        where: { id: tag.contentId },
      })
      contentTitle = story?.title || 'a story'
    } else if (tag.contentType === 'document') {
      const doc = await prisma.document.findUnique({
        where: { id: tag.contentId },
      })
      contentTitle = doc?.title || doc?.originalName || 'a document'
    } else if (tag.contentType === 'audio') {
      const audio = await prisma.audioFile.findUnique({
        where: { id: tag.contentId },
      })
      contentTitle = audio?.originalName || 'an audio file'
    }
  } catch (error) {
    console.error('Error fetching content for notification:', error)
  }

  const title = 'You\'ve been tagged'
  const message = `${taggerName} tagged you in ${contentTitle}`

  // Update tag with notifiedAt timestamp
  await prisma.contentTag.update({
    where: { id: tagId },
    data: { notifiedAt: new Date() },
  })

  return createNotification(
    taggedMember.userId,
    NotificationType.TAG_PENDING,
    title,
    message,
    'content_tag',
    tagId
  )
}

/**
 * Send approval notification
 */
export async function sendApprovalNotification(
  familyMemberId: string,
  approvalId: string
) {
  const familyMember = await prisma.familyMember.findUnique({
    where: { id: familyMemberId },
  })

  if (!familyMember || !familyMember.userId) {
    return null
  }

  const approval = await prisma.contentApproval.findUnique({
    where: { id: approvalId },
  })

  if (!approval) {
    return null
  }

  const title = 'Content pending approval'
  const message = `New ${approval.contentType} has been added to your profile and needs your approval`

  return createNotification(
    familyMember.userId,
    NotificationType.CONTENT_PENDING_APPROVAL,
    title,
    message,
    'content_approval',
    approvalId
  )
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  })
}

/**
 * Get notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })
}

/**
 * Get all notifications for a user (read and unread)
 */
export async function getAllNotifications(userId: string, limit: number = 50) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

