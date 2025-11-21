import { prisma } from './prisma'
import { createContentApproval } from './approvals'
import { sendApprovalNotification } from './notifications'
import { canEditProfile } from './permissions'

/**
 * Helper to create content with approval tracking
 */
export async function createContentWithApproval(
  contentType: 'photo' | 'story' | 'document' | 'audio' | 'relationship' | 'biography',
  contentId: string,
  familyMemberId: string,
  userId: string
) {
  const familyMember = await prisma.familyMember.findUnique({
    where: { id: familyMemberId },
  })

  if (!familyMember) {
    return
  }

  // If profile is claimed and user doesn't have edit permissions, create approval record
  if (familyMember.isClaimed) {
    const canEdit = await canEditProfile(familyMemberId, userId)
    
    if (!canEdit) {
      const approval = await createContentApproval(contentType, contentId, familyMemberId, userId)
      
      // Send notification to profile owner
      if (familyMember.userId && approval) {
        await sendApprovalNotification(familyMemberId, approval.id)
      }
    }
  }
}

