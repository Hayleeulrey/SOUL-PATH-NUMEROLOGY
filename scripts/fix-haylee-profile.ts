import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixHayleeProfile() {
  try {
    const email = 'haylee@automationconsulting.tech'
    const firstName = 'Haylee'
    const lastName = 'Ulrey'
    
    // Get userId from command line or prompt
    let userId = process.argv[2]

    console.log(`🔍 Looking for profile: ${firstName} ${lastName}`)
    
    // Find the family member profile
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        firstName: { equals: firstName, mode: 'insensitive' },
        lastName: { equals: lastName, mode: 'insensitive' },
      },
    })

    if (!familyMember) {
      console.error(`❌ Profile not found for ${firstName} ${lastName}`)
      console.log('\nAvailable profiles:')
      const allProfiles = await prisma.familyMember.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      })
      allProfiles.forEach(p => {
        console.log(`  - ${p.firstName} ${p.lastName} (ID: ${p.id}, userId: ${p.userId || 'none'})`)
      })
      return
    }

    console.log(`✅ Found profile: ${familyMember.firstName} ${familyMember.lastName} (ID: ${familyMember.id})`)
    console.log(`   Current userId: ${familyMember.userId || 'none'}`)
    console.log(`   Is claimed: ${familyMember.isClaimed}`)

    if (!userId) {
      console.log('\n⚠️  No userId provided.')
      console.log('To use this script, you need to provide your Clerk userId.')
      console.log('\nOption 1: Use the API endpoint (recommended)')
      console.log('  1. Sign in to your app with haylee@automationconsulting.tech')
      console.log('  2. Open browser console and run:')
      console.log(`     fetch('/api/fix-profile-link', {`)
      console.log(`       method: 'POST',`)
      console.log(`       headers: { 'Content-Type': 'application/json' },`)
      console.log(`       body: JSON.stringify({ firstName: 'Haylee', lastName: 'Ulrey', email: 'haylee@automationconsulting.tech' })`)
      console.log(`     }).then(r => r.json()).then(console.log)`)
      console.log('\nOption 2: Run this script with your Clerk userId')
      console.log('  npx tsx scripts/fix-haylee-profile.ts YOUR_CLERK_USER_ID')
      console.log('\nTo find your Clerk userId:')
      console.log('  1. Sign in to your app')
      console.log('  2. Open browser console')
      console.log('  3. Run: (await fetch("/api/user-profile")).json().then(d => console.log(d.data?.userId))')
      return
    }

    console.log(`\n🔧 Updating profile to link to user ${userId}...`)
    const updated = await prisma.familyMember.update({
      where: { id: familyMember.id },
      data: {
        userId,
        isClaimed: true,
        claimedAt: new Date(),
      },
    })

    console.log(`✅ Updated family member profile`)

    // Update or create user profile link
    console.log(`\n🔧 Updating UserProfile...`)
    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        familyMemberId: familyMember.id,
      },
      create: {
        userId,
        familyMemberId: familyMember.id,
        onboardingComplete: true,
      },
    })

    console.log(`✅ Updated UserProfile`)

    console.log(`\n✅ Success! Profile "${firstName} ${lastName}" is now linked to ${email}`)
    console.log(`   - Family Member ID: ${familyMember.id}`)
    console.log(`   - User ID: ${userId}`)
    console.log(`   - Is Claimed: ${updated.isClaimed}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixHayleeProfile()

