import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface ApplePayPaymentRequest {
  payment: any // Apple Pay payment token
  amount: number
  filmId: string
  userId: string
}

export async function POST(request: NextRequest) {
  console.log('🍎 APPLE PAY API: =================================')
  console.log('🍎 APPLE PAY API: Processamento iniciado')
  console.log('🍎 APPLE PAY API: Timestamp:', new Date().toISOString())
  
  try {
    const body = await request.json()
    console.log('🍎 APPLE PAY API: Estrutura do request recebido:')
    console.log('  - hasPayment:', !!body.payment)
    console.log('  - hasToken:', !!body.payment?.token)
    console.log('  - hasPaymentData:', !!body.payment?.token?.paymentData)
    console.log('  - amount:', body.amount)
    console.log('  - filmId:', body.filmId)
    console.log('  - userId:', body.userId)
    
    if (body.payment?.token?.paymentData) {
      console.log('  - paymentData length:', body.payment.token.paymentData.length)
      console.log('  - paymentData type:', typeof body.payment.token.paymentData)
    }
    
    const { payment, amount, filmId, userId }: ApplePayPaymentRequest = body

    // Validate required fields
    if (!payment || !amount || !filmId || !userId) {
      console.log('🍎 APPLE PAY API: ❌ ERRO - Campos obrigatórios ausentes')
      console.log('  - payment:', !!payment)
      console.log('  - amount:', !!amount)
      console.log('  - filmId:', !!filmId)
      console.log('  - userId:', !!userId)
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!payment.token || !payment.token.paymentData) {
      console.log('🍎 APPLE PAY API: ❌ ERRO - Token do Apple Pay inválido')
      console.log('  - payment.token existe:', !!payment.token)
      console.log('  - payment.token.paymentData existe:', !!payment.token?.paymentData)
      return NextResponse.json(
        { error: 'Invalid Apple Pay token' },
        { status: 400 }
      )
    }

    console.log('🍎 APPLE PAY API: ✅ Validação inicial passou')

    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.STRIPE_ENV === 'test'
    console.log('🍎 APPLE PAY API: Modo de execução:', isDevelopment ? 'DESENVOLVIMENTO' : 'PRODUÇÃO')

    if (isDevelopment) {
      console.log('🍎 APPLE PAY API: 🔧 SIMULANDO PAGAMENTO (DESENVOLVIMENTO)')
      console.log('🍎 APPLE PAY API: Dados do pagamento simulado:')
      console.log('  - amount:', amount)
      console.log('  - filmId:', filmId)
      console.log('  - userId:', userId)
      console.log('  - paymentToken presente:', !!payment.token?.paymentData)

      // Simulate successful payment
      const paymentId = `applepay_dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('🍎 APPLE PAY API: Payment ID gerado:', paymentId)
      
      console.log('🍎 APPLE PAY API: Salvando compra no banco de dados...')
      // Save purchase to database
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          film_id: filmId,
          amount: amount,
          currency: 'USD',
          payment_method: 'apple_pay',
          payment_id: paymentId,
          status: 'completed',
          created_at: new Date().toISOString()
        })

      if (purchaseError) {
        console.log('🍎 APPLE PAY API: ❌ ERRO ao salvar compra:', purchaseError)
        return NextResponse.json(
          { error: 'Failed to save purchase' },
          { status: 500 }
        )
      }

      console.log('🍎 APPLE PAY API: ✅ SUCESSO - Compra salva no banco')
      console.log('🍎 APPLE PAY API: Retornando resposta de sucesso')
      return NextResponse.json({
        success: true,
        paymentId,
        amount,
        currency: 'USD',
        status: 'succeeded'
      })

    } else {
      console.log('🍎 APPLE PAY API: 🏭 PROCESSAMENTO EM PRODUÇÃO COM STRIPE')
      // Production mode - Process real Apple Pay payment with Stripe
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('🍎 APPLE PAY API: ❌ ERRO - Stripe secret key não configurada')
        return NextResponse.json(
          { error: 'Payment processing not configured' },
          { status: 500 }
        )
      }

      try {
        console.log('🍎 APPLE PAY API: Inicializando processamento Stripe...')
        console.log('🍎 APPLE PAY API: Dados do pagamento:')
        console.log('  - amount:', amount, 'USD')
        console.log('  - amount in cents:', Math.round(amount * 100))
        console.log('  - filmId:', filmId)
        console.log('  - userId:', userId)
        console.log('  - token presente:', !!payment.token)
        console.log('  - paymentData length:', payment.token.paymentData ? payment.token.paymentData.length : 0)

        // Create payment intent for Apple Pay
        console.log('🍎 APPLE PAY API: Criando payment intent...')
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'
          },
          metadata: {
            filmId,
            userId,
            paymentMethod: 'apple_pay',
            source: 'apple_pay'
          }
        })
        console.log('🍎 APPLE PAY API: ✅ Payment intent criado:', paymentIntent.id)

        // Confirm payment with Apple Pay token
        console.log('🍎 APPLE PAY API: Confirmando pagamento com token do Apple Pay...')
        const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method_data: {
            type: 'card',
            card: {
              token: payment.token.paymentData
            }
          }
        })
        console.log('🍎 APPLE PAY API: Resultado da confirmação:')
        console.log('  - payment_intent_id:', confirmedPayment.id)
        console.log('  - status:', confirmedPayment.status)
        console.log('  - amount:', confirmedPayment.amount)
        console.log('  - currency:', confirmedPayment.currency)

        if (confirmedPayment.status === 'succeeded') {
          console.log('🍎 APPLE PAY API: ✅ PAGAMENTO APROVADO!')
          console.log('🍎 APPLE PAY API: Salvando compra no banco de dados...')
          
          // Save purchase to database
          const { error: purchaseError } = await supabase
            .from('purchases')
            .insert({
              user_id: userId,
              film_id: filmId,
              amount: amount,
              currency: 'USD',
              payment_method: 'apple_pay',
              payment_id: confirmedPayment.id,
              status: 'completed',
              created_at: new Date().toISOString()
            })

          if (purchaseError) {
            console.log('🍎 APPLE PAY API: ❌ ERRO ao salvar compra no banco:', purchaseError)
          } else {
            console.log('🍎 APPLE PAY API: ✅ Compra salva no banco com sucesso')
          }

          console.log('🍎 APPLE PAY API: Retornando resposta de sucesso para o frontend')
          return NextResponse.json({
            success: true,
            paymentId: confirmedPayment.id,
            amount: confirmedPayment.amount / 100,
            currency: confirmedPayment.currency.toUpperCase(),
            status: confirmedPayment.status
          })
        } else {
          console.log('🍎 APPLE PAY API: ❌ PAGAMENTO NÃO COMPLETADO')
          console.log('🍎 APPLE PAY API: Status recebido:', confirmedPayment.status)
          return NextResponse.json(
            { error: 'Payment not completed', status: confirmedPayment.status },
            { status: 402 }
          )
        }

      } catch (stripeError: any) {
        console.log('🍎 APPLE PAY API: ❌ ERRO NO STRIPE:', stripeError.message)
        console.log('🍎 APPLE PAY API: Tipo do erro:', stripeError.type)
        console.log('🍎 APPLE PAY API: Código do erro:', stripeError.code)
        if (stripeError.payment_intent) {
          console.log('🍎 APPLE PAY API: Payment Intent ID:', stripeError.payment_intent.id)
          console.log('🍎 APPLE PAY API: Payment Intent Status:', stripeError.payment_intent.status)
        }
        return NextResponse.json(
          { error: stripeError.message || 'Apple Pay processing failed' },
          { status: 402 }
        )
      }
    }

  } catch (error: any) {
    console.log('🍎 APPLE PAY API: ❌ ERRO GERAL:', error.message)
    console.log('🍎 APPLE PAY API: Stack trace:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    console.log('🍎 APPLE PAY API: =================================')
  }
}