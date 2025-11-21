import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FamilyMemberWithRelations } from '@/lib/lineage-types'
import { auth } from '@clerk/nextjs/server'
import { randomUUID } from 'crypto'
import { sendFamilyInvitationEmail } from '@/lib/email-notifications'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Step 1: Get all family members that belong to this user
    const userFamilyMembers = await prisma.familyMember.findMany({
      where: { userId },
      select: { id: true },
    })

    const userFamilyMemberIds = userFamilyMembers.map(m => m.id)

    console.log(`User has ${userFamilyMemberIds.length} family member(s)`)

    // If user has no family members yet, return empty array
    if (userFamilyMemberIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Step 2: Find all relationships where user's members are involved
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [
          { personId: { in: userFamilyMemberIds } },
          { relatedId: { in: userFamilyMemberIds } },
        ],
      },
      select: {
        personId: true,
        relatedId: true,
      },
    })

    // Step 3: Collect all related member IDs
    const relatedMemberIds = new Set<string>()
    relationships.forEach(rel => {
      if (!userFamilyMemberIds.includes(rel.personId)) {
        relatedMemberIds.add(rel.personId)
      }
      if (!userFamilyMemberIds.includes(rel.relatedId)) {
        relatedMemberIds.add(rel.relatedId)
      }
    })

    // Step 4: Get all relevant members (user's members + related members)
    const allRelevantIds = [...userFamilyMemberIds, ...Array.from(relatedMemberIds)]

    console.log(`Fetching ${allRelevantIds.length} family members (${userFamilyMemberIds.length} user's + ${relatedMemberIds.size} related)`)

    if (allRelevantIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    const familyMembers = await prisma.familyMember.findMany({
      where: {
        id: { in: allRelevantIds },
      },
      include: {
        relationshipsAsPerson: {
          include: {
            related: true,
          },
        },
        relationshipsAsRelated: {
          include: {
            person: true,
          },
        },
        photos: true,
        audioFiles: true,
        documents: true,
        stories: true,
        numerologyProfile: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        invitationsSent: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get the most recent invitation
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Add invitation status and user email to each member
    const membersWithInvitationStatus = familyMembers.map(member => ({
      ...member,
      invitationStatus: member.invitationsSent?.[0]?.status || null,
      hasInvitation: member.invitationsSent && member.invitationsSent.length > 0,
      userEmail: member.user?.email || null,
    }))

    return NextResponse.json({
      success: true,
      data: membersWithInvitationStatus,
    })
  } catch (error: any) {
    console.error('Error fetching family members:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    })
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch family members',
        details: process.env.NODE_ENV === 'development' ? {
          code: error?.code,
          meta: error?.meta,
        } : undefined,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      middleName,
      lastName,
      maidenName,
      suffix,
      birthDate,
      deathDate,
      birthCity,
      birthState,
      birthCountry,
      deathCity,
      deathState,
      deathCountry,
      bio,
      notes,
      isAlive = true,
      email, // Optional: email for invitation
      relationshipTypeToUser, // Optional: relationship type from new member to user
      relationships, // Optional: relationships to create (parents, siblings, spouse, children)
    } = body

    // Trim whitespace from names
    const trimmedFirstName = (firstName || '').trim()
    const trimmedLastName = (lastName || '').trim()
    const trimmedMiddleName = middleName ? middleName.trim() : null
    const trimmedMaidenName = maidenName ? maidenName.trim() : null
    const trimmedSuffix = suffix ? suffix.trim() : null
    
    if (!trimmedFirstName || !trimmedLastName) {
      return NextResponse.json(
        {
          success: false,
          error: 'First name and last name are required',
        },
        { status: 400 }
      )
    }
    
    // Helper to parse date string in local timezone (avoids UTC conversion issues)
    const parseLocalDate = (dateString: string | null | undefined): Date | null => {
      if (!dateString) return null
      // Parse YYYY-MM-DD format and create date in local timezone
      const [year, month, day] = dateString.split('-').map(Number)
      if (year && month && day) {
        return new Date(year, month - 1, day)
      }
      return null
    }
    
    // Determine if this should be an unclaimed profile
    // If email is provided, it's for someone else (unclaimed)
    // If no email and no relationshipTypeToUser, it's the user's own profile (claimed)
    // If relationshipTypeToUser is provided, it's for someone else (unclaimed)
    const isUnclaimed = !!email || (!!relationshipTypeToUser && relationshipTypeToUser !== 'SELF' && relationshipTypeToUser !== '')
    
    console.log('Creating family member:', {
      isUnclaimed,
      hasEmail: !!email,
      hasRelationshipType: !!relationshipTypeToUser,
      relationshipType: relationshipTypeToUser
    })
    
    // Create the family member
    const familyMember = await prisma.familyMember.create({
      data: {
        userId: isUnclaimed ? null : userId, // Only set userId if it's the user's own profile
        firstName: trimmedFirstName,
        middleName: trimmedMiddleName,
        lastName: trimmedLastName,
        maidenName: trimmedMaidenName,
        suffix: trimmedSuffix,
        birthDate: parseLocalDate(birthDate),
        deathDate: parseLocalDate(deathDate),
        birthCity,
        birthState,
        birthCountry,
        deathCity,
        deathState,
        deathCountry,
        bio,
        notes,
        isAlive,
        isClaimed: !isUnclaimed, // Auto-claim if it's the user's own profile
        createdBy: userId, // Track who created this profile
      },
    })

    // If relationshipTypeToUser is provided, create the relationship
    let createdRelationship = null
    if (relationshipTypeToUser) {
      // Get the user's own family member profile
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { familyMemberId: true },
      })

      // If userProfile doesn't have a familyMemberId, try to find the user's first family member
      let userFamilyMemberId = userProfile?.familyMemberId
      
      if (!userFamilyMemberId) {
        // Find the first family member that belongs to this user
        const firstUserMember = await prisma.familyMember.findFirst({
          where: { userId },
          select: { id: true },
          orderBy: { createdAt: 'asc' }, // Get the oldest one (likely the user's own profile)
        })
        
        if (firstUserMember) {
          userFamilyMemberId = firstUserMember.id
          console.log('Using first family member as user profile:', userFamilyMemberId)
          
          // Update userProfile to set the familyMemberId for future use
          await prisma.userProfile.upsert({
            where: { userId },
            update: { familyMemberId: userFamilyMemberId },
            create: { userId, familyMemberId: userFamilyMemberId },
          })
        }
      }

      if (!userFamilyMemberId) {
        console.warn('Cannot create relationship: No family member found for user. User must create their own profile first.')
      } else {
        // Create relationship: new member -> user
        // e.g., if user says "This person is my PARENT", then:
        // personId = new member, relatedId = user, relationshipType = PARENT
        // This means "new member has relationship PARENT to user" = "new member is user's parent"
        // When viewing user's profile, it will show "new member is my PARENT"
        // When viewing new member's profile, it will show "user is my CHILD" (inverted)
        try {
          createdRelationship = await prisma.relationship.create({
            data: {
              personId: familyMember.id,
              relatedId: userFamilyMemberId,
              relationshipType: relationshipTypeToUser,
            },
            include: {
              person: true,
              related: true,
            },
          })
          console.log('Relationship created successfully:', {
            relationshipId: createdRelationship.id,
            personId: createdRelationship.personId,
            personName: `${createdRelationship.person.firstName} ${createdRelationship.person.lastName}`,
            relatedId: createdRelationship.relatedId,
            relatedName: `${createdRelationship.related.firstName} ${createdRelationship.related.lastName}`,
            type: createdRelationship.relationshipType
          })
        } catch (error: any) {
          // If relationship already exists, that's okay - just log it
          if (error.code === 'P2002') {
            console.log('Relationship already exists, skipping creation')
          } else {
            console.error('Error creating relationship:', error)
            // Don't fail the entire request if relationship creation fails
          }
        }
      }
    }

    // Process relationships if provided
    const createdRelationships: any[] = []
    
    if (relationships) {
      try {
        console.log('Processing relationships:', JSON.stringify(relationships, null, 2))
        
        // Helper function to create a new member and return its ID
      const createNewMember = async (memberData: { 
        firstName: string
        lastName: string
        maidenName?: string
        suffix?: string
        birthDate?: string
        birthCity?: string
        birthState?: string
        birthCountry?: string
        email?: string
      }): Promise<string> => {
        console.log('createNewMember called with:', memberData)
        
        // Trim whitespace from names
        const firstName = (memberData.firstName || '').trim()
        const lastName = (memberData.lastName || '').trim()
        const maidenName = memberData.maidenName ? memberData.maidenName.trim() : null
        const suffix = memberData.suffix ? memberData.suffix.trim() : null
        const birthCity = memberData.birthCity ? memberData.birthCity.trim() : null
        const birthState = memberData.birthState ? memberData.birthState.trim() : null
        const birthCountry = memberData.birthCountry ? memberData.birthCountry.trim() : null
        
        if (!firstName || !lastName) {
          throw new Error('First name and last name are required')
        }
        
        const newMember = await prisma.familyMember.create({
          data: {
            userId: null, // These are for other people, so unclaimed
            firstName,
            lastName,
            maidenName: maidenName || null,
            suffix: suffix || null,
            birthDate: parseLocalDate(memberData.birthDate),
            birthCity: birthCity || null,
            birthState: birthState || null,
            birthCountry: birthCountry || null,
            isAlive: true,
            isClaimed: false, // Unclaimed by default
            createdBy: userId, // Track who created this profile
          },
        })
        
        console.log('New member created successfully:', {
          id: newMember.id,
          name: `${newMember.firstName} ${newMember.lastName}`
        })

        // Create invitation if email is provided
        if (memberData.email) {
          try {
            const token = randomUUID()
            const invitation = await prisma.familyInvitation.create({
              data: {
                inviterId: userId,
                familyMemberId: newMember.id,
                email: memberData.email,
                token,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                status: 'PENDING' as any, // InvitationStatus enum
              },
            })
            console.log('Invitation created for new member:', newMember.id, memberData.email)

            // Send invitation email
            try {
              // Get inviter's name
              const inviter = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, email: true },
              })
              const inviterName = inviter?.name || inviter?.email || 'A family member'

              // Get family member's name
              const familyMemberName = `${newMember.firstName} ${newMember.lastName}`

              await sendFamilyInvitationEmail(
                memberData.email,
                token,
                inviterName,
                familyMemberName
              )
              console.log('Invitation email sent successfully to:', memberData.email)
            } catch (emailError) {
              console.error('Error sending invitation email:', emailError)
              // Don't fail the request if email fails - invitation is still created
            }
          } catch (error) {
            console.error('Error creating invitation:', error)
            // Don't fail the member creation if invitation fails
          }
        }

        return newMember.id
      }

      // Helper function to create a relationship
      const createRel = async (personId: string, relatedId: string, relationshipType: string) => {
        try {
          const rel = await prisma.relationship.create({
            data: {
              personId,
              relatedId,
              relationshipType: relationshipType as any, // RelationshipType enum
            },
          })
          createdRelationships.push(rel)
          return rel
        } catch (error: any) {
          if (error.code === 'P2002') {
            // Ignore duplicate relationship errors
            console.log('Relationship already exists, skipping')
          } else {
            console.error('Error creating relationship:', {
              error: error.message,
              code: error.code,
              personId,
              relatedId,
              relationshipType
            })
            throw error // Re-throw to surface the error
          }
        }
      }

      // Process parents
      if (relationships.parents && Array.isArray(relationships.parents)) {
        for (let i = 0; i < relationships.parents.length; i++) {
          const parent = relationships.parents[i]
          console.log(`Processing parent ${i + 1}/${relationships.parents.length}:`, parent)
          
          let parentId = parent.id
          
          if (parent.newMember) {
            console.log('Creating new parent member:', parent.newMember)
            if (!parent.newMember.firstName || !parent.newMember.lastName) {
              throw new Error(`Parent ${i + 1} is missing required fields: firstName and lastName are required`)
            }
            
            try {
              parentId = await createNewMember(parent.newMember)
              if (!parentId) {
                throw new Error('createNewMember returned undefined or null')
              }
              console.log('New parent member created with ID:', parentId)
            } catch (error: any) {
              console.error('Failed to create new parent member:', error)
              console.error('Parent data:', JSON.stringify(parent.newMember, null, 2))
              throw new Error(`Failed to create parent member "${parent.newMember.firstName} ${parent.newMember.lastName}": ${error.message || 'Unknown error'}`)
            }
          } else if (!parent.id) {
            throw new Error(`Parent ${i + 1} has neither an existing ID nor newMember data`)
          }
          
          if (parentId) {
            console.log(`Creating relationship: ${parentId} -> ${familyMember.id} (PARENT)`)
            await createRel(parentId, familyMember.id, 'PARENT')
            // Also create inverse relationship (child)
            console.log(`Creating inverse relationship: ${familyMember.id} -> ${parentId} (CHILD)`)
            await createRel(familyMember.id, parentId, 'CHILD')
          } else {
            throw new Error(`No parentId available for parent ${i + 1}: ${JSON.stringify(parent)}`)
          }
        }
      }

      // Process siblings
      if (relationships.siblings && Array.isArray(relationships.siblings)) {
        for (const sibling of relationships.siblings) {
          let siblingId = sibling.id
          if (sibling.newMember) {
            siblingId = await createNewMember(sibling.newMember)
          }
          if (siblingId) {
            await createRel(familyMember.id, siblingId, 'SIBLING')
            // Also create inverse relationship
            await createRel(siblingId, familyMember.id, 'SIBLING')
          }
        }
      }

      // Process spouse
      if (relationships.spouse) {
        let spouseId = relationships.spouse.id
        if (relationships.spouse.newMember) {
          spouseId = await createNewMember(relationships.spouse.newMember)
        }
        if (spouseId) {
          await createRel(familyMember.id, spouseId, 'SPOUSE')
          // Also create inverse relationship
          await createRel(spouseId, familyMember.id, 'SPOUSE')
        }
      }

      // Process children
      if (relationships.children && Array.isArray(relationships.children)) {
        for (const child of relationships.children) {
          let childId = child.id
          if (child.newMember) {
            childId = await createNewMember(child.newMember)
          }
          if (childId) {
            await createRel(familyMember.id, childId, 'CHILD')
            // Also create inverse relationship (parent)
            await createRel(childId, familyMember.id, 'PARENT')
          }
        }
      }
      } catch (relationshipError: any) {
        console.error('Error processing relationships:', relationshipError)
        console.error('Relationship error details:', {
          message: relationshipError?.message,
          code: relationshipError?.code,
          meta: relationshipError?.meta,
          stack: relationshipError?.stack
        })
        // Re-throw the error so the user knows what went wrong
        // This is important for debugging relationship creation issues
        throw new Error(`Failed to create relationships: ${relationshipError?.message || 'Unknown error'}`)
      }
    }

    // Fetch the complete family member with all relationships
    const familyMemberWithRelations = await prisma.familyMember.findUnique({
      where: { id: familyMember.id },
      include: {
        relationshipsAsPerson: {
          include: {
            related: true,
          },
        },
        relationshipsAsRelated: {
          include: {
            person: true,
          },
        },
        photos: true,
        audioFiles: true,
        documents: true,
        stories: true,
        numerologyProfile: true,
      },
    })

    // Create invitation if email was provided
    let invitationStatus = null
    if (email) {
      try {
        const token = randomUUID()
        const invitation = await prisma.familyInvitation.create({
          data: {
            inviterId: userId,
            familyMemberId: familyMember.id,
            email: email,
            token,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: 'PENDING' as any, // InvitationStatus enum
          },
        })
        invitationStatus = invitation.status
        console.log('Invitation created for family member:', familyMember.id, email)

        // Send invitation email
        try {
          // Get inviter's name
          const inviter = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
          })
          const inviterName = inviter?.name || inviter?.email || 'A family member'

          // Get family member's name
          const familyMemberName = `${familyMember.firstName} ${familyMember.lastName}`

          await sendFamilyInvitationEmail(
            email,
            token,
            inviterName,
            familyMemberName
          )
          console.log('Invitation email sent successfully to:', email)
        } catch (emailError) {
          console.error('Error sending invitation email:', emailError)
          // Don't fail the request if email fails - invitation is still created
        }
      } catch (error) {
        console.error('Error creating invitation:', error)
        // Don't fail the member creation if invitation fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...familyMemberWithRelations,
        relationshipTypeToUser: relationshipTypeToUser, // Include for dialog display
        email: email || null, // Include email if provided
      },
      message: 'Family member created successfully',
      relationshipCreated: !!createdRelationship,
      relationship: createdRelationship,
      relationshipsCreated: createdRelationships.length,
      invitationStatus: invitationStatus,
    })
  } catch (error: any) {
    console.error('Error creating family member:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    })
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to create family member',
        details: process.env.NODE_ENV === 'development' ? {
          code: error?.code,
          meta: error?.meta,
        } : undefined,
      },
      { status: 500 }
    )
  }
}
