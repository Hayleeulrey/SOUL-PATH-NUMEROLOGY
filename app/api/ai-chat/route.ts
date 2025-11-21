import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server"
import { getAIProvider, type PrivacyScope } from '@/lib/ai'
import { getPrivacySetting, auditLog, redact, enforcePrivacy, isCloudRequest } from '@/lib/privacy'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { familyMemberId, message, conversationId } = body

    if (!familyMemberId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the family member belongs to the user
    const familyMember = await prisma.familyMember.findUnique({
      where: { id: familyMemberId },
      select: { id: true, userId: true },
    })

    if (!familyMember) {
      return NextResponse.json({ error: "Family member not found" }, { status: 404 })
    }

    // Check authorization
    if (familyMember.userId && familyMember.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get privacy scope and settings
    const scope: PrivacyScope = { userId, familyMemberId }
    const privacySetting = await getPrivacySetting(scope)
    
    // Enforce privacy (check if we're trying to use cloud when local-only is set)
    const usingCloud = isCloudRequest()
    await enforcePrivacy(scope, usingCloud)

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: { messages: true }
      })
    }

    if (!conversation) {
      conversation = await prisma.aIConversation.findFirst({
        where: { familyMemberId },
        include: { messages: true },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          familyMemberId,
          name: "Sage"
        },
        include: { messages: true }
      })
    }

    // Get family member context
    const familyMemberWithData = await prisma.familyMember.findUnique({
      where: { id: familyMemberId },
      include: {
        photos: true,
        audioFiles: true,
        documents: true,
        stories: true,
        biographyResponses: {
          include: {
            prompt: true
          }
        },
        relationshipsAsPerson: {
          include: {
            related: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        relationshipsAsRelated: {
          include: {
            person: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    // Apply redaction if needed
    const processedMessage = privacySetting.mode === 'cloud-with-redaction' 
      ? redact(message) 
      : message

    // Save user message
    const userMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message
      }
    })

    // Get conversation history
    const history = conversation.messages.slice(-10).map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content
    }))

    // Get appropriate AI provider
    const ai = await getAIProvider(scope)
    
    // Generate response
    const aiResponse = await ai.generateText(processedMessage, familyMemberWithData, {
      conversationHistory: history
    })

    // Save AI response
    const aiMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse
      }
    })

    // Audit log
    const providerName = process.env.AI_MODE === 'cloud' ? 'OpenAI' : 'Ollama'
    await auditLog('ai_chat', {
      userId,
      targetType: 'conversation',
      targetId: conversation.id,
      egress: privacySetting.mode !== 'local-only',
      meta: { 
        provider: providerName,
        mode: privacySetting.mode,
        messageLength: message.length
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
        conversationId: conversation.id,
        messageId: aiMessage.id
      }
    })
  } catch (error) {
    console.error("Error in AI chat:", error)
    
    // Enhanced error handling
    if (error instanceof Error && error.message.includes('Privacy violation')) {
      return NextResponse.json(
        { 
          error: "Privacy violation",
          message: "Local-only mode is enabled. Please adjust your privacy settings if you want to use cloud AI features."
        },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "Failed to get AI response", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
