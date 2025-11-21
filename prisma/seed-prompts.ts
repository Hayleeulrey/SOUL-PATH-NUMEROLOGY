import { PrismaClient } from '@prisma/client'
import { biographyPrompts } from '../lib/biography-prompts'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding biography prompts...')

  // Check if prompts already exist
  const existingPrompts = await prisma.biographyPrompt.count()
  
  if (existingPrompts === 0) {
    // Seed prompts
    for (let i = 0; i < biographyPrompts.length; i++) {
      const prompt = biographyPrompts[i]
      await prisma.biographyPrompt.create({
        data: {
          category: prompt.category,
          question: prompt.question,
          description: prompt.description,
          order: i,
          isActive: true,
        }
      })
    }
    console.log(`✓ Created ${biographyPrompts.length} biography prompts`)
  } else {
    console.log(`✓ Prompts already exist (${existingPrompts} prompts found)`)
  }
}

main()
  .catch((e) => {
    console.error('Error seeding prompts:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

