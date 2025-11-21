import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { unlink } from "fs/promises"
import { join } from "path"
import { canEditContent } from "@/lib/permissions"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const photo = await prisma.photo.findUnique({
      where: { id },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Check permissions - user must be able to edit the content
    const canEdit = await canEditContent('photo', id, userId)
    if (!canEdit) {
      return NextResponse.json(
        { error: "Unauthorized - you do not have permission to delete this photo" },
        { status: 403 }
      )
    }

    // Delete the file
    try {
      const filePath = join(process.cwd(), "public", photo.filePath)
      await unlink(filePath)
    } catch (fileError) {
      console.error("Error deleting file:", fileError)
      // Continue even if file deletion fails
    }

    // Delete the database record
    await prisma.photo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting photo:", error)
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}

