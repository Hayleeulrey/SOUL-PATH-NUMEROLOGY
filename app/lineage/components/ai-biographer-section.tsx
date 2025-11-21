"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, Loader2, Sparkles } from "lucide-react"

const CATEGORIES = [
  { id: 'life-stories', label: 'Life Stories', icon: '📖', prompt: 'Tell me about life stories, childhood, education, career, and milestones' },
  { id: 'family', label: 'Family & Relationships', icon: '👨‍👩‍👧‍👦', prompt: 'Tell me about family relationships, connections, traditions, and heritage' },
  { id: 'values', label: 'Values & Wisdom', icon: '💭', prompt: 'Tell me about beliefs, life lessons, and meaningful experiences' },
  { id: 'memories', label: 'Memories & Traditions', icon: '🎉', prompt: 'Tell me about special moments, celebrations, and family culture' }
]

interface Message {
  id: string
  role: "ai" | "user"
  content: string
  timestamp: Date
}

interface AIBiographerSectionProps {
  member: any
}

export function AIBiographerSection({ member }: AIBiographerSectionProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Initialize conversation on mount
  useEffect(() => {
    initializeConversation()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const initializeConversation = async () => {
    // Fetch family context and start the conversation
    try {
      const contextResponse = await fetch(`/api/ai-biographer/context?familyMemberId=${member.id}`)
      const result = await contextResponse.json()
      
      if (result.success && result.data?.context) {
        // Start with a contextual AI greeting
        const greeting = generateAIGreeting(member, result.data.context)
        setMessages([greeting])
      } else {
        throw new Error("Failed to get context")
      }
    } catch (error) {
      console.error("Error initializing conversation:", error)
      setMessages([{
        id: "1",
        role: "ai",
        content: `Hi! I'm Sage, your family's AI biographer dedicated to preserving family lineage, stories, and memories. I'm here to learn about ${member.firstName}'s story. What would you like to share?`,
        timestamp: new Date()
      }])
    }
  }

  const generateAIGreeting = (member: any, context: any): Message => {
    const isReturning = context.dataCounts?.biographyResponses > 0
    const hasRelationships = context.dataCounts?.relationships > 0
    const hasMedia = context.dataCounts?.photos > 0 || context.dataCounts?.audioFiles > 0
    
    if (isReturning) {
      // Build personalized greeting with context
      const contextNotes = []
      if (hasRelationships) {
        contextNotes.push(`${context.dataCounts.relationships} family relationship${context.dataCounts.relationships > 1 ? 's' : ''}`)
      }
      if (context.dataCounts?.photos > 0) {
        contextNotes.push(`${context.dataCounts.photos} photo${context.dataCounts.photos > 1 ? 's' : ''}`)
      }
      if (context.dataCounts?.audioFiles > 0) {
        contextNotes.push(`${context.dataCounts.audioFiles} audio recording${context.dataCounts.audioFiles > 1 ? 's' : ''}`)
      }
      
      return {
        id: Date.now().toString(),
        role: "ai",
        content: `Welcome back! I'm Sage, your family's AI biographer. I'm here to help you continue documenting ${member.firstName}'s life story and preserve your family's lineage.\n\nYou've already documented:\n${contextNotes.length > 0 ? '• ' + contextNotes.join('\n• ') : '• Starting to build your family archive'}\n\nWhat would you like to explore today? We could dive into childhood memories, family traditions, life milestones, values and beliefs, or collect more stories.`,
        timestamp: new Date()
      }
    }

    // New conversation - build personalized welcome
    let welcomeText = `Hello! I'm Sage, your AI biographer dedicated to helping you preserve ${member.firstName}'s family lineage, stories, and memories for future generations.\n\n`
    
    if (hasRelationships) {
      const relationshipTypes = context.relationships?.map((r: any) => r.type).filter(Boolean) || []
      const uniqueTypes = [...new Set(relationshipTypes)]
      welcomeText += `I can see ${context.dataCounts.relationships} family connection${context.dataCounts.relationships > 1 ? 's' : ''} in your family tree (${uniqueTypes.slice(0, 3).join(', ')}). Let's explore those relationships and collect stories about them!\n\n`
    } else {
      welcomeText += `I notice we don't have family relationships documented yet. Let's start building your family tree!\n\n`
    }

    if (context.missingData?.hasNoStories && context.missingData?.hasNoBiography) {
      welcomeText += `To begin, I'd love to help you document:\n\n📖 **Life Stories** - Childhood, education, career, milestones\n👨‍👩‍👧‍👦 **Family & Relationships** - Connections, traditions, heritage\n💭 **Values & Wisdom** - Beliefs, life lessons, meaningful experiences\n🎉 **Memories & Traditions** - Special moments, celebrations, family culture\n\nWhat would you like to begin with today?`
    } else {
      welcomeText += `I can help you document family stories, traditions, memories, and connections. What would you like to share?`
    }

    return {
      id: Date.now().toString(),
      role: "ai",
      content: welcomeText,
      timestamp: new Date()
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call OpenAI API
      const aiResponse = await generateAIResponse(userMessage.content, member, messages, conversationId)
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "ai",
        content: aiResponse.content,
        timestamp: new Date()
      }

      // Update conversation ID if this is a new conversation
      if (aiResponse.conversationId && !conversationId) {
        setConversationId(aiResponse.conversationId)
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      console.error("Error generating AI response:", error)
      
      // Check if it's an API key error
      const errorText = error.message || ''
      const isConfigError = errorText.includes('API key not configured') || 
                           errorText.includes('OPENAI_API_KEY') ||
                           errorText.includes('Missing credentials')
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "ai",
        content: isConfigError 
          ? "Sage needs an API key to work! Please add your OPENAI_API_KEY to the .env file. Get your key from https://platform.openai.com/api-keys"
          : "I apologize, I'm having trouble processing that. Could you try again?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = async (
    userInput: string, 
    member: any, 
    conversationHistory: Message[],
    conversationId: string | null
  ): Promise<{ content: string; conversationId: string }> => {
    // Call the AI chat API
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyMemberId: member.id,
        message: userInput,
        conversationId
      })
    })

    const result = await response.json()
    
    if (!response.ok || !result.success) {
      // Enhanced error message handling
      const errorMessage = result.error || 'Failed to get AI response'
      const errorDetails = result.details || result.message || ''
      throw new Error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`)
    }
    
    return {
      content: result.data.response,
      conversationId: result.data.conversationId
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
    }
  }

  const handleCategoryClick = (category: typeof CATEGORIES[0]) => {
    handleSendMessage(category.prompt)
  }

  const isInitialGreeting = (message: Message, index: number) => {
    return message.role === "ai" && index === 0 && (message.content.includes("I'm Sage") || message.content.includes("dedicated to helping"))
  }

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-b from-[#819171]/10 to-white rounded-lg border border-[#819171]/20 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#819171]/10 to-[#819171]/5">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#819171] shadow-sm">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-black">Sage</h3>
          <p className="text-xs text-black">Learning about {member.firstName}'s story</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div key={message.id}>
            <div
              className={`flex items-start gap-3 ${
                message.role === "ai" ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "ai" 
                  ? "bg-[#819171]" 
                  : "bg-gray-200"
              }`}>
                {message.role === "ai" ? (
                  <Sparkles className="h-4 w-4 text-white" />
                ) : (
                  <span className="text-xs font-semibold text-gray-600">You</span>
                )}
              </div>
              
              {/* Message Content */}
              <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                message.role === "ai"
                  ? "bg-[#819171]/10 border border-[#819171]/20 text-black"
                  : "bg-gray-900 text-white"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            
            {/* Category buttons after initial greeting */}
            {isInitialGreeting(message, index) && (
              <div className="mt-4 ml-11 space-y-2">
                <p className="text-xs font-medium text-black mb-3">Choose a category to begin:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white border border-[#819171]/30 hover:bg-[#819171]/10 hover:border-[#819171] transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium text-black group-hover:text-[#819171]">
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#819171] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="bg-[#819171]/10 border border-[#819171]/20 rounded-2xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-[#819171]" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response or story..."
              className="pr-12 resize-none"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-[#819171] hover:bg-[#6e7a5d] text-white"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-[#819171] mt-2 text-center">
          Sage learns from your family's data to ask smarter questions
        </p>
      </div>
    </div>
  )
}

