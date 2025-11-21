import { Resend } from 'resend'
import { prisma } from './prisma'

let resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

/**
 * Send tag notification email
 */
export async function sendTagNotificationEmail(
  email: string,
  taggerName: string,
  contentType: string,
  contentTitle: string
) {
  const resendClient = getResend()
  if (!resendClient) {
    console.warn('RESEND_API_KEY not set, skipping email notification')
    return null
  }

  try {
    const result = await resendClient.emails.send({
      from: 'Soul Path Lineage <noreply@soulpathlineage.com>',
      to: email,
      subject: `You've been tagged in ${contentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been tagged!</h2>
          <p>${taggerName} tagged you in ${contentTitle}.</p>
          <p>Please log in to review and approve this tag.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/lineage/review" 
             style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Review Tag
          </a>
        </div>
      `,
    })
    return result
  } catch (error) {
    console.error('Error sending tag notification email:', error)
    return null
  }
}

/**
 * Send pending content email
 */
export async function sendPendingContentEmail(
  email: string,
  pendingCount: number
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email notification')
    return null
  }

  const resendClient = getResend()
  if (!resendClient) {
    console.warn('RESEND_API_KEY not set, skipping email notification')
    return null
  }

  try {
    const result = await resendClient.emails.send({
      from: 'Soul Path Lineage <noreply@soulpathlineage.com>',
      to: email,
      subject: `You have ${pendingCount} item${pendingCount > 1 ? 's' : ''} pending approval`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Content Pending Your Approval</h2>
          <p>You have ${pendingCount} item${pendingCount > 1 ? 's' : ''} waiting for your review on your family profile.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/lineage/review" 
             style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Review Now
          </a>
        </div>
      `,
    })
    return result
  } catch (error) {
    console.error('Error sending pending content email:', error)
    return null
  }
}

/**
 * Send profile claimed email
 */
export async function sendProfileClaimedEmail(
  email: string,
  inviterName: string
) {
  const resendClient = getResend()
  if (!resendClient) {
    console.warn('RESEND_API_KEY not set, skipping email notification')
    return null
  }

  try {
    const result = await resendClient.emails.send({
      from: 'Soul Path Lineage <noreply@soulpathlineage.com>',
      to: email,
      subject: 'Welcome! Your profile has been claimed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Soul Path Lineage!</h2>
          <p>${inviterName} created a profile for you, and you've successfully claimed it.</p>
          <p>You may have content waiting for your review. Please log in to review and approve any items that were added to your profile.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/lineage/review" 
             style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Review Your Profile
          </a>
        </div>
      `,
    })
    return result
  } catch (error) {
    console.error('Error sending profile claimed email:', error)
    return null
  }
}

/**
 * Send family invitation email
 */
export async function sendFamilyInvitationEmail(
  email: string,
  token: string,
  inviterName: string,
  familyMemberName: string
) {
  // Check if RESEND_API_KEY is configured
  if (!process.env.RESEND_API_KEY) {
    const errorMsg = 'RESEND_API_KEY not set in environment variables'
    console.error('❌ Email sending failed:', errorMsg)
    console.error('   Please add RESEND_API_KEY to your .env file')
    throw new Error(errorMsg)
  }

  const resendClient = getResend()
  if (!resendClient) {
    const errorMsg = 'Failed to initialize Resend client'
    console.error('❌ Email sending failed:', errorMsg)
    throw new Error(errorMsg)
  }

  const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/claim/${token}`

  // Use a verified "from" address - for testing, you can use onboarding@resend.dev
  // For production, use your verified domain
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'Soul Path Lineage <onboarding@resend.dev>'

  console.log('📧 Attempting to send invitation email:', {
    to: email,
    from: fromAddress,
    claimUrl,
    hasApiKey: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 5) + '...',
  })

  try {
    const result = await resendClient.emails.send({
      from: fromAddress,
      to: email,
      subject: `${inviterName} invited you to claim your family profile`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0 0 10px 0;">You've Been Invited!</h1>
            <p style="color: #666; margin: 0; font-size: 16px;">${inviterName} has created a family profile for you</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-top: 0;">Welcome to Soul Path Lineage</h2>
            <p style="color: #666; line-height: 1.6;">
              ${inviterName} has created a family profile for <strong>${familyMemberName}</strong> and invited you to claim it.
            </p>
            <p style="color: #666; line-height: 1.6;">
              By claiming your profile, you'll be able to:
            </p>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li>Manage your profile information</li>
              <li>Review and approve content added by family members</li>
              <li>Receive notifications when you're tagged in photos or stories</li>
              <li>Assign admins to help manage your profile</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${claimUrl}" 
                 style="display: inline-block; padding: 14px 28px; background-color: #819171; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Claim Your Profile
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              This invitation will expire in 30 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 10px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${claimUrl}" style="color: #819171; word-break: break-all;">${claimUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Soul Path Lineage. All rights reserved.
            </p>
          </div>
        </div>
      `,
    })

    console.log('✅ Email sent successfully:', {
      emailId: result?.id,
      to: email,
      result: result,
    })

    return result
  } catch (error: any) {
    console.error('❌ Error sending family invitation email:', {
      error: error?.message,
      name: error?.name,
      code: error?.code,
      details: error,
      stack: error?.stack,
    })
    
    // Re-throw with more context
    throw new Error(`Failed to send invitation email: ${error?.message || 'Unknown error'}`)
  }
}

/**
 * Check if user has email notifications enabled and send if appropriate
 */
export async function sendNotificationIfEnabled(
  userId: string,
  emailFn: () => Promise<any>
) {
  const preference = await prisma.userPreference.findUnique({
    where: { userId },
  })

  // Default to true if preference doesn't exist
  if (preference?.emailNotifications !== false) {
    return emailFn()
  }

  return null
}

