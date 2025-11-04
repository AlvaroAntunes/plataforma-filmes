import { NextRequest, NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
import { createClient } from '@supabase/supabase-js'

// Inicializa o cliente Supabase com service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { orderID, PayerID, filmId, userId } = body

    console.log('=== PAYPAL CAPTURE API START ===')
    console.log('Request body received:', { orderID, PayerID, filmId, userId })
    console.log('Full body:', body)

    if (!orderID) {
      console.error('Missing orderID in request')
      return NextResponse.json(
        { 
          error: 'Order ID is required',
          received: body,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    console.log(`Starting PayPal capture for order: ${orderID}`)

    // PASSO 1: Captura o pagamento no PayPal
    let payment
    try {
      payment = await capturePayPalOrder(orderID)
      console.log('PayPal capture successful:', payment)
    } catch (paypalError: any) {
      console.error('PayPal capture failed:', paypalError)
      return NextResponse.json(
        { 
          error: `PayPal capture failed: ${paypalError.message}`,
          orderID,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    // PASSO 2: Validar dados do pagamento
    const finalFilmId = payment.filmId || filmId
    const finalUserId = payment.userId || userId
    
    console.log('Payment data validation:', {
      paymentStatus: payment.status,
      filmId: finalFilmId,
      userId: finalUserId,
      amount: payment.amount,
      paymentId: payment.id
    })

    // Verifica se o pagamento foi completado
    if (payment.status !== 'COMPLETED') {
      console.error(`Payment status is ${payment.status}, expected COMPLETED`)
      return NextResponse.json(
        { 
          error: `Payment not completed. Status: ${payment.status}`,
          payment,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // PASSO 3: Verifica se temos os dados necessários
    if (!finalFilmId || !finalUserId) {
      console.warn('Missing filmId or userId, but payment was successful:', {
        filmId: finalFilmId,
        userId: finalUserId
      })
      
      // Retorna sucesso mesmo sem poder salvar no banco
      return NextResponse.json({ 
        success: true, 
        warning: 'Payment successful but missing filmId or userId for database storage',
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          filmId: finalFilmId,
          userId: finalUserId,
          email: payment.email
        },
        purchase: null,
        timestamp: new Date().toISOString()
      })
    }

    // PASSO 4: Verifica se a compra já existe
    console.log('Checking for existing purchase...')
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', finalUserId)
      .eq('movie_id', finalFilmId)
      .eq('payment_id', payment.id)
      .single()

    if (existingPurchase) {
      console.log('Purchase already exists:', existingPurchase)
      return NextResponse.json({ 
        success: true, 
        message: 'Purchase already recorded',
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          filmId: finalFilmId,
          userId: finalUserId,
          email: payment.email
        },
        purchase: existingPurchase,
        timestamp: new Date().toISOString()
      })
    }

    // PASSO 5: Salva a compra no banco de dados
    console.log('Saving purchase to database...')
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: finalUserId,
        movie_id: finalFilmId,
        amount: payment.amount,
        payment_id: payment.id,
        payment_method: 'paypal',
        status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Error saving purchase to database:', purchaseError)
      
      // Verificar tipo específico do erro
      if (purchaseError.code === '23505') {
        // Violação de chave única - compra duplicada
        console.log('Duplicate purchase detected (unique constraint violation)')
        
        // Buscar a compra existente
        const { data: duplicatePurchase } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', finalUserId)
          .eq('movie_id', finalFilmId)
          .eq('payment_method', 'paypal')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return NextResponse.json({ 
          success: true, 
          message: 'Purchase already exists (duplicate prevented)',
          payment: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            filmId: finalFilmId,
            userId: finalUserId,
            email: payment.email
          },
          purchase: duplicatePurchase,
          timestamp: new Date().toISOString()
        })
        
      } else if (purchaseError.code === '23502') {
        // Violação de NOT NULL
        console.error('Missing required fields for purchase:', purchaseError)
        return NextResponse.json(
          { 
            error: 'Missing required data for purchase record',
            details: purchaseError.message,
            payment,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
        
      } else {
        // Outros erros de banco
        console.error('Database error (non-critical):', purchaseError)
        
        // Decidir se continuar ou falhar baseado na criticidade
        // Para preservar o pagamento bem-sucedido, vamos continuar
        return NextResponse.json({ 
          success: true,
          warning: 'Payment successful but database save failed',
          payment: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            filmId: finalFilmId,
            userId: finalUserId,
            email: payment.email
          },
          purchase: null,
          dbError: purchaseError.message,
          timestamp: new Date().toISOString()
        })
      }
    }

    // PASSO 6: Sucesso completo
    console.log('Purchase saved successfully:', purchase)
    
    const endTime = Date.now()
    console.log(`=== PAYPAL CAPTURE API COMPLETED IN ${endTime - startTime}ms ===`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment captured and purchase recorded successfully',
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        filmId: finalFilmId,
        userId: finalUserId,
        email: payment.email
      },
      purchase,
      processingTime: endTime - startTime,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    const endTime = Date.now()
    console.error('=== PAYPAL CAPTURE API ERROR ===')
    console.error('Error details:', error)
    console.error('Error stack:', error.stack)
    console.error(`Processing time: ${endTime - startTime}ms`)
    
    const errorMessage = error.message || 'Failed to capture PayPal order'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.toString(),
        timestamp: new Date().toISOString(),
        processingTime: endTime - startTime
      },
      { status: 500 }
    )
  }
}

// Função auxiliar para validar dados de compra
function validatePurchaseData(payment: any, filmId?: string, userId?: string) {
  const errors: string[] = []
  
  if (!payment.id) errors.push('Missing payment ID')
  if (!payment.amount || payment.amount <= 0) errors.push('Invalid payment amount')
  if (!filmId && !payment.filmId) errors.push('Missing film ID')
  if (!userId && !payment.userId) errors.push('Missing user ID')
  
  return {
    isValid: errors.length === 0,
    errors
  }
}