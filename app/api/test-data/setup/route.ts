import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { setupTestData } from '@/prisma/seed-test-data'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await setupTestData(userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test data setup completed successfully',
        ...result,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to setup test data',
          results: result.results,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in test data setup endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to setup test data',
      },
      { status: 500 }
    )
  }
}

