import { prisma } from './prisma'

/**
 * Check if a user can edit a family member profile
 */
export async function canEditProfile(
  familyMemberId: string,
  userId: string
): Promise<boolean> {
  const familyMember = await prisma.familyMember.findUnique({
    where: { id: familyMemberId },
    include: {
      profileAdmins: true,
    },
  })

  if (!familyMember) {
    return false
  }

  // If profile is not claimed, only the original creator can edit
  if (!familyMember.isClaimed) {
    return familyMember.createdBy === userId
  }

  // If profile is claimed, owner or admins can edit
  if (familyMember.userId === userId) {
    return true
  }

  // Check if user is an admin with edit permissions
  const admin = familyMember.profileAdmins.find(
    (admin) => admin.adminUserId === userId && admin.canEditProfile
  )

  return !!admin
}

/**
 * Check if a user can edit specific content
 */
export async function canEditContent(
  contentType: string,
  contentId: string,
  userId: string
): Promise<boolean> {
  // Map content types to their models
  const contentModels: Record<string, any> = {
    photo: prisma.photo,
    story: prisma.story,
    document: prisma.document,
    audio: prisma.audioFile,
    relationship: prisma.relationship,
    biography: prisma.biographyResponse,
  }

  const model = contentModels[contentType]
  if (!model) {
    return false
  }

  const content = await model.findUnique({
    where: { id: contentId },
    include: {
      familyMember: {
        include: {
          profileAdmins: true,
        },
      },
    },
  })

  if (!content) {
    return false
  }

  const familyMember = content.familyMember

  // If content creator is the user, they can edit
  if (content.createdBy === userId) {
    return true
  }

  // Check profile edit permissions
  return canEditProfile(familyMember.id, userId)
}

/**
 * Check if a user is an admin for a profile
 */
export async function isProfileAdmin(
  familyMemberId: string,
  userId: string
): Promise<boolean> {
  const admin = await prisma.profileAdmin.findUnique({
    where: {
      profileId_adminUserId: {
        profileId: familyMemberId,
        adminUserId: userId,
      },
    },
  })

  return !!admin
}

/**
 * Check if a user is the owner of a profile
 */
export async function isProfileOwner(
  familyMemberId: string,
  userId: string
): Promise<boolean> {
  const familyMember = await prisma.familyMember.findUnique({
    where: { id: familyMemberId },
  })

  if (!familyMember) {
    return false
  }

  return familyMember.userId === userId
}

/**
 * Check if a user is the original creator of an unclaimed profile
 */
export async function isOriginalCreator(
  familyMemberId: string,
  userId: string
): Promise<boolean> {
  const familyMember = await prisma.familyMember.findUnique({
    where: { id: familyMemberId },
  })

  if (!familyMember) {
    return false
  }

  // Only applies to unclaimed profiles
  if (familyMember.isClaimed) {
    return false
  }

  return familyMember.createdBy === userId
}

/**
 * Check if a user can manage admins for a profile
 */
export async function canManageAdmins(
  familyMemberId: string,
  userId: string
): Promise<boolean> {
  // Owner can always manage admins
  if (await isProfileOwner(familyMemberId, userId)) {
    return true
  }

  // Check if user is an admin with manage admins permission
  const admin = await prisma.profileAdmin.findUnique({
    where: {
      profileId_adminUserId: {
        profileId: familyMemberId,
        adminUserId: userId,
      },
    },
  })

  return admin?.canManageAdmins ?? false
}

