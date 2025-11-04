import { NextRequest, NextResponse } from 'next/server'
import { createPayPalOrder, createPayPalStandardUrl } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Validate required fields
    const { filmId, userId, amount, email, title } = orderData
    if (!filmId || !userId || !amount || !email || !title) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Try PayPal SDK first, fallback to Standard
    try {
      const order = await createPayPalOrder(orderData)
      return NextResponse.json(order)
    } catch (sdkError) {
      // Fallback to PayPal Standard
      const paypalUrl = createPayPalStandardUrl(orderData)
      return NextResponse.json({ 
        approvalUrl: paypalUrl,
        method: 'standard'
      })
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Falha ao criar pedido PayPal' },
      { status: 500 }
    )
  }
}