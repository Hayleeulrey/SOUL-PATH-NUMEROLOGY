import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const familyMemberId = formData.get("familyMemberId") as string

    // Verify that the family member exists
    const familyMember = await prisma.familyMember.findUnique({
      where: { id: familyMemberId },
    })

    if (!familyMember) {
      return NextResponse.json({ error: "Family member not found" }, { status: 404 })
    }

    // Check permissions - anyone can add documents (they can be tagged), but if profile is claimed
    // and user is not owner/admin, we'll create an approval record
    const { canEditProfile } = await import('@/lib/permissions')
    const canEdit = await canEditProfile(familyMemberId, userId)
    const title = formData.get("title") as string || ""
    const description = formData.get("description") as string || ""
    const tags = formData.get("tags") as string || ""

    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    
    // Save file to public/uploads/documents directory
    const uploadDir = join(process.cwd(), "public", "uploads", "documents")
    await mkdir(uploadDir, { recursive: true })
    
    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Store metadata in database
    const document = await prisma.document.create({
      data: {
        familyMemberId,
        filename,
        originalName: file.name,
        filePath: `/uploads/documents/${filename}`,
        fileSize: file.size,
        mimeType: file.type,
        title: title || undefined,
        description: description || undefined,
        createdBy: userId,
      },
    })

    // If profile is claimed and user doesn't have edit permissions, create approval record
    if (familyMember.isClaimed && !canEdit) {
      const { createContentWithApproval } = await import('@/lib/content-helpers')
      await createContentWithApproval('document', document.id, familyMemberId, userId)
    }

    return NextResponse.json({ success: true, data: document })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const familyMemberId = searchParams.get("familyMemberId")

    let documents
    if (familyMemberId) {
      // First verify the family member belongs to the user
      const familyMember = await prisma.familyMember.findUnique({
        where: { id: familyMemberId },
      })

      if (!familyMember || familyMember.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      documents = await prisma.document.findMany({
        where: { familyMemberId },
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Get all documents for family members belonging to the user
      documents = await prisma.document.findMany({
        where: {
          familyMember: {
            userId,
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json({ success: true, data: documents })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

