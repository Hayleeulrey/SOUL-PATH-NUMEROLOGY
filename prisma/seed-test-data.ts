import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

export async function setupTestData(currentUserId: string) {
  console.log('🌱 Setting up test data for invitation status system...')
  console.log('Current user ID:', currentUserId)

  const results = {
    created: [] as string[],
    updated: [] as string[],
    errors: [] as string[],
  }

  try {
    // Find or create Tanner (unclaimed, pending invitation)
    let tanner = await prisma.familyMember.findFirst({
      where: { firstName: 'Tanner' },
    })

    if (!tanner) {
      tanner = await prisma.familyMember.create({
        data: {
          firstName: 'Tanner',
          lastName: 'Test',
          isAlive: true,
          isClaimed: false,
          createdBy: currentUserId,
        },
      })
      results.created.push(`Created Tanner (${tanner.id})`)
    } else {
      // Update to ensure unclaimed
      tanner = await prisma.familyMember.update({
        where: { id: tanner.id },
        data: {
          isClaimed: false,
          userId: null,
        },
      })
      results.updated.push(`Updated Tanner (${tanner.id})`)
    }

    // Find or create Dillon (claimed profile)
    let dillon = await prisma.familyMember.findFirst({
      where: { firstName: 'Dillon' },
    })

    let dillonUser = await prisma.user.findFirst({
      where: { email: 'dillon@example.com' },
    })

    if (!dillonUser) {
      dillonUser = await prisma.user.create({
        data: {
          id: `user_${randomUUID()}`,
          email: 'dillon@example.com',
          name: 'Dillon Test',
        },
      })
      results.created.push(`Created Dillon user (${dillonUser.id})`)
    }

    if (!dillon) {
      dillon = await prisma.familyMember.create({
        data: {
          firstName: 'Dillon',
          lastName: 'Test',
          isAlive: true,
          isClaimed: true,
          userId: dillonUser.id,
          claimedAt: new Date(),
          createdBy: currentUserId,
        },
      })
      results.created.push(`Created Dillon profile (${dillon.id})`)
    } else {
      dillon = await prisma.familyMember.update({
        where: { id: dillon.id },
        data: {
          isClaimed: true,
          userId: dillonUser.id,
          claimedAt: new Date(),
        },
      })
      results.updated.push(`Updated Dillon profile (${dillon.id})`)
    }

    // Find or create Hope (claimed profile, will add current user as admin)
    let hope = await prisma.familyMember.findFirst({
      where: { firstName: 'Hope' },
    })

    let hopeUser = await prisma.user.findFirst({
      where: { email: 'hope@example.com' },
    })

    if (!hopeUser) {
      hopeUser = await prisma.user.create({
        data: {
          id: `user_${randomUUID()}`,
          email: 'hope@example.com',
          name: 'Hope Test',
        },
      })
      results.created.push(`Created Hope user (${hopeUser.id})`)
    }

    if (!hope) {
      hope = await prisma.familyMember.create({
        data: {
          firstName: 'Hope',
          lastName: 'Test',
          isAlive: true,
          isClaimed: true,
          userId: hopeUser.id,
          claimedAt: new Date(),
          createdBy: currentUserId,
        },
      })
      results.created.push(`Created Hope profile (${hope.id})`)
    } else {
      hope = await prisma.familyMember.update({
        where: { id: hope.id },
        data: {
          isClaimed: true,
          userId: hopeUser.id,
          claimedAt: new Date(),
        },
      })
      results.updated.push(`Updated Hope profile (${hope.id})`)
    }

    // Create pending invitation for Tanner
    const existingTannerInvitation = await prisma.familyInvitation.findFirst({
      where: {
        familyMemberId: tanner.id,
        email: 'tanner@example.com',
        status: 'PENDING',
      },
    })

    if (!existingTannerInvitation) {
      const tannerInvitation = await prisma.familyInvitation.create({
        data: {
          inviterId: currentUserId,
          familyMemberId: tanner.id,
          email: 'tanner@example.com',
          token: randomUUID(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'PENDING',
        },
      })
      results.created.push(`Created invitation for Tanner (${tannerInvitation.id})`)
    } else {
      results.updated.push(`Tanner invitation already exists (${existingTannerInvitation.id})`)
    }

    // Create ProfileAdmin for Hope's profile (current user as admin)
    const existingAdmin = await prisma.profileAdmin.findUnique({
      where: {
        profileId_adminUserId: {
          profileId: hope.id,
          adminUserId: currentUserId,
        },
      },
    })

    if (!existingAdmin) {
      const admin = await prisma.profileAdmin.create({
        data: {
          profileId: hope.id,
          adminUserId: currentUserId,
          assignedBy: hopeUser.id,
          canEditProfile: true,
          canManageAdmins: false,
        },
      })
      results.created.push(`Created admin assignment for Hope's profile (${admin.id})`)
    } else {
      results.updated.push(`Admin assignment already exists (${existingAdmin.id})`)
    }

    console.log('✅ Test data setup complete!')
    console.log('📊 Results:')
    console.log(`   - Created: ${results.created.length} items`)
    console.log(`   - Updated: ${results.updated.length} items`)
    if (results.errors.length > 0) {
      console.log(`   - Errors: ${results.errors.length} items`)
    }

    return {
      success: true,
      results,
      data: {
        tanner: { id: tanner.id, email: 'tanner@example.com', status: 'pending' },
        dillon: { id: dillon.id, email: 'dillon@example.com', status: 'claimed' },
        hope: { id: hope.id, email: 'hope@example.com', status: 'claimed' },
      },
    }
  } catch (error: any) {
    console.error('❌ Error setting up test data:', error)
    results.errors.push(error.message || 'Unknown error')
    return {
      success: false,
      error: error.message || 'Failed to setup test data',
      results,
    }
  }
}

