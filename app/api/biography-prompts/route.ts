import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")

    const where = category ? { 
      category: category as any, 
      isActive: true 
    } : { 
      isActive: true 
    }

    const prompts = await prisma.biographyPrompt.findMany({
      where,
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ success: true, data: prompts })
  } catch (error) {
    console.error("Error fetching prompts:", error)
    return NextResponse.json({ 
      error: "Failed to fetch prompts", 
      details: String(error)
    }, { status: 500 })
  }
}

