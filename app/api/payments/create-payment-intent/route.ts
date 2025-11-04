import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Interface para requisição do Payment Intent
interface PaymentIntentRequest {
  amount: number
  originalAmount?: number
  convertedAmount?: number
  currency?: string
  filmId: string
  userId: string
  paymentData: {
    cardholderName: string
    email: string
    cardFunction?: 'credit' | 'debit'
    address?: string
    city?: string
    zipCode?: string
    country?: string
  }
}

export interface PaymentData {
  cardholderName: string
  email: string
  cardFunction?: 'credit' | 'debit'
}

export interface PaymentRequest {
  amount: number
  filmId: string
  userId: string
  paymentData: PaymentData
}

export interface PaymentIntentResponse {
  client_secret: string
  id: string
  amount: number
  status: string
  currency: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentIntentRequest = await request.json()
    
    const { amount, originalAmount, convertedAmount, currency, filmId, userId, paymentData } = body

    // Validações básicas - apenas para campos necessários
    if (!amount || !filmId || !userId || !paymentData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Determinar valores para processamento
    const finalAmount = convertedAmount || amount
    const finalCurrency = currency?.toLowerCase() || 'usd'
    
    console.log('Payment Intent request:', {
      originalAmount,
      convertedAmount,
      finalAmount,
      currency: finalCurrency,
      country: paymentData.country
    })

    // Validar apenas campos obrigatórios (cardNumber, expiryDate, cvv são validados pelo Stripe Elements)
    if (!paymentData.cardholderName || !paymentData.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Criar Payment Intent real no Stripe (sem simulação)
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 500 }
      )
    }

    try {
      // Função para converter para a menor unidade da moeda
      const getAmountInMinorUnit = (amount: number, currency: string) => {
        // Moedas que usam centavos (dividem por 100)
        const centCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud', 'brl']
        // Moedas que não dividem (como JPY, KRW)
        const noDivisionCurrencies = ['jpy', 'krw', 'clp', 'pyg', 'vnd']
        
        if (noDivisionCurrencies.includes(currency.toLowerCase())) {
          return Math.round(amount)
        } else {
          return Math.round(amount * 100)
        }
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: getAmountInMinorUnit(finalAmount, finalCurrency),
        currency: finalCurrency,
        metadata: {
          filmId,
          userId,
          email: paymentData.email,
          cardholderName: paymentData.cardholderName,
          cardFunction: paymentData.cardFunction || 'credit',
          originalAmount: originalAmount?.toString() || amount.toString(),
          convertedAmount: finalAmount.toString(),
          originalCurrency: 'USD',
          country: paymentData.country || 'US'
        },
        payment_method_types: ['card'], // ✅ Aceita apenas cartões
        automatic_payment_methods: {
          enabled: false, // ✅ Desabilita métodos automáticos
        },
      })

      console.log('Payment Intent created:', {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        originalAmount,
        convertedAmount: finalAmount,
        country: paymentData.country,
        filmId,
        userId,
        email: paymentData.email,
        cardFunction: paymentData.cardFunction || 'credit'
      })

      const response: PaymentIntentResponse = {
        client_secret: paymentIntent.client_secret!,
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        currency: paymentIntent.currency.toUpperCase()
      }

      return NextResponse.json(response)

    } catch (stripeError: any) {
      console.error('Stripe Payment Intent creation error:', stripeError)
      return NextResponse.json(
        { 
          error: 'payment_failed',
          errorCode: stripeError.code || 'stripe_error',
          message: stripeError.message || 'Payment processing failed'
        },
        { status: 402 }
      )
    }

  } catch (error: any) {
    console.error('Payment Intent creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}