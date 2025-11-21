import { prisma } from './prisma'
import { ApprovalStatus, TagStatus } from '@prisma/client'

/**
 * Create a content approval record
 */
export async function createContentApproval(
  contentType: string,
  contentId: string,
  familyMemberId: string,
  createdBy: string
) {
  // Check if approval already exists
  const existing = await prisma.contentApproval.findUnique({
    where: {
      contentType_contentId_familyMemberId: {
        contentType,
        contentId,
        familyMemberId,
      },
    },
  })

  if (existing) {
    return existing
  }

  return prisma.contentApproval.create({
    data: {
      contentType,
      contentId,
      familyMemberId,
      createdBy,
      status: ApprovalStatus.PENDING,
    },
  })
}

/**
 * Approve content
 */
export async function approveContent(
  approvalId: string,
  reviewedBy: string
) {
  return prisma.contentApproval.update({
    where: { id: approvalId },
    data: {
      status: ApprovalStatus.APPROVED,
      reviewedAt: new Date(),
      reviewedBy,
    },
  })
}

/**
 * Deny content
 */
export async function denyContent(
  approvalId: string,
  reviewedBy: string,
  notes?: string
) {
  return prisma.contentApproval.update({
    where: { id: approvalId },
    data: {
      status: ApprovalStatus.DENIED,
      reviewedAt: new Date(),
      reviewedBy,
      notes: notes || null,
    },
  })
}

/**
 * Get all pending approvals for a family member
 */
export async function getPendingApprovals(familyMemberId: string) {
  return prisma.contentApproval.findMany({
    where: {
      familyMemberId,
      status: ApprovalStatus.PENDING,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Get all pending tag approvals for a family member
 */
export async function getPendingTagApprovals(familyMemberId: string) {
  return prisma.contentTag.findMany({
    where: {
      taggedMemberId: familyMemberId,
      status: TagStatus.PENDING,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Get approval by content type and ID
 */
export async function getContentApproval(
  contentType: string,
  contentId: string,
  familyMemberId: string
) {
  return prisma.contentApproval.findUnique({
    where: {
      contentType_contentId_familyMemberId: {
        contentType,
        contentId,
        familyMemberId,
      },
    },
  })
}

/**
 * Create approval records for all existing content when a profile is claimed
 */
export async function createApprovalsForExistingContent(
  familyMemberId: string
) {
  const familyMember = await prisma.familyMember.findUnique({
    where: { id: familyMemberId },
    include: {
      photos: true,
      stories: true,
      documents: true,
      audioFiles: true,
      relationshipsAsPerson: true,
      relationshipsAsRelated: true,
      biographyResponses: true,
    },
  })

  if (!familyMember) {
    return
  }

  const approvals = []

  // Create approvals for photos
  for (const photo of familyMember.photos) {
    if (photo.createdBy) {
      approvals.push(
        createContentApproval('photo', photo.id, familyMemberId, photo.createdBy)
      )
    }
  }

  // Create approvals for stories
  for (const story of familyMember.stories) {
    if (story.createdBy) {
      approvals.push(
        createContentApproval('story', story.id, familyMemberId, story.createdBy)
      )
    }
  }

  // Create approvals for documents
  for (const document of familyMember.documents) {
    if (document.createdBy) {
      approvals.push(
        createContentApproval('document', document.id, familyMemberId, document.createdBy)
      )
    }
  }

  // Create approvals for audio files
  for (const audio of familyMember.audioFiles) {
    if (audio.createdBy) {
      approvals.push(
        createContentApproval('audio', audio.id, familyMemberId, audio.createdBy)
      )
    }
  }

  // Create approvals for relationships
  for (const relationship of [
    ...familyMember.relationshipsAsPerson,
    ...familyMember.relationshipsAsRelated,
  ]) {
    if (relationship.createdBy) {
      approvals.push(
        createContentApproval(
          'relationship',
          relationship.id,
          familyMemberId,
          relationship.createdBy
        )
      )
    }
  }

  // Create approvals for biography responses
  for (const response of familyMember.biographyResponses) {
    if (response.createdBy) {
      approvals.push(
        createContentApproval(
          'biography',
          response.id,
          familyMemberId,
          response.createdBy
        )
      )
    }
  }

  // Create approval for profile itself if it was created by someone else
  if (familyMember.createdBy && familyMember.createdBy !== familyMember.userId) {
    approvals.push(
      createContentApproval('profile', familyMember.id, familyMemberId, familyMember.createdBy)
    )
  }

  await Promise.all(approvals)
}

