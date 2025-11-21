import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server"
import { setPrivacySetting } from '@/lib/privacy'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scopeUserId = searchParams.get('userId') || userId

    const setting = await prisma.privacySetting.findUnique({
      where: {
        scope_userId_memberId: {
          scope: 'user',
          userId: scopeUserId,
          memberId: ''
        }
      }
    })

    return NextResponse.json({
      mode: setting?.mode || 'local-only'
    })
  } catch (error) {
    console.error("Error loading privacy settings:", error)
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { mode } = body

    await setPrivacySetting({ userId }, mode)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving privacy settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}

