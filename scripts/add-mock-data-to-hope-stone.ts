import { PrismaClient, RelationshipType, StoryCategory, PromptCategory } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function addMockDataToHopeStone() {
  console.log('🌱 Adding mock data to Hope Stone profile...')

  // Find existing Hope Stone profile
  const hopeProfile = await prisma.familyMember.findFirst({
    where: {
      OR: [
        { firstName: 'Hope', lastName: 'Stone' },
        { firstName: 'Hope' }, // In case last name is different
      ],
    },
  })

  if (!hopeProfile) {
    console.error('❌ Error: Hope Stone profile not found')
    console.log('Please create the Hope Stone profile first, or check the name spelling.')
    await prisma.$disconnect()
    process.exit(1)
  }

  console.log(`Found Hope Stone profile: ${hopeProfile.firstName} ${hopeProfile.lastName} (${hopeProfile.id})`)

  const results = {
    created: [] as string[],
    updated: [] as string[],
    errors: [] as string[],
  }

  try {
    // Update profile with more complete information
    if (!hopeProfile.birthDate || !hopeProfile.bio) {
      await prisma.familyMember.update({
        where: { id: hopeProfile.id },
        data: {
          birthDate: new Date('1990-06-15'),
          birthCity: 'Portland',
          birthState: 'OR',
          birthCountry: 'USA',
          bio: hopeProfile.bio || 'Hope Stone is a creative professional with a passion for storytelling and family history. She loves photography, writing, and preserving memories for future generations.',
        },
      })
      results.updated.push('Updated Hope Stone profile with birth info and bio')
    }

    // Create numerology profile
    const existingNumerology = await prisma.numerologyProfile.findUnique({
      where: { familyMemberId: hopeProfile.id },
    })

    if (!existingNumerology) {
      await prisma.numerologyProfile.create({
        data: {
          familyMemberId: hopeProfile.id,
          soulNumber: '9/9',
          outerPersonality: '3/3',
          destinyNumber: '6/6',
          lifeLesson: '4/4',
          notes: 'A humanitarian soul with creative expression and nurturing destiny. Life lesson focuses on building solid foundations.',
        },
      })
      results.created.push('Created numerology profile for Hope Stone')
    }

    // Create mock photos
    const existingPhotos = await prisma.photo.findMany({
      where: { familyMemberId: hopeProfile.id },
    })

    if (existingPhotos.length === 0) {
      const photoData = [
        {
          filename: 'hope-profile.jpg',
          originalName: 'Hope Profile Photo.jpg',
          filePath: '/uploads/photos/hope-profile.jpg',
          fileSize: 245678,
          mimeType: 'image/jpeg',
          width: 800,
          height: 1000,
          caption: 'Professional headshot taken in 2023',
          isProfile: true,
        },
        {
          filename: 'hope-family.jpg',
          originalName: 'Family Gathering 2022.jpg',
          filePath: '/uploads/photos/hope-family.jpg',
          fileSize: 456789,
          mimeType: 'image/jpeg',
          width: 1920,
          height: 1080,
          caption: 'Family reunion at the beach',
          tags: 'family, beach, reunion',
        },
        {
          filename: 'hope-graduation.jpg',
          originalName: 'College Graduation.jpg',
          filePath: '/uploads/photos/hope-graduation.jpg',
          fileSize: 321456,
          mimeType: 'image/jpeg',
          width: 1200,
          height: 900,
          caption: 'Graduation day from State University',
          tags: 'graduation, education, achievement',
        },
      ]

      for (const photo of photoData) {
        await prisma.photo.create({
          data: {
            ...photo,
            familyMemberId: hopeProfile.id,
          },
        })
      }
      results.created.push(`Created ${photoData.length} photos for Hope Stone`)
    }

    // Create mock stories
    const existingStories = await prisma.story.findMany({
      where: { familyMemberId: hopeProfile.id },
    })

    if (existingStories.length === 0) {
      const stories = [
        {
          title: 'My First Photography Exhibition',
          content: 'In 2018, I held my first photography exhibition at the local art gallery. It featured portraits of family members across three generations, capturing their unique personalities and the bonds between them. The opening night was attended by over 100 people, and several pieces were sold. This experience solidified my passion for preserving family memories through visual storytelling.',
          category: StoryCategory.ACHIEVEMENTS,
          summary: 'First photography exhibition featuring family portraits',
          tags: 'photography, art, achievement',
        },
        {
          title: 'Learning to Cook from Grandma',
          content: 'Every Sunday growing up, I would spend the afternoon in the kitchen with my grandmother. She taught me all her secret recipes, from her famous apple pie to her holiday stuffing. Those Sunday afternoons weren\'t just about cooking - they were about connection, stories, and passing down traditions. I still make her apple pie recipe every Thanksgiving, and it always brings back those warm memories.',
          category: StoryCategory.CHILDHOOD,
          summary: 'Sunday cooking lessons with grandmother',
          tags: 'cooking, family, traditions, childhood',
        },
        {
          title: 'Starting My Family History Blog',
          content: 'In 2020, I started a blog to document our family history. What began as a personal project to organize old photos and stories has grown into a resource that extended family members contribute to regularly. We\'ve discovered connections to relatives we never knew existed and pieced together stories that were almost lost to time. The blog now has over 200 posts and continues to grow.',
          category: StoryCategory.FAMILY,
          summary: 'Creating a family history blog that connected relatives',
          tags: 'family history, writing, genealogy',
        },
        {
          title: 'My Career in Journalism',
          content: 'After graduating with a degree in journalism, I worked as a features writer for a local newspaper. I specialized in human interest stories, often focusing on families and community connections. This work taught me the importance of listening carefully and asking the right questions - skills that have been invaluable in documenting our own family history.',
          category: StoryCategory.CAREER,
          summary: 'Career as a features writer focusing on human interest stories',
          tags: 'career, journalism, writing',
        },
      ]

      for (const story of stories) {
        await prisma.story.create({
          data: {
            ...story,
            familyMemberId: hopeProfile.id,
            isAI: false,
            sourceType: 'manual',
          },
        })
      }
      results.created.push(`Created ${stories.length} stories for Hope Stone`)
    }

    // Create mock biography responses
    const prompts = await prisma.biographyPrompt.findMany({
      where: { isActive: true },
      take: 5,
    })

    if (prompts.length > 0) {
      const existingResponses = await prisma.biographyResponse.findMany({
        where: { familyMemberId: hopeProfile.id },
      })

      if (existingResponses.length === 0) {
        const responses = [
          {
            promptId: prompts[0]?.id,
            answer: 'I hope to be remembered as someone who preserved our family\'s stories and helped future generations understand where they came from. I want to be known for my kindness, creativity, and the way I brought our family together through shared memories.',
          },
          {
            promptId: prompts[1]?.id || prompts[0]?.id,
            answer: 'My grandmother was my biggest inspiration. She had a way of making everyone feel special and always had a story to tell. She taught me that every person has a story worth preserving.',
          },
        ]

        for (const response of responses) {
          if (response.promptId) {
            await prisma.biographyResponse.create({
              data: {
                ...response,
                familyMemberId: hopeProfile.id,
                isPublic: true,
              },
            })
          }
        }
        results.created.push(`Created ${responses.length} biography responses for Hope Stone`)
      }
    }

    // Create mock relationships (if we can find other family members)
    const existingRelationships = await prisma.relationship.findMany({
      where: {
        OR: [
          { personId: hopeProfile.id },
          { relatedId: hopeProfile.id },
        ],
      },
    })

    if (existingRelationships.length === 0) {
      // Try to find other family members to create relationships with
      const otherMembers = await prisma.familyMember.findMany({
        where: {
          id: { not: hopeProfile.id },
        },
        take: 2,
      })

      if (otherMembers.length > 0) {
        // Create a parent relationship with the first other member
        await prisma.relationship.create({
          data: {
            personId: hopeProfile.id,
            relatedId: otherMembers[0].id,
            relationshipType: RelationshipType.PARENT,
            isActive: true,
          },
        })
        results.created.push(`Created relationship with ${otherMembers[0].firstName} ${otherMembers[0].lastName}`)
      }
    }

    // Create mock audio file
    const existingAudio = await prisma.audioFile.findMany({
      where: { familyMemberId: hopeProfile.id },
    })

    if (existingAudio.length === 0) {
      await prisma.audioFile.create({
        data: {
          familyMemberId: hopeProfile.id,
          filename: 'hope-interview.mp3',
          originalName: 'Hope Stone Interview.mp3',
          filePath: '/uploads/audio/hope-interview.mp3',
          fileSize: 5678901,
          duration: 1245.5, // ~20 minutes
          transcription: 'This is a mock transcription of an interview with Hope Stone about her family history and memories...',
          summary: 'Interview covering Hope\'s childhood memories, career journey, and passion for preserving family stories.',
          tags: 'interview, memories, family history',
        },
      })
      results.created.push('Created mock audio file for Hope Stone')
    }

    // Create mock document
    const existingDocuments = await prisma.document.findMany({
      where: { familyMemberId: hopeProfile.id },
    })

    if (existingDocuments.length === 0) {
      await prisma.document.create({
        data: {
          familyMemberId: hopeProfile.id,
          filename: 'hope-resume.pdf',
          originalName: 'Hope Stone Resume.pdf',
          filePath: '/uploads/documents/hope-resume.pdf',
          fileSize: 123456,
          mimeType: 'application/pdf',
          title: 'Professional Resume',
          description: 'Hope Stone\'s professional resume and career highlights',
          tags: 'resume, career, professional',
        },
      })
      results.created.push('Created mock document for Hope Stone')
    }

    // Ensure profile is claimed and has user
    if (!hopeProfile.isClaimed || !hopeProfile.userId) {
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
      }

      await prisma.familyMember.update({
        where: { id: hopeProfile.id },
        data: {
          isClaimed: true,
          userId: hopeUser.id,
          claimedAt: new Date(),
        },
      })
      results.updated.push('Updated Hope Stone profile to be claimed')

      // Create UserProfile link
      await prisma.userProfile.upsert({
        where: { userId: hopeUser.id },
        update: {
          familyMemberId: hopeProfile.id,
          onboardingComplete: true,
        },
        create: {
          userId: hopeUser.id,
          familyMemberId: hopeProfile.id,
          onboardingComplete: true,
        },
      })
      results.updated.push('Created/updated UserProfile link for Hope Stone')
    }

    console.log('✅ Mock data addition complete!')
    console.log('📊 Results:')
    console.log(`   - Created: ${results.created.length} items`)
    console.log(`   - Updated: ${results.updated.length} items`)
    if (results.errors.length > 0) {
      console.log(`   - Errors: ${results.errors.length} items`)
    }

    return {
      success: true,
      results,
      profileId: hopeProfile.id,
    }
  } catch (error: any) {
    console.error('❌ Error adding mock data:', error)
    results.errors.push(error.message || 'Unknown error')
    return {
      success: false,
      error: error.message || 'Failed to add mock data',
      results,
    }
  }
}

addMockDataToHopeStone()
  .then((result) => {
    if (result.success) {
      console.log('\n✅ Success! Mock data has been added to Hope Stone\'s profile.')
      console.log(`   - Profile ID: ${result.profileId}`)
    } else {
      console.error('\n❌ Setup failed:', result.error)
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

