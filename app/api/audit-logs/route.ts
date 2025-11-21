import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getAuditLogs } from '@/lib/privacy'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const logs = await getAuditLogs({ userId }, limit)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error loading audit logs:", error)
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 })
  }
}

