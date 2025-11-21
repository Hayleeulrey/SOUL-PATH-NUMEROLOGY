import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import { join } from "path"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const audioFile = await prisma.audioFile.findUnique({
      where: { id },
    })

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "Audio file not found" },
        { status: 404 }
      )
    }

    // Delete file from filesystem
    const filePath = join(process.cwd(), "public", audioFile.filePath)
    try {
      await unlink(filePath)
    } catch (error) {
      console.error("Error deleting file:", error)
    }

    // Delete from database
    await prisma.audioFile.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting audio file:", error)
    return NextResponse.json({ error: "Failed to delete audio file" }, { status: 500 })
  }
}

