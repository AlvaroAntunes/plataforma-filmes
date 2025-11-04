import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface StripeApplePayRequest {
  paymentMethodId: string
  amount: number
  originalAmount?: number // ✅ Valor original em USD
  currency?: string // ✅ Moeda selecionada
  filmId: string
  userId: string
  return_url?: string // ✅ ADICIONAR campo opcional
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  console.log('🍎='.repeat(50))
  console.log(`🍎 APPLE PAY DEBUG SESSION STARTED - ${timestamp}`)
  console.log('🍎='.repeat(50))
  
  try {
    console.log('🍎 STEP 1: Parsing request body...')
    const body = await request.json()
    console.log('🍎 STEP 1: ✅ Body parsed successfully')
    console.log('🍎 STEP 1: Raw body:', JSON.stringify(body, null, 2))
    
    const { paymentMethodId, amount, originalAmount, currency, filmId, userId, return_url }: StripeApplePayRequest = body
    
    console.log('🍎 STEP 2: Extracted data:')
    console.log('🍎 STEP 2: - paymentMethodId:', paymentMethodId)
    console.log('🍎 STEP 2: - amount:', amount)
    console.log('🍎 STEP 2: - originalAmount:', originalAmount)
    console.log('🍎 STEP 2: - currency:', currency)
    console.log('🍎 STEP 2: - filmId:', filmId)
    console.log('🍎 STEP 2: - userId:', userId)
    console.log('🍎 STEP 2: - return_url:', return_url)

    // Validate required fields
    console.log('🍎 STEP 3: Validating required fields...')
    if (!paymentMethodId || !amount || !filmId || !userId) {
      console.log('🍎 STEP 3: ❌ Missing required fields')
      console.log('🍎 STEP 3: - paymentMethodId present:', !!paymentMethodId)
      console.log('🍎 STEP 3: - amount present:', !!amount)
      console.log('🍎 STEP 3: - filmId present:', !!filmId)
      console.log('🍎 STEP 3: - userId present:', !!userId)
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    console.log('🍎 STEP 3: ✅ All required fields present')

    console.log('🍎 STEP 4: Checking Stripe configuration...')
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('🍎 STEP 4: ❌ STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 500 }
      )
    }
    console.log('🍎 STEP 4: ✅ Stripe key present')
    console.log('🍎 STEP 4: - Key starts with:', process.env.STRIPE_SECRET_KEY.substring(0, 7) + '...')

    console.log('🍎 STEP 5: Initializing Stripe...')
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    console.log('🍎 STEP 5: ✅ Stripe initialized')
    
    // ✅ SOLUÇÃO: Usar moeda correta
    const finalCurrency = currency?.toLowerCase() || 'usd'
    const finalAmount = amount // Já convertido no frontend
    
    console.log('🍎 STEP 6: Payment parameters:')
    console.log('🍎 STEP 6: - finalCurrency:', finalCurrency)
    console.log('🍎 STEP 6: - finalAmount:', finalAmount)
    console.log('🍎 STEP 6: - amount in cents:', Math.round(finalAmount * 100))
    
    // ✅ SOLUÇÃO: Criar return_url padrão se não fornecida
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://erosunlimited.com'
    const returnUrl = return_url || `${baseUrl}/payment/success?source=apple_pay&filmId=${filmId}&userId=${userId}`
    
    console.log('🍎 STEP 7: URLs configured:')
    console.log('🍎 STEP 7: - baseUrl:', baseUrl)
    console.log('🍎 STEP 7: - returnUrl:', returnUrl)
    
    console.log('🍎 STEP 8: Creating PaymentIntent...')
    console.log('🍎 STEP 8: PaymentIntent parameters:')
    const paymentIntentParams = {
      amount: Math.round(finalAmount * 100),
      currency: finalCurrency,
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: returnUrl,
      metadata: {
        filmId,
        userId,
        paymentMethod: 'apple_pay_stripe',
        source: 'stripe_payment_request',
        originalAmount: originalAmount?.toString() || amount.toString(),
        currency: finalCurrency
      }
    }
    console.log('🍎 STEP 8: PaymentIntent params:', JSON.stringify(paymentIntentParams, null, 2))
    
    // Create and confirm payment intent with correct currency
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)
    
    console.log('🍎 STEP 9: PaymentIntent created successfully')
    console.log('🍎 STEP 9: - ID:', paymentIntent.id)
    console.log('🍎 STEP 9: - Status:', paymentIntent.status)
    console.log('🍎 STEP 9: - Amount:', paymentIntent.amount)
    console.log('🍎 STEP 9: - Currency:', paymentIntent.currency)
    console.log('🍎 STEP 9: - Client Secret:', paymentIntent.client_secret ? 'Present' : 'Missing')
    
    if (paymentIntent.last_payment_error) {
      console.log('🍎 STEP 9: ⚠️ Payment error detected:')
      console.log('🍎 STEP 9: - Error:', JSON.stringify(paymentIntent.last_payment_error, null, 2))
    }

    console.log('🍎 STEP 10: Checking payment status...')
    if (paymentIntent.status === 'succeeded') {
      console.log('🍎 STEP 10: ✅ PAYMENT SUCCEEDED!')
      
      console.log('🍎 STEP 11: Saving to database...')
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          movie_id: filmId, // ✅ Correção: usar movie_id ao invés de film_id
          amount: originalAmount || amount, // ✅ Salvar valor original em USD para compatibilidade
          payment_method: 'apple_pay_stripe',
          payment_id: paymentIntent.id,
          status: 'completed',
          created_at: new Date().toISOString()
        })

      if (purchaseError) {
        console.log('🍎 STEP 11: ❌ Database save error:', JSON.stringify(purchaseError, null, 2))
      } else {
        console.log('🍎 STEP 11: ✅ Database save successful')
      }

      console.log('🍎 STEP 12: Preparing success response...')
      const response = {
        success: true,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status
      }
      console.log('🍎 STEP 12: Success response:', JSON.stringify(response, null, 2))
      console.log('🍎='.repeat(50))
      console.log('🍎 ✅ APPLE PAY COMPLETED SUCCESSFULLY')
      console.log('🍎='.repeat(50))

      return NextResponse.json(response)
    } else if (paymentIntent.status === 'requires_action') {
      console.log('🍎 STEP 10: ⚠️ REQUIRES ACTION (3D Secure)')
      const response = {
        success: false,
        requires_action: true,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status
      }
      console.log('🍎 STEP 10: Requires action response:', JSON.stringify(response, null, 2))
      return NextResponse.json(response)
    } else {
      console.log('🍎 STEP 10: ❌ PAYMENT NOT COMPLETED')
      console.log('🍎 STEP 10: - Status:', paymentIntent.status)
      console.log('🍎 STEP 10: - Full PaymentIntent:', JSON.stringify(paymentIntent, null, 2))
      return NextResponse.json(
        { error: 'Payment not completed', status: paymentIntent.status },
        { status: 402 }
      )
    }

  } catch (error: any) {
    console.log('🍎💥'.repeat(25))
    console.log('🍎 ❌ CRITICAL ERROR OCCURRED!')
    console.log('🍎💥'.repeat(25))
    console.log('🍎 ERROR TYPE:', error.constructor.name)
    console.log('🍎 ERROR MESSAGE:', error.message)
    console.log('🍎 ERROR CODE:', error.code)
    console.log('🍎 ERROR STACK:', error.stack)
    console.log('🍎 ERROR FULL OBJECT:', JSON.stringify(error, null, 2))
    console.log('🍎💥'.repeat(25))
    
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    )
  } finally {
    console.log('🍎='.repeat(50))
    console.log(`🍎 APPLE PAY DEBUG SESSION ENDED - ${new Date().toISOString()}`)
    console.log('🍎='.repeat(50))
  }
}