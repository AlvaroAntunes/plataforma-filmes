import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, data } = await request.json()
    
    console.log('🍎 FRONTEND DEBUG:', message)
    if (data) {
      console.log('🍎 FRONTEND DATA:', JSON.stringify(data, null, 2))
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Debug log error:', error)
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }
}