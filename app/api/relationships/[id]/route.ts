import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const relationship = await prisma.relationship.findUnique({
      where: {
        id,
      },
      include: {
        person: true,
        related: true,
      },
    })

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      )
    }

    // Verify at least one member belongs to the user
    const person = relationship.person as any
    const related = relationship.related as any

    if (person.userId !== userId && related.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json(relationship)
  } catch (error) {
    console.error("Error fetching relationship:", error)
    return NextResponse.json(
      { error: "Failed to fetch relationship" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const {
      relationshipType,
      notes,
    } = body

    // First, verify the relationship exists and belongs to the user
    const existingRelationship = await prisma.relationship.findUnique({
      where: {
        id,
      },
      include: {
        person: true,
        related: true,
      },
    })

    if (!existingRelationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      )
    }

    // Verify at least one member belongs to the user
    const person = existingRelationship.person as any
    const related = existingRelationship.related as any

    if (person.userId !== userId && related.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - you can only update relationships for your family members" },
        { status: 403 }
      )
    }

    const relationship = await prisma.relationship.update({
      where: {
        id,
      },
      data: {
        relationshipType,
        notes,
      },
      include: {
        person: true,
        related: true,
      },
    })

    return NextResponse.json(relationship)
  } catch (error: any) {
    console.error("Error updating relationship:", error)
    
    // Provide more specific error messages
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "Failed to update relationship",
        details: error.message || String(error)
      },
      { status: 500 }
    )
  }
}

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

    // First, verify the relationship exists and belongs to the user
    const existingRelationship = await prisma.relationship.findUnique({
      where: {
        id,
      },
      include: {
        person: true,
        related: true,
      },
    })

    if (!existingRelationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      )
    }

    // Verify at least one member belongs to the user
    const person = existingRelationship.person as any
    const related = existingRelationship.related as any

    if (person.userId !== userId && related.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - you can only delete relationships for your family members" },
        { status: 403 }
      )
    }

    await prisma.relationship.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting relationship:", error)
    return NextResponse.json(
      { error: "Failed to delete relationship" },
      { status: 500 }
    )
  }
}
