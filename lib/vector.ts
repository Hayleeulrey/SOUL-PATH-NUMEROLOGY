import { prisma } from './prisma'

export interface VectorResult {
  entityId: string
  entityType: string
  content: string
  score: number
}

/**
 * Upsert a vector embedding
 */
export async function upsertVector(
  entityType: string,
  entityId: string,
  namespace: string,
  content: string,
  embedding: number[]
): Promise<void> {
  await prisma.vectorEmbedding.upsert({
    where: {
      entityType_entityId: {
        entityType,
        entityId
      }
    },
    create: {
      entityType,
      entityId,
      namespace,
      content,
      embedding: JSON.stringify(embedding)
    },
    update: {
      content,
      embedding: JSON.stringify(embedding)
    }
  })
}

/**
 * Search for similar vectors using cosine similarity
 * Note: SQLite doesn't have native vector operations, so we compute in-memory
 * For production, consider upgrading to sqlite-vec extension or pgvector
 */
export async function searchVectors(
  queryEmbedding: number[],
  namespace: string,
  k: number = 5
): Promise<VectorResult[]> {
  // Fetch all vectors in the namespace
  const vectors = await prisma.vectorEmbedding.findMany({
    where: {
      namespace
    }
  })

  // Calculate cosine similarity for each vector
  const results: Array<{ result: VectorResult; score: number }> = []

  for (const vec of vectors) {
    try {
      const embedding = JSON.parse(vec.embedding) as number[]
      const score = cosineSimilarity(queryEmbedding, embedding)
      
      results.push({
        result: {
          entityId: vec.entityId,
          entityType: vec.entityType,
          content: vec.content,
          score
        },
        score
      })
    } catch (error) {
      console.error('Error parsing embedding:', error)
      continue
    }
  }

  // Sort by score descending and return top k
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(item => item.result)
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Delete vectors for an entity
 */
export async function deleteVectors(
  entityType: string,
  entityId: string
): Promise<void> {
  await prisma.vectorEmbedding.deleteMany({
    where: {
      entityType,
      entityId
    }
  })
}

/**
 * Delete all vectors for a namespace (e.g., when deleting a family member)
 */
export async function deleteNamespace(namespace: string): Promise<void> {
  await prisma.vectorEmbedding.deleteMany({
    where: {
      namespace
    }
  })
}

