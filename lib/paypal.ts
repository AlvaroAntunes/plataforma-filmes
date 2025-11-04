import * as paypal from '@paypal/checkout-server-sdk'

// Types
export interface PayPalOrderData {
  filmId: string
  userId: string
  amount: number
  email: string
  title: string
}

export interface PayPalOrder {
  orderId: string
  approvalUrl: string
}

export interface PayPalPayment {
  id: string
  status: string
  amount: number
  filmId: string
  userId: string
  email: string
}

// Configure PayPal environment
const getPayPalEnvironment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  return process.env.NODE_ENV === 'production' 
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

// PayPal client
const getPayPalClient = () => {
  return new paypal.core.PayPalHttpClient(getPayPalEnvironment())
}

// Create PayPal Order - Versão Melhorada
export const createPayPalOrder = async (orderData: PayPalOrderData): Promise<PayPalOrder> => {
  try {
    const client = getPayPalClient()
    const request = new paypal.orders.OrdersCreateRequest()
    
    request.prefer("return=representation")
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: orderData.amount.toFixed(2)
        },
        description: `Filme: ${orderData.title}`,
        // Usar referência mais simples
        reference_id: `film_${orderData.filmId}_user_${orderData.userId}`,
        custom_id: JSON.stringify({
          filmId: orderData.filmId,
          userId: orderData.userId,
          email: orderData.email
        })
      }],
      application_context: {
        brand_name: 'EROS Films',
        landing_page: 'NO_PREFERENCE',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        // URLs mais claras com múltiplos parâmetros
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?filmId=${orderData.filmId}&userId=${orderData.userId}&source=paypal`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel?filmId=${orderData.filmId}&userId=${orderData.userId}`,
        locale: 'en-US'
      }
    })

    const order = await client.execute(request)
    const approvalUrl = order.result.links?.find((link: any) => link.rel === 'approve')?.href

    if (!approvalUrl) {
      throw new Error('PayPal approval URL not found')
    }

    console.log('PayPal order created:', {
      orderId: order.result.id,
      status: order.result.status,
      approvalUrl
    })

    return {
      orderId: order.result.id,
      approvalUrl
    }

  } catch (error: any) {
    console.error('PayPal order creation error:', error)
    throw new Error(`Failed to create PayPal order: ${error.message}`)
  }
}

// Capture PayPal Order - Versão Melhorada
export const capturePayPalOrder = async (orderId: string): Promise<PayPalPayment> => {
  try {
    const client = getPayPalClient()
    
    console.log(`Starting capture process for order: ${orderId}`)

    // PASSO 1: Buscar detalhes da ordem antes de capturar
    const getOrderRequest = new paypal.orders.OrdersGetRequest(orderId)
    let orderDetails
    
    try {
      orderDetails = await client.execute(getOrderRequest)
      console.log('Order details retrieved:', JSON.stringify(orderDetails.result, null, 2))
    } catch (getError: any) {
      console.error('Error getting order details:', getError)
      throw new Error(`Failed to get order details: ${getError.message}`)
    }

    // PASSO 2: Verificar se a ordem já foi capturada
    const orderStatus = orderDetails.result.status
    if (orderStatus === 'COMPLETED') {
      console.log('Order already completed, extracting payment info...')
      return extractPaymentFromCompletedOrder(orderDetails.result)
    }

    if (orderStatus !== 'APPROVED') {
      throw new Error(`Order status is ${orderStatus}, cannot capture. Order must be APPROVED.`)
    }

    // PASSO 3: Capturar o pagamento
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId)
    
    // Tentar diferentes formas de configurar o request body
    try {
      // Alternativa: alguns SDKs usam prefer
      if (typeof captureRequest.prefer === 'function') {
        captureRequest.prefer("return=representation")
      }
    } catch (configError) {
      console.warn('Error configuring capture request:', configError)
      // Continuar mesmo assim - o request básico pode funcionar
    }

    let captureResult
    try {
      captureResult = await client.execute(captureRequest)
      console.log('Capture completed:', JSON.stringify(captureResult.result, null, 2))
    } catch (captureError: any) {
      console.error('Error capturing payment:', captureError)
      throw new Error(`Failed to capture payment: ${captureError.message}`)
    }

    // PASSO 4: Extrair dados do pagamento
    const payment = captureResult.result
    
    return extractPaymentData(payment, orderDetails.result)

  } catch (error: any) {
    console.error('Error in capturePayPalOrder:', error)
    throw new Error(`PayPal capture failed: ${error.message}`)
  }
}

