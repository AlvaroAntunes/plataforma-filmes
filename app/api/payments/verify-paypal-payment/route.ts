import { NextRequest, NextResponse } from 'next/server'
import { verifyPayPalPayment } from '@/lib/paypal'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const isValid = await verifyPayPalPayment(orderId)
    
    return NextResponse.json({ 
      orderId,
      isValid,
      status: isValid ? 'COMPLETED' : 'NOT_FOUND_OR_PENDING'
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Failed to verify PayPal payment',
        orderId: null,
        isValid: false
      },
      { status: 500 }
    )
  }
}
