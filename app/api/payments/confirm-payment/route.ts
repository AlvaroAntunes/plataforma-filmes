import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializa o cliente Supabase com service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

interface ConfirmPaymentRequest {
  payment_intent_id: string
  payment_method_id: string
  amount: number
  originalAmount?: number
  convertedAmount?: number
  currency?: string
  filmId: string
  userId: string
}

interface ConfirmPaymentResponse {
  id: string
  status: 'succeeded' | 'requires_action' | 'payment_failed'
  amount: number
  payment_method: {
    card: {
      brand: string
      last4: string
    }
  }
  metadata?: {
    filmId: string
    userId: string
  }
  purchase?: any
}

// Função auxiliar para salvar compra no banco de dados
async function savePurchaseToDatabase(response: ConfirmPaymentResponse, filmId: string, userId: string, email: string) {
  console.log('Payment successful - saving to database:', {
    paymentId: response.id,
    filmId,
    userId,
    amount: response.amount,
    email,
    timestamp: new Date().toISOString()
  })

  try {
    // Verificar se a compra já existe
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('movie_id', filmId)
      .eq('payment_id', response.id)
      .single()

    if (!existingPurchase) {
      // Salvar nova compra no banco de dados
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          movie_id: filmId,
          amount: response.amount / 100, // Convert cents to dollars
          payment_id: response.id,
          payment_method: 'stripe',
          status: 'completed',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (purchaseError) {
        console.error('Error saving purchase to database:', purchaseError)
        
        if (purchaseError.code === '23505') {
          // Duplicate key - compra já existe
          console.log('Duplicate purchase detected - continuing')
        } else {
          // Outros erros - log mas não falhar o pagamento
          console.error('Database error (non-critical):', purchaseError)
        }
      } else {
        console.log('Purchase saved successfully:', purchase)
        response.purchase = purchase
      }
    } else {
      console.log('Purchase already exists:', existingPurchase)
      response.purchase = existingPurchase
    }
  } catch (dbError: any) {
    console.error('Database operation failed:', dbError)
    // Não falhar o pagamento por erro de banco
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmPaymentRequest = await request.json()
    
    const { payment_intent_id, payment_method_id, amount, originalAmount, convertedAmount, currency, filmId, userId } = body

    // Validações
    if (!payment_intent_id || !payment_method_id || !amount || !filmId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Payment confirmation with currency data:', {
      originalAmount,
      convertedAmount,
      currency,
      filmId,
      userId
    })

    // Sempre usar Stripe real (sem simulação)
    console.log('Using real Stripe API for payment confirmation')
    
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    
    try {
      // Confirmar pagamento real com Stripe usando payment_method_id
      const confirmedPayment = await stripe.paymentIntents.confirm(payment_intent_id, {
        payment_method: payment_method_id,
        expand: ['charges.data.payment_method_details'] // ✅ Expandir dados do método de pagamento
      })
      
      console.log('Stripe payment confirmation result:', {
        id: confirmedPayment.id,
        status: confirmedPayment.status,
        amount: confirmedPayment.amount
      })
      
      // Verificar se o pagamento falhou
      if (confirmedPayment.status === 'payment_failed' || 
          (confirmedPayment.last_payment_error && confirmedPayment.last_payment_error.code)) {
        
        const errorCode = confirmedPayment.last_payment_error?.code
        const declineCode = confirmedPayment.last_payment_error?.decline_code
        
        // Mapear códigos de erro do Stripe para nossos códigos
        let ourErrorCode = 'card_declined' // padrão
        
        if (errorCode === 'expired_card' || declineCode === 'expired_card') {
          ourErrorCode = 'card_expired'
        } else if (errorCode === 'card_declined' || declineCode === 'generic_decline') {
          ourErrorCode = 'card_declined'
        } else if (errorCode === 'insufficient_funds') {
          ourErrorCode = 'insufficient_funds'
        } else if (errorCode === 'incorrect_cvc') {
          ourErrorCode = 'incorrect_cvc'
        }
        
        return NextResponse.json(
          { 
            error: 'payment_failed',
            errorCode: ourErrorCode,
            message: confirmedPayment.last_payment_error?.message || 'Payment failed',
            decline_code: declineCode || 'generic_decline'
          },
          { status: 402 }
        )
      }
      
      // Se chegou aqui, o pagamento foi bem-sucedido
      // Extrair dados do cartão de forma segura
      let cardBrand = 'unknown'
      let cardLast4 = '0000'
      
      try {
        if (confirmedPayment.charges && 
            confirmedPayment.charges.data && 
            confirmedPayment.charges.data.length > 0) {
          const charge = confirmedPayment.charges.data[0]
          if (charge.payment_method_details && charge.payment_method_details.card) {
            cardBrand = charge.payment_method_details.card.brand || 'unknown'
            cardLast4 = charge.payment_method_details.card.last4 || '0000'
          }
        }
      } catch (cardError) {
        console.log('Could not extract card details, using defaults:', cardError)
      }
      
      const response: ConfirmPaymentResponse = {
        id: confirmedPayment.id,
        status: confirmedPayment.status as 'succeeded' | 'requires_action' | 'payment_failed',
        amount: confirmedPayment.amount,
        payment_method: {
          card: {
            brand: cardBrand,
            last4: cardLast4
          }
        },
        metadata: {
          filmId,
          userId
        }
      }
      
      console.log('Payment confirmed:', {
        id: confirmedPayment.id,
        status: confirmedPayment.status,
        filmId,
        userId,
        cardBrand: cardBrand,
        cardLast4: cardLast4
      })
      
      // Se for sucesso, salvar no banco de dados
      if (response.status === 'succeeded') {
        await savePurchaseToDatabase(response, filmId, userId, 'customer@email.com') // Email será obtido do payment intent metadata
      }

      return NextResponse.json(response)
      
    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError)
      
      // Mapear erros do Stripe para nossos códigos
      let errorCode = 'card_declined'
      if (stripeError.code === 'expired_card') errorCode = 'card_expired'
      if (stripeError.code === 'insufficient_funds') errorCode = 'insufficient_funds'
      if (stripeError.code === 'incorrect_cvc') errorCode = 'incorrect_cvc'
      
      return NextResponse.json(
        { 
          error: 'payment_failed',
          errorCode: errorCode,
          message: stripeError.message || 'Payment processing failed'
        },
        { status: 402 }
      )
    }

  } catch (error: any) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}