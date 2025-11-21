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
    const isProfile = formData.get("isProfile") === "true"

    // Verify that the family member exists
    const familyMember = await prisma.familyMember.findUnique({
      where: { id: familyMemberId },
    })

    if (!familyMember) {
      return NextResponse.json({ error: "Family member not found" }, { status: 404 })
    }

    // Check permissions - anyone can add photos (they can be tagged), but if profile is claimed
    // and user is not owner/admin, we'll create an approval record
    const { canEditProfile } = await import('@/lib/permissions')
    const canEdit = await canEditProfile(familyMemberId, userId)

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
    
    // Save file to public/uploads/photos directory
    const uploadDir = join(process.cwd(), "public", "uploads", "photos")
    await mkdir(uploadDir, { recursive: true })
    
    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Store metadata in database
    console.log("Creating photo record for member:", familyMemberId)
    const photo = await prisma.photo.create({
      data: {
        familyMemberId,
        filename,
        originalName: file.name,
        filePath: `/uploads/photos/${filename}`,
        fileSize: file.size,
        mimeType: file.type,
        isProfile,
        createdBy: userId,
      },
    })

    // If profile is claimed and user doesn't have edit permissions, create approval record
    if (familyMember.isClaimed && !canEdit) {
      const { createContentApproval } = await import('@/lib/approvals')
      const { sendApprovalNotification } = await import('@/lib/notifications')
      
      await createContentApproval('photo', photo.id, familyMemberId, userId)
      
      // Send notification to profile owner
      if (familyMember.userId) {
        await sendApprovalNotification(familyMemberId, photo.id)
      }
    }

    console.log("Photo record created:", photo)
    return NextResponse.json({ success: true, data: photo })
  } catch (error) {
    console.error("Error creating photo:", error)
    return NextResponse.json({ error: "Failed to create photo" }, { status: 500 })
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

    let photos
    if (familyMemberId) {
      // First verify the family member belongs to the user
      const familyMember = await prisma.familyMember.findUnique({
        where: { id: familyMemberId },
      })

      if (!familyMember || familyMember.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      photos = await prisma.photo.findMany({
        where: { familyMemberId },
        orderBy: { isProfile: "desc" },
      })
    } else {
      // Get all photos for family members belonging to the user
      photos = await prisma.photo.findMany({
        where: {
          familyMember: {
            userId,
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json({ success: true, data: photos })
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

