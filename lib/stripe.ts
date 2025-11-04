// lib/stripe.ts
export interface PaymentData {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardholderName: string
    email: string
    address: string
    city: string
    zipCode: string
    country: string
  }
  
  export interface PaymentIntent {
    amount: number
    filmId: string
    userId: string
    paymentData: PaymentData
  }
  
  // Create payment intent on your backend
  export const createPaymentIntent = async (paymentIntent: PaymentIntent) => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentIntent),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }
  
      return await response.json()
    } catch (error) {
      throw error
    }
  }
  
  // Simulate Stripe payment processing for development
  const simulateStripePayment = async (paymentData: PaymentData): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000))
  
    // Simple validation simulation
    const cardNumber = paymentData.cardNumber.replace(/\s/g, '')
    
    // Test card numbers (these would normally be handled by Stripe)
    const testCards = {
      '4242424242424242': 'success', // Visa success
      '4000000000000002': 'declined', // Visa declined
      '4000000000000069': 'expired', // Expired card
    }
  
    const cardStatus = testCards[cardNumber as keyof typeof testCards]
  
    if (cardStatus === 'declined') {
      throw new Error('Cartão recusado. Tente outro cartão.')
    }
    
    if (cardStatus === 'expired') {
      throw new Error('Cartão expirado.')
    }
  
    // For development, any other card number is considered valid
    return true
  }
  
  // Process complete payment flow
  export const processPayment = async (paymentIntent: PaymentIntent): Promise<boolean> => {
    try {
      // For development, use simulation instead of real Stripe
      if (process.env.NODE_ENV === 'development') {
        return await simulateStripePayment(paymentIntent.paymentData)
      }
  
      // Production flow with real Stripe integration
      // This would be used when you have Stripe properly configured
      /*
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }
  
      // Step 1: Create payment intent on backend
      const { client_secret } = await createPaymentIntent(paymentIntent)
  
      // Step 2: Confirm payment with Stripe
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: {
            number: paymentIntent.paymentData.cardNumber.replace(/\s/g, ''),
            exp_month: parseInt(paymentIntent.paymentData.expiryDate.split('/')[0]),
            exp_year: parseInt('20' + paymentIntent.paymentData.expiryDate.split('/')[1]),
            cvc: paymentIntent.paymentData.cvv,
          },
          billing_details: {
            name: paymentIntent.paymentData.cardholderName,
            email: paymentIntent.paymentData.email,
            address: {
              city: paymentIntent.paymentData.city,
              postal_code: paymentIntent.paymentData.zipCode,
              country: paymentIntent.paymentData.country,
            },
          },
        },
      })
  
      if (error) {
        throw new Error(error.message)
      }
  
      return confirmedPayment?.status === 'succeeded'
      */
  
      // For now, return simulation result
      return await simulateStripePayment(paymentIntent.paymentData)
    } catch (error) {
      throw error
    }
  }
  
  // Utility function to validate card number using Luhn algorithm
  export const validateCardNumber = (cardNumber: string): boolean => {
    const number = cardNumber.replace(/\s/g, '')
    
    if (!/^\d+$/.test(number)) return false
    if (number.length < 13 || number.length > 19) return false
  
    let sum = 0
    let isEven = false
  
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i])
  
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
  
      sum += digit
      isEven = !isEven
    }
  
    return sum % 10 === 0
  }
  
  // Get card brand from card number
  export const getCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '')
    
    if (number.startsWith('4')) return 'Visa'
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard'
    if (number.startsWith('3')) return 'American Express'
    if (number.startsWith('6')) return 'Discover'
    
    return 'Cartão'
  }
  
  // Format card number with spaces
  export const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }
  
  // Format expiry date
  export const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }
  
  // Validate expiry date
  export const validateExpiryDate = (expiryDate: string): boolean => {
    if (!expiryDate || expiryDate.length !== 5) return false
    
    const [month, year] = expiryDate.split('/')
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    
    const expMonth = parseInt(month)
    const expYear = parseInt(year)
    
    if (expMonth < 1 || expMonth > 12) return false
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false
    
    return true
  }