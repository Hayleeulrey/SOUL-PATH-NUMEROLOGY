import { PromptCategory } from '@prisma/client'

export interface BiographyPromptTemplate {
  category: PromptCategory
  question: string
  description: string
}

export const biographyPrompts: BiographyPromptTemplate[] = [
  // Childhood
  {
    category: 'CHILDHOOD',
    question: "What was your childhood home like?",
    description: "Describe the house, neighborhood, or environment where you grew up."
  },
  {
    category: 'CHILDHOOD',
    question: "What games or activities did you love as a child?",
    description: "Share what brought you joy during your early years."
  },
  {
    category: 'CHILDHOOD',
    question: "What was your favorite holiday tradition growing up?",
    description: "Tell us about a special celebration or ritual from your childhood."
  },

  // Family
  {
    category: 'FAMILY',
    question: "What family traditions did you practice?",
    description: "Describe customs, rituals, or traditions that were important to your family."
  },
  {
    category: 'FAMILY',
    question: "What qualities did you inherit from your parents?",
    description: "Physical traits, personality, skills, or values passed down to you."
  },
  {
    category: 'FAMILY',
    question: "What was a memorable family gathering or event?",
    description: "Share a story about a reunion, celebration, or special family moment."
  },

  // Education
  {
    category: 'EDUCATION',
    question: "Who was your favorite teacher and why?",
    description: "Share about an educator who made an impact on your life."
  },
  {
    category: 'EDUCATION',
    question: "What did you dream of becoming when you grew up?",
    description: "Tell us about your childhood aspirations and career dreams."
  },
  {
    category: 'EDUCATION',
    question: "What was your favorite subject in school?",
    description: "Share what you loved learning about."
  },

  // Career
  {
    category: 'CAREER',
    question: "What was your first job?",
    description: "Tell us about your entry into the workforce."
  },
  {
    category: 'CAREER',
    question: "What accomplishments are you most proud of?",
    description: "Share professional or personal achievements that matter to you."
  },
  {
    category: 'CAREER',
    question: "What advice would you give to someone starting in your field?",
    description: "Share wisdom from your career experience."
  },

  // Relationships
  {
    category: 'RELATIONSHIPS',
    question: "How did you meet your partner/spouse?",
    description: "Share the story of how you found your life partner."
  },
  {
    category: 'RELATIONSHIPS',
    question: "What makes your family special?",
    description: "Describe what makes your family unique or close."
  },
  {
    category: 'RELATIONSHIPS',
    question: "What's your favorite memory with your children?",
    description: "Share a special moment with your kids."
  },

  // Values
  {
    category: 'VALUES',
    question: "What life lesson shaped you the most?",
    description: "Share a lesson that fundamentally changed your perspective."
  },
  {
    category: 'VALUES',
    question: "What values do you hope to pass down?",
    description: "Tell us what you want future generations to learn from you."
  },
  {
    category: 'VALUES',
    question: "What are you most grateful for in life?",
    description: "Share what brings you gratitude and appreciation."
  },

  // Milestones
  {
    category: 'MILESTONES',
    question: "What was your proudest moment?",
    description: "Share a moment when you felt truly accomplished."
  },
  {
    category: 'MILESTONES',
    question: "What adventure or trip changed you?",
    description: "Tell us about a journey that had a lasting impact."
  },
  {
    category: 'MILESTONES',
    question: "What advice did you receive that changed your life?",
    description: "Share wisdom someone gave you that made a difference."
  },

  // Traditions
  {
    category: 'TRADITIONS',
    question: "What holiday or celebration means the most to you?",
    description: "Share about a special time of year for you and why."
  },
  {
    category: 'TRADITIONS',
    question: "What recipe or dish represents your family?",
    description: "Tell us about food that connects you to your heritage."
  },
  {
    category: 'TRADITIONS',
    question: "How do you honor your heritage or ancestry?",
    description: "Share ways you connect with your cultural roots."
  },

  // Wisdom
  {
    category: 'WISDOM',
    question: "What would you tell your younger self?",
    description: "Share advice you'd give to the person you used to be."
  },
  {
    category: 'WISDOM',
    question: "What's the most important thing you've learned about happiness?",
    description: "Share your insight into what makes a fulfilling life."
  },
  {
    category: 'WISDOM',
    question: "What legacy do you want to leave?",
    description: "Tell us how you hope to be remembered."
  }
]

export const getCategoryColor = (category: PromptCategory) => {
  const colors: Record<PromptCategory, string> = {
    CHILDHOOD: 'bg-gradient-to-br from-stone-100 to-neutral-100 text-stone-700 border border-stone-300 shadow-sm',
    FAMILY: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-800 border border-amber-200 shadow-sm',
    EDUCATION: 'bg-gradient-to-br from-slate-100 to-gray-100 text-slate-700 border border-slate-300 shadow-sm',
    CAREER: 'bg-gradient-to-br from-neutral-100 to-stone-100 text-neutral-700 border border-neutral-300 shadow-sm',
    RELATIONSHIPS: 'bg-gradient-to-br from-sky-50 to-blue-50 text-sky-700 border border-sky-200 shadow-sm',
    VALUES: 'bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 border border-rose-200 shadow-sm',
    MILESTONES: 'bg-gradient-to-br from-cyan-50 to-teal-50 text-cyan-700 border border-cyan-200 shadow-sm',
    TRADITIONS: 'bg-gradient-to-br from-zinc-100 to-slate-100 text-zinc-700 border border-zinc-300 shadow-sm',
    WISDOM: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200 shadow-sm',
    CUSTOM: 'bg-gradient-to-br from-gray-50 to-slate-50 text-gray-600 border border-gray-200 shadow-sm'
  }
  return colors[category]
}

export const getCategoryIcon = (category: PromptCategory) => {
  const icons: Record<PromptCategory, string> = {
    CHILDHOOD: '🎈',
    FAMILY: '👨‍👩‍👧‍👦',
    EDUCATION: '📚',
    CAREER: '💼',
    RELATIONSHIPS: '💕',
    VALUES: '✨',
    MILESTONES: '🏆',
    TRADITIONS: '🎊',
    WISDOM: '🦉',
    CUSTOM: '📝'
  }
  return icons[category]
}

