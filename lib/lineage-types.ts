import { 
  FamilyMember, 
  Relationship, 
  Photo, 
  AudioFile, 
  Document, 
  Story, 
  NumerologyProfile,
  RelationshipType,
  StoryCategory,
  FamilyInvitation
} from '@prisma/client'

// Extended types with relationships
export interface FamilyMemberWithRelations extends FamilyMember {
  relationshipsAsPerson: RelationshipWithRelated[]
  relationshipsAsRelated: RelationshipWithPerson[]
  photos: Photo[]
  audioFiles: AudioFile[]
  documents: Document[]
  stories: Story[]
  numerologyProfile?: NumerologyProfile
  invitationsSent?: FamilyInvitation[]
  invitationStatus?: string | null
  hasInvitation?: boolean
}

export interface RelationshipWithRelated extends Relationship {
  related: FamilyMember
}

export interface RelationshipWithPerson extends Relationship {
  person: FamilyMember
}

// Form types for creating/updating family members
export interface CreateFamilyMemberData {
  firstName: string
  middleName?: string
  lastName: string
  maidenName?: string
  birthDate?: string
  deathDate?: string
  birthCity?: string
  birthState?: string
  birthCountry?: string
  deathCity?: string
  deathState?: string
  deathCountry?: string
  bio?: string
  notes?: string
  isAlive?: boolean
}

export interface UpdateFamilyMemberData extends Partial<CreateFamilyMemberData> {
  id: string
}

// Relationship form types
export interface CreateRelationshipData {
  personId: string
  relatedId: string
  relationshipType: RelationshipType
  notes?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
}

// Story form types
export interface CreateStoryData {
  familyMemberId: string
  title: string
  content: string
  category: StoryCategory
  summary?: string
  tags?: string[]
  isPublic?: boolean
  sourceType?: string
  sourceId?: string
}

// Media upload types
export interface MediaUploadResult {
  success: boolean
  filename?: string
  filePath?: string
  error?: string
}

// Family tree node type for visualization
export interface FamilyTreeNode {
  id: string
  name: string
  firstName: string
  lastName: string
  birthDate?: Date
  deathDate?: Date
  isAlive: boolean
  profilePhoto?: string
  children: FamilyTreeNode[]
  parents: FamilyTreeNode[]
  siblings: FamilyTreeNode[]
  spouses: FamilyTreeNode[]
}

// Search and filter types
export interface FamilyMemberFilters {
  search?: string
  isAlive?: boolean
  relationshipType?: RelationshipType
  hasStories?: boolean
  hasPhotos?: boolean
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Re-export Prisma types
export type { 
  FamilyMember, 
  Relationship, 
  Photo, 
  AudioFile, 
  Document, 
  Story, 
  NumerologyProfile,
  RelationshipType,
  StoryCategory 
} from '@prisma/client'
