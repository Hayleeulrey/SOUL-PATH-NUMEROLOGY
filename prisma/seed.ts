import { PrismaClient, RelationshipType, StoryCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample family members
  const grandpa = await prisma.familyMember.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      birthDate: new Date('1920-05-15'),
      deathDate: new Date('2010-03-22'),
      birthCity: 'Springfield',
      birthState: 'IL',
      birthCountry: 'USA',
      deathCity: 'Chicago',
      deathState: 'IL',
      deathCountry: 'USA',
      bio: 'A hardworking farmer who served in World War II. Known for his wisdom and storytelling.',
      isAlive: false,
    },
  })

  const grandma = await prisma.familyMember.create({
    data: {
      firstName: 'Mary',
      lastName: 'Smith',
      birthDate: new Date('1925-08-10'),
      deathDate: new Date('2015-11-30'),
      birthCity: 'Springfield',
      birthState: 'IL',
      birthCountry: 'USA',
      deathCity: 'Chicago',
      deathState: 'IL',
      deathCountry: 'USA',
      bio: 'A devoted mother and grandmother who loved gardening and cooking. She kept detailed family records.',
      isAlive: false,
    },
  })

  const dad = await prisma.familyMember.create({
    data: {
      firstName: 'Robert',
      middleName: 'John',
      lastName: 'Smith',
      birthDate: new Date('1950-12-03'),
      birthCity: 'Chicago',
      birthState: 'IL',
      birthCountry: 'USA',
      bio: 'A successful engineer who inherited his father\'s work ethic and his mother\'s attention to detail.',
      isAlive: true,
    },
  })

  const mom = await prisma.familyMember.create({
    data: {
      firstName: 'Susan',
      middleName: 'Marie',
      lastName: 'Johnson',
      birthDate: new Date('1955-04-18'),
      birthCity: 'Milwaukee',
      birthState: 'WI',
      birthCountry: 'USA',
      bio: 'A teacher and artist who brought creativity and warmth to the family.',
      isAlive: true,
    },
  })

  const you = await prisma.familyMember.create({
    data: {
      firstName: 'Your',
      middleName: 'Name',
      lastName: 'Here',
      birthDate: new Date('1985-07-20'),
      birthCity: 'Chicago',
      birthState: 'IL',
      birthCountry: 'USA',
      bio: 'The family historian and creator of this lineage project.',
      isAlive: true,
    },
  })

  // Create relationships
  await prisma.relationship.createMany({
    data: [
      // Grandpa and Grandma are spouses
      {
        personId: grandpa.id,
        relatedId: grandma.id,
        relationshipType: RelationshipType.SPOUSE,
        startDate: new Date('1945-06-15'),
        endDate: new Date('2010-03-22'), // Grandpa's death
        isActive: false,
      },
      {
        personId: grandma.id,
        relatedId: grandpa.id,
        relationshipType: RelationshipType.SPOUSE,
        startDate: new Date('1945-06-15'),
        endDate: new Date('2015-11-30'), // Grandma's death
        isActive: false,
      },
      
      // Grandpa and Grandma are parents of Dad
      {
        personId: grandpa.id,
        relatedId: dad.id,
        relationshipType: RelationshipType.PARENT,
        isActive: true,
      },
      {
        personId: grandma.id,
        relatedId: dad.id,
        relationshipType: RelationshipType.PARENT,
        isActive: true,
      },
      {
        personId: dad.id,
        relatedId: grandpa.id,
        relationshipType: RelationshipType.CHILD,
        isActive: true,
      },
      {
        personId: dad.id,
        relatedId: grandma.id,
        relationshipType: RelationshipType.CHILD,
        isActive: true,
      },
      
      // Dad and Mom are spouses
      {
        personId: dad.id,
        relatedId: mom.id,
        relationshipType: RelationshipType.SPOUSE,
        startDate: new Date('1975-09-12'),
        isActive: true,
      },
      {
        personId: mom.id,
        relatedId: dad.id,
        relationshipType: RelationshipType.SPOUSE,
        startDate: new Date('1975-09-12'),
        isActive: true,
      },
      
      // Dad and Mom are parents of You
      {
        personId: dad.id,
        relatedId: you.id,
        relationshipType: RelationshipType.PARENT,
        isActive: true,
      },
      {
        personId: mom.id,
        relatedId: you.id,
        relationshipType: RelationshipType.PARENT,
        isActive: true,
      },
      {
        personId: you.id,
        relatedId: dad.id,
        relationshipType: RelationshipType.CHILD,
        isActive: true,
      },
      {
        personId: you.id,
        relatedId: mom.id,
        relationshipType: RelationshipType.CHILD,
        isActive: true,
      },
    ],
  })

  // Create sample stories
  await prisma.story.createMany({
    data: [
      {
        familyMemberId: grandpa.id,
        title: 'World War II Service',
        content: 'Served in the Army from 1942-1945. Was stationed in Europe and participated in the liberation of France. Received several medals for bravery.',
        category: StoryCategory.MILITARY,
        summary: 'Grandpa\'s military service during WWII',
        isAI: false,
        sourceType: 'manual',
      },
      {
        familyMemberId: grandma.id,
        title: 'Family Recipe Collection',
        content: 'Collected and preserved over 200 family recipes, many passed down from her own grandmother. Her apple pie recipe won the county fair three years in a row.',
        category: StoryCategory.MEMORIES,
        summary: 'Grandma\'s famous recipe collection and cooking achievements',
        isAI: false,
        sourceType: 'manual',
      },
      {
        familyMemberId: dad.id,
        title: 'Engineering Career',
        content: 'Started as a junior engineer at a local firm and worked his way up to senior project manager. Led the design of several major infrastructure projects in the Chicago area.',
        category: StoryCategory.CAREER,
        summary: 'Dad\'s successful engineering career progression',
        isAI: false,
        sourceType: 'manual',
      },
      {
        familyMemberId: mom.id,
        title: 'Teaching Philosophy',
        content: 'Believed that every child has unique potential and worked tirelessly to help students discover their talents. Many former students still keep in touch decades later.',
        category: StoryCategory.CAREER,
        summary: 'Mom\'s dedication to teaching and student success',
        isAI: false,
        sourceType: 'manual',
      },
    ],
  })

  // Create numerology profiles for living family members
  await prisma.numerologyProfile.createMany({
    data: [
      {
        familyMemberId: dad.id,
        soulNumber: '7/7',
        outerPersonality: '4/4',
        destinyNumber: '11/2',
        lifeLesson: '3/3',
        notes: 'Strong spiritual and analytical nature with practical application',
      },
      {
        familyMemberId: mom.id,
        soulNumber: '6/6',
        outerPersonality: '3/3',
        destinyNumber: '9/9',
        lifeLesson: '5/5',
        notes: 'Nurturing soul with creative expression and humanitarian destiny',
      },
      {
        familyMemberId: you.id,
        soulNumber: '5/5',
        outerPersonality: '1/1',
        destinyNumber: '6/6',
        lifeLesson: '7/7',
        notes: 'Adventurous spirit with leadership qualities and spiritual growth path',
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log('📊 Created:')
  console.log(`   - ${await prisma.familyMember.count()} family members`)
  console.log(`   - ${await prisma.relationship.count()} relationships`)
  console.log(`   - ${await prisma.story.count()} stories`)
  console.log(`   - ${await prisma.numerologyProfile.count()} numerology profiles`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
