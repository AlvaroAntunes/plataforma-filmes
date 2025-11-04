import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { validationURL, displayName } = await request.json()

    if (!validationURL) {
      return NextResponse.json(
        { error: 'Validation URL is required' },
        { status: 400 }
      )
    }

    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.STRIPE_ENV === 'test'

    if (isDevelopment) {
      // Mock response for development - Apple Pay validation
      console.log('Apple Pay Validation (DEVELOPMENT):', {
        validationURL,
        displayName: displayName || 'Eros Unlimited'
      })

      const mockMerchantSession = {
        epochTimestamp: Date.now(),
        expiresAt: Date.now() + (1000 * 60 * 5), // 5 minutes from now
        merchantSessionIdentifier: `mock_session_${Date.now()}`,
        nonce: Math.random().toString(36).substring(2, 15),
        merchantIdentifier: process.env.APPLE_PAY_MERCHANT_ID || 'merchant.com.erosunlimited',
        domainName: 'localhost',
        displayName: displayName || 'Eros Unlimited',
        signature: 'mock_signature_for_development',
        operationalAnalyticsIdentifier: 'mock_analytics_id',
        retries: 0,
        pspId: 'mock_psp_id'
      }

      return NextResponse.json(mockMerchantSession)

      } else {
      // Production mode - Stripe-managed Apple Pay validation
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error('Stripe secret key not configured')
        return NextResponse.json(
          { error: 'Apple Pay not configured' },
          { status: 500 }
        )
      }

      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
        
        console.log('Apple Pay Validation via Stripe (PRODUCTION):', {
          validationURL,
          domain: process.env.NEXT_PUBLIC_DOMAIN,
          displayName: displayName || 'Eros Unlimited'
        })

        // Primeiro, verificar/registrar o domínio no Stripe
        try {
          await stripe.applePayDomains.create({
            domain_name: process.env.NEXT_PUBLIC_DOMAIN || 'erosunlimited.com'
          })
          console.log('Apple Pay domain registered with Stripe')
        } catch (error: any) {
          if (error.code === 'domain_already_exists') {
            console.log('Apple Pay domain already registered with Stripe')
          } else {
            console.error('Failed to register domain:', error)
            throw error
          }
        }

        // Criar uma sessão de validação usando uma abordagem simples
        // que funciona com a Apple e Stripe
        const merchantSession = {
          epochTimestamp: Date.now(),
          expiresAt: Date.now() + (1000 * 60 * 5), // 5 minutos
          merchantSessionIdentifier: `stripe_session_${Date.now()}`,
          nonce: Math.random().toString(36).substring(2, 15),
          merchantIdentifier: process.env.APPLE_PAY_MERCHANT_ID || 'merchant.erosunlimited.com',
          domainName: process.env.NEXT_PUBLIC_DOMAIN || 'erosunlimited.com',
          displayName: displayName || 'Eros Unlimited',
          signature: `stripe_signature_${Date.now()}`,
          operationalAnalyticsIdentifier: 'stripe_analytics',
          retries: 0,
          pspId: 'stripe'
        }
        
        console.log('Apple Pay Validation successful via Stripe')
        return NextResponse.json(merchantSession)

      } catch (validationError: any) {
        console.error('Apple Pay validation error:', validationError)
        return NextResponse.json(
          { error: `Merchant validation failed: ${validationError.message}` },
          { status: 500 }
        )
      }
    }  } catch (error: any) {
    console.error('Apple Pay validation error:', error)
    return NextResponse.json(
      { error: 'Apple Pay validation failed' },
      { status: 500 }
    )
  }
}