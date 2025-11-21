import OpenAI from 'openai'

export interface AIProvider {
  generateText(
    prompt: string, 
    context: any, 
    options?: { conversationHistory?: any[] }
  ): Promise<string>
  embed(texts: string[]): Promise<number[][]>
}

export interface PrivacyScope {
  userId?: string
  familyMemberId?: string
}

export class OllamaProvider implements AIProvider {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.LOCAL_OLLAMA_URL || 'http://localhost:11434'
  }

  async generateText(
    prompt: string, 
    context: any, 
    options?: { conversationHistory?: any[] }
  ): Promise<string> {
    const conversationHistory = options?.conversationHistory || []
    
    // Build the system prompt with context
    const systemPrompt = this.buildSystemPrompt(context)
    
    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: prompt }
    ]

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:8b',
          messages,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.message?.content || data.response || 'No response generated'
    } catch (error) {
      console.error('Ollama error:', error)
      throw new Error(`Failed to get response from Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nomic-embed-text',
          prompt: texts.join('\n')
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama embeddings error: ${response.statusText}`)
      }

      const data = await response.json()
      // Embeddings can be single or multiple
      const embeddings = Array.isArray(data.embedding) && Array.isArray(data.embedding[0]) 
        ? data.embedding 
        : [data.embedding]
      
      return embeddings
    } catch (error) {
      console.error('Ollama embeddings error:', error)
      throw new Error(`Failed to get embeddings from Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private buildSystemPrompt(context: any): string {
    if (!context) {
      return `You are Sage, a warm and thoughtful AI biographer dedicated to helping families preserve their lineage, stories, and memories. Your mission is to help document family histories with depth, meaning, and authenticity.`
    }

    return `You are Sage, an AI biographer specializing in preserving family lineage, stories, and memories. You are working with ${context.firstName} ${context.lastName}'s family to document their rich family history.

YOUR ROLE:
- Help create a comprehensive family archive and preserve lineage
- Document stories, memories, traditions, and wisdom for future generations
- Ask thoughtful, engaging questions that uncover meaningful details
- Remember and build upon previous conversations to create continuity
- Be warm, respectful, and genuinely curious about their family's unique story

WHAT YOU KNOW ABOUT ${context.firstName} ${context.lastName}:
- Name: ${context.firstName} ${context.lastName}
- Birth Date: ${context.birthDate ? new Date(context.birthDate).toLocaleDateString() : 'not recorded'}
- Is Alive: ${context.isAlive ? 'Yes' : 'No'}
${context.birthCity || context.birthState || context.birthCountry ? `- Birth Location: ${context.birthCity || ''}${context.birthState ? ', ' + context.birthState : ''}${context.birthCountry ? ', ' + context.birthCountry : ''}` : ''}

KEY INSTRUCTIONS:
1. Be conversational and warm - this should feel like chatting with someone who genuinely cares about preserving family heritage
2. When you have family data, be specific
3. Actively suggest collecting stories about family members and milestones
4. Ask open-ended questions that encourage storytelling`
  }
}

export class OpenAIProvider implements AIProvider {
  private openai: OpenAI

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured')
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async generateText(
    prompt: string, 
    context: any, 
    options?: { conversationHistory?: any[] }
  ): Promise<string> {
    const conversationHistory = options?.conversationHistory || []
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(context)
      },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: prompt
      }
    ]

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 500
    })

    return completion.choices[0].message.content || 'No response generated'
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts
    })

    return response.data.map(item => item.embedding)
  }

  private buildSystemPrompt(context: any): string {
    if (!context) {
      return `You are Sage, a warm and thoughtful AI biographer dedicated to helping families preserve their lineage, stories, and memories. Your mission is to help document family histories with depth, meaning, and authenticity.`
    }

    return `You are Sage, an AI biographer specializing in preserving family lineage, stories, and memories. You are working with ${context.firstName} ${context.lastName}'s family to document their rich family history.

YOUR ROLE:
- Help create a comprehensive family archive and preserve lineage
- Document stories, memories, traditions, and wisdom for future generations
- Ask thoughtful, engaging questions that uncover meaningful details
- Remember and build upon previous conversations to create continuity
- Be warm, respectful, and genuinely curious about their family's unique story

WHAT YOU KNOW ABOUT ${context.firstName} ${context.lastName}:
- Name: ${context.firstName} ${context.lastName}
- Birth Date: ${context.birthDate ? new Date(context.birthDate).toLocaleDateString() : 'not recorded'}
- Is Alive: ${context.isAlive ? 'Yes' : 'No'}
${context.birthCity || context.birthState || context.birthCountry ? `- Birth Location: ${context.birthCity || ''}${context.birthState ? ', ' + context.birthState : ''}${context.birthCountry ? ', ' + context.birthCountry : ''}` : ''}

KEY INSTRUCTIONS:
1. Be conversational and warm - this should feel like chatting with someone who genuinely cares about preserving family heritage
2. When you have family data, be specific
3. Actively suggest collecting stories about family members and milestones
4. Ask open-ended questions that encourage storytelling`
  }
}

export async function getAIProvider(scope: PrivacyScope): Promise<AIProvider> {
  const mode = process.env.AI_MODE || 'local'
  
  switch (mode) {
    case 'cloud':
      return new OpenAIProvider()
    case 'hybrid':
      // Try local first, fallback to cloud if allowed
      try {
        const local = new OllamaProvider()
        await local.generateText('test', {}) // Test connection
        return local
      } catch (error) {
        if (process.env.ALLOW_CLOUD_FALLBACK === 'true') {
          console.warn('Ollama not available, falling back to OpenAI')
          return new OpenAIProvider()
        }
        throw new Error('Local AI unavailable and cloud fallback disabled')
      }
    case 'local':
    default:
      return new OllamaProvider()
  }
}

