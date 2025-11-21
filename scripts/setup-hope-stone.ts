import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function setupHopeStone(currentUserId: string) {
  console.log('🌱 Setting up Hope Stone profile...')
  console.log('Current user ID:', currentUserId)

  const results = {
    created: [] as string[],
    updated: [] as string[],
    errors: [] as string[],
  }

  try {
    // Find or create Hope Stone user
    let hopeUser = await prisma.user.findFirst({
      where: { email: 'hope.stone@example.com' },
    })

    if (!hopeUser) {
      hopeUser = await prisma.user.create({
        data: {
          id: `user_${randomUUID()}`,
          email: 'hope.stone@example.com',
          name: 'Hope Stone',
        },
      })
      results.created.push(`Created Hope Stone user (${hopeUser.id})`)
    } else {
      // Update name if needed
      if (hopeUser.name !== 'Hope Stone') {
        hopeUser = await prisma.user.update({
          where: { id: hopeUser.id },
          data: { name: 'Hope Stone' },
        })
        results.updated.push(`Updated Hope Stone user name (${hopeUser.id})`)
      } else {
        results.updated.push(`Hope Stone user already exists (${hopeUser.id})`)
      }
    }

    // Find or create Hope Stone profile
    let hopeProfile = await prisma.familyMember.findFirst({
      where: {
        firstName: 'Hope',
        lastName: 'Stone',
      },
    })

    if (!hopeProfile) {
      hopeProfile = await prisma.familyMember.create({
        data: {
          firstName: 'Hope',
          lastName: 'Stone',
          isAlive: true,
          isClaimed: true,
          userId: hopeUser.id,
          claimedAt: new Date(),
          createdBy: currentUserId,
          bio: 'Hope Stone is a claimed profile with admin access for testing purposes.',
        },
      })
      results.created.push(`Created Hope Stone profile (${hopeProfile.id})`)
    } else {
      // Update to ensure it's claimed and linked to Hope's user
      hopeProfile = await prisma.familyMember.update({
        where: { id: hopeProfile.id },
        data: {
          isClaimed: true,
          userId: hopeUser.id,
          claimedAt: hopeProfile.claimedAt || new Date(),
          firstName: 'Hope',
          lastName: 'Stone',
        },
      })
      results.updated.push(`Updated Hope Stone profile (${hopeProfile.id})`)
    }

    // Create or update UserProfile link for Hope
    const existingUserProfile = await prisma.userProfile.findUnique({
      where: { userId: hopeUser.id },
    })

    if (!existingUserProfile) {
      await prisma.userProfile.create({
        data: {
          userId: hopeUser.id,
          familyMemberId: hopeProfile.id,
          onboardingComplete: true,
        },
      })
      results.created.push(`Created UserProfile link for Hope Stone`)
    } else {
      await prisma.userProfile.update({
        where: { userId: hopeUser.id },
        data: {
          familyMemberId: hopeProfile.id,
          onboardingComplete: true,
        },
      })
      results.updated.push(`Updated UserProfile link for Hope Stone`)
    }

    // Create ProfileAdmin for current user on Hope's profile
    const existingAdmin = await prisma.profileAdmin.findUnique({
      where: {
        profileId_adminUserId: {
          profileId: hopeProfile.id,
          adminUserId: currentUserId,
        },
      },
    })

    if (!existingAdmin) {
      const admin = await prisma.profileAdmin.create({
        data: {
          profileId: hopeProfile.id,
          adminUserId: currentUserId,
          assignedBy: hopeUser.id, // Hope assigned you as admin
          canEditProfile: true,
          canManageAdmins: false,
        },
      })
      results.created.push(`Created admin assignment for Hope Stone's profile (${admin.id})`)
    } else {
      // Update existing admin to ensure proper permissions
      await prisma.profileAdmin.update({
        where: { id: existingAdmin.id },
        data: {
          canEditProfile: true,
          assignedBy: hopeUser.id,
        },
      })
      results.updated.push(`Updated admin assignment for Hope Stone's profile (${existingAdmin.id})`)
    }

    console.log('✅ Hope Stone profile setup complete!')
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
        hopeUser: {
          id: hopeUser.id,
          email: hopeUser.email,
          name: hopeUser.name,
        },
        hopeProfile: {
          id: hopeProfile.id,
          firstName: hopeProfile.firstName,
          lastName: hopeProfile.lastName,
          isClaimed: hopeProfile.isClaimed,
          userId: hopeProfile.userId,
        },
        adminSetup: {
          profileId: hopeProfile.id,
          adminUserId: currentUserId,
        },
      },
    }
  } catch (error: any) {
    console.error('❌ Error setting up Hope Stone profile:', error)
    results.errors.push(error.message || 'Unknown error')
    return {
      success: false,
      error: error.message || 'Failed to setup Hope Stone profile',
      results,
    }
  }
}

async function main() {
  // Get user ID from command line argument
  let userId = process.argv[2]

  if (!userId) {
    console.log('No user ID provided. Looking for existing users...')
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    
    if (users.length === 0) {
      console.log('No users found. Creating a test user for you...')
      // Create a test user - in production, this would come from Clerk
      // For testing, we'll create a mock user
      const testUser = await prisma.user.create({
        data: {
          id: `user_${randomUUID()}`,
          email: 'test@example.com',
          name: 'Test User',
        },
      })
      userId = testUser.id
      console.log(`Created test user: ${testUser.email} (${userId})`)
      console.log('Note: In production, sign in first to create your user record.\n')
    } else {
      console.log('\nFound users:')
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.id})`)
      })
      
      // Use the most recent user
      userId = users[0].id
      console.log(`\nUsing most recent user: ${users[0].email} (${userId})`)
      console.log('(To use a different user, provide the user ID as an argument)\n')
    }
  }

  const result = await setupHopeStone(userId)

  if (result.success) {
    console.log('\n✅ Success! Hope Stone profile is now set up.')
    console.log(`   - Email: ${result.data.hopeUser.email}`)
    console.log(`   - Profile ID: ${result.data.hopeProfile.id}`)
    console.log(`   - You are now an admin for this profile`)
  } else {
    console.error('\n❌ Setup failed:', result.error)
    await prisma.$disconnect()
    process.exit(1)
  }
  
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