// Função auxiliar para extrair dados de pagamento
function extractPaymentData(payment: any, orderDetails: any): PayPalPayment {
  let filmId = '', userId = '', email = ''

  // Tentar extrair custom data de várias fontes
  const sources = [
    orderDetails?.purchase_units?.[0]?.custom_id,
    payment?.purchase_units?.[0]?.custom_id,
    orderDetails?.purchase_units?.[0]?.reference_id,
    payment?.purchase_units?.[0]?.reference_id
  ]

  for (const source of sources) {
    if (source) {
      try {
        if (source.startsWith('film_')) {
          // Parse reference_id format: film_123_user_456
          const parts = source.split('_')
          if (parts.length >= 4) {
            filmId = parts[1]
            userId = parts[3]
          }
        } else {
          // Parse JSON custom_id
          const customData = JSON.parse(source)
          filmId = customData.filmId || filmId
          userId = customData.userId || userId
          email = customData.email || email
        }
        console.log('Extracted custom data:', { filmId, userId, email })
        if (filmId && userId) break // Se temos os dados principais, parar
      } catch (parseError) {
        console.warn('Error parsing custom data from:', source, parseError)
      }
    }
  }

  // Extrair o valor do pagamento
  const amount = payment.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || 
                 payment.purchase_units?.[0]?.amount?.value || 
                 orderDetails.purchase_units?.[0]?.amount?.value ||
                 0

  return {
    id: payment.id,
    status: payment.status,
    amount: parseFloat(amount),
    filmId,
    userId,
    email
  }
}

// Função auxiliar para ordens já completadas
function extractPaymentFromCompletedOrder(order: any): PayPalPayment {
  const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
  if (!capture) {
    throw new Error('No capture found in completed order')
  }

  return extractPaymentData({ 
    id: order.id, 
    status: 'COMPLETED',
    purchase_units: order.purchase_units 
  }, order)
}

// Verify PayPal payment (for webhooks)
export const verifyPayPalPayment = async (orderId: string): Promise<boolean> => {
  try {
    const client = getPayPalClient()
    const request = new paypal.orders.OrdersGetRequest(orderId)
    
    const order = await client.execute(request)
    return order.result.status === 'COMPLETED'

  } catch (error) {
    console.error('Error verifying PayPal payment:', error)
    return false
  }
}

// PayPal Standard (simpler integration) - URL builder
export const createPayPalStandardUrl = (orderData: PayPalOrderData): string => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://www.paypal.com/cgi-bin/webscr'
    : 'https://www.sandbox.paypal.com/cgi-bin/webscr'
  
  const businessEmail = process.env.PAYPAL_BUSINESS_EMAIL

  if (!businessEmail) {
    throw new Error('PayPal business email not configured')
  }

  const params = new URLSearchParams({
    cmd: '_xclick',
    business: businessEmail,
    item_name: orderData.title,
    item_number: orderData.filmId,
    amount: orderData.amount.toFixed(2),
    currency_code: 'USD',
    return: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?filmId=${orderData.filmId}&userId=${orderData.userId}&source=standard`,
    cancel_return: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel?filmId=${orderData.filmId}&userId=${orderData.userId}`,
    notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paypal/ipn`,
    custom: JSON.stringify({
      filmId: orderData.filmId,
      userId: orderData.userId,
      email: orderData.email
    }),
    no_shipping: '1',
    no_note: '1'
  })

  return `${baseUrl}?${params.toString()}`
}

// PayPal configuration check
export const checkPayPalConfig = (): boolean => {
  try {
    getPayPalEnvironment()
    return true
  } catch {
    return false
  }
}

// Função para debug - listar todas as transações recentes
export const getRecentPayPalTransactions = async (startDate?: string) => {
  try {
    const client = getPayPalClient()
    
    // Esta é uma funcionalidade mais avançada que requer permissões especiais
    console.log('PayPal client configured successfully')
    return { success: true, message: 'PayPal connection OK' }
    
  } catch (error: any) {
    console.error('PayPal configuration error:', error)
    return { success: false, error: error.message }
  }
}