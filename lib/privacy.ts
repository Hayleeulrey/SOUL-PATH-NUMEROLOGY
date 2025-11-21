import { prisma } from './prisma'

export interface PrivacyScope {
  userId?: string
  familyMemberId?: string
}

export interface AuditDetails {
  userId?: string
  targetType: string
  targetId?: string
  egress?: boolean
  meta?: any
}

export type PrivacyMode = 'local-only' | 'cloud-allowed' | 'cloud-with-redaction'

const PRIVACY_DEFAULT: PrivacyMode = (process.env.PRIVACY_DEFAULT as PrivacyMode) || 'local-only'

/**
 * Get privacy setting for a given scope
 * Checks member-specific settings first, then user-level, then global default
 */
export async function getPrivacySetting(scope: PrivacyScope): Promise<{ mode: PrivacyMode }> {
  // Try to find member-specific setting
  if (scope.familyMemberId) {
    const memberSetting = await prisma.privacySetting.findUnique({
      where: {
        scope_userId_memberId: {
          scope: 'member',
          userId: scope.userId || '',
          memberId: scope.familyMemberId
        }
      }
    })

    if (memberSetting) {
      return { mode: memberSetting.mode as PrivacyMode }
    }
  }

  // Try to find user-level setting
  if (scope.userId) {
    const userSetting = await prisma.privacySetting.findUnique({
      where: {
        scope_userId_memberId: {
          scope: 'user',
          userId: scope.userId,
          memberId: ''
        }
      }
    })

    if (userSetting) {
      return { mode: userSetting.mode as PrivacyMode }
    }
  }

  // Return global default
  return { mode: PRIVACY_DEFAULT }
}

/**
 * Enforce privacy rules
 * Throws error if attempting cloud request in local-only mode
 */
export async function enforcePrivacy(scope: PrivacyScope, isCloudRequest: boolean = false): Promise<void> {
  const setting = await getPrivacySetting(scope)

  if (setting.mode === 'local-only' && isCloudRequest) {
    throw new Error('Privacy violation: local-only mode enabled. Cloud requests are blocked.')
  }
}

/**
 * Check if current environment allows cloud requests
 */
export function isCloudRequest(): boolean {
  const aiMode = process.env.AI_MODE || 'local'
  return aiMode === 'cloud' || aiMode === 'hybrid'
}

/**
 * Create or update privacy setting
 */
export async function setPrivacySetting(
  scope: PrivacyScope,
  mode: PrivacyMode
): Promise<void> {
  const settingType = scope.familyMemberId ? 'member' : 'user'
  const userId = scope.userId || ''
  const memberId = scope.familyMemberId || ''

  await prisma.privacySetting.upsert({
    where: {
      scope_userId_memberId: {
        scope: settingType,
        userId,
        memberId
      }
    },
    create: {
      scope: settingType,
      userId: scope.userId || undefined,
      memberId: scope.familyMemberId || undefined,
      mode
    },
    update: {
      mode
    }
  })
}

/**
 * Log an audit event
 */
export async function auditLog(action: string, details: AuditDetails): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: details.userId,
        action,
        targetType: details.targetType,
        targetId: details.targetId,
        egress: details.egress || false,
        meta: details.meta ? JSON.stringify(details.meta) : null
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging shouldn't break the application
  }
}

/**
 * Redact sensitive information from text
 * Replaces names, dates, addresses, phone numbers, and emails
 */
export function redact(text: string): string {
  let redacted = text

  // Redact dates (YYYY-MM-DD, MM/DD/YYYY, etc.)
  redacted = redacted.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[DATE]')
  redacted = redacted.replace(/\b\d{4}-\d{2}-\d{2}\b/g, '[DATE]')
  redacted = redacted.replace(/\b\d{1,2}-\d{1,2}-\d{4}\b/g, '[DATE]')

  // Redact potential names (capitalized words followed by another capitalized word)
  // This is heuristic and may have false positives
  redacted = redacted.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]')

  // Redact email addresses
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')

  // Redact phone numbers
  redacted = redacted.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE]')
  redacted = redacted.replace(/\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/g, '[PHONE]')

  // Redact potential addresses (street addresses)
  redacted = redacted.replace(/\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct)\b/g, '[ADDRESS]')

  return redacted
}

/**
 * Get audit logs for a user or family member
 */
export async function getAuditLogs(scope: PrivacyScope, limit: number = 50) {
  return await prisma.auditLog.findMany({
    where: {
      userId: scope.userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}

