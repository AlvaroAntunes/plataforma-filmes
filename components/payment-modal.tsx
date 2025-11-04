"use client"

import { useState, useEffect } from "react"
import { X, CreditCard, Lock, AlertCircle, Heart, Sparkles, Crown, Star, Shield, Wallet, Smartphone } from "lucide-react"
import type { Film } from "@/lib/types"
import Image from "next/image"
import { usePaymentTranslation, useMoviesTranslation, useCommonTranslation, useTranslation } from "@/hooks/useTranslation"
import ApplePayButton from "./apple-pay-button"

interface PaymentModalProps {
  film: Film | null
  isOpen: boolean
  userId: string
  onClose: () => void
  onPaymentSuccess: (filmId: string) => void
}

interface PaymentForm {
  cardholderName: string
  email: string
  country: string
  paymentError?: string
}

type PaymentMethod = 'card' | 'paypal' | 'apple-pay'

export default function PaymentModal({ film, isOpen, userId, onClose, onPaymentSuccess }: PaymentModalProps) {
  const payment = usePaymentTranslation()
  const movies = useMoviesTranslation()
  const common = useCommonTranslation()
  const { t, locale } = useTranslation()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal')
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false)
  const [isStripeApplePayReady, setIsStripeApplePayReady] = useState(false)
  const [formData, setFormData] = useState<PaymentForm>({
    cardholderName: '',
    email: '',
    country: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Partial<PaymentForm>>({})
  
  // Countries state
  const [countries, setCountries] = useState<any[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  
  // Currency conversion state
  const [convertedPrice, setConvertedPrice] = useState<number>(film?.price || 0)
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD')
  const [currencySymbol, setCurrencySymbol] = useState<string>('$')
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({})
  const [isLoadingRates, setIsLoadingRates] = useState(false)
  
  // Stripe Elements state
  const [stripe, setStripe] = useState<any>(null)
  const [cardNumberElement, setCardNumberElement] = useState<any>(null)
  const [cardExpiryElement, setCardExpiryElement] = useState<any>(null)
  const [cardCvcElement, setCardCvcElement] = useState<any>(null)
  const [paymentRequest, setPaymentRequest] = useState<any>(null)

  // Reset form data when payment method changes
  useEffect(() => {
    setFormData({
      cardholderName: '',
      email: '',
      country: ''
    })
    setErrors({})
    
    // Clear Stripe elements when switching away from card method
    if (paymentMethod !== 'card') {
      if (cardNumberElement) {
        try {
          cardNumberElement.clear()
        } catch (e) {
          // Element might not support clear or might be unmounted
          console.log('Could not clear card number element:', e)
        }
      }
      if (cardExpiryElement) {
        try {
          cardExpiryElement.clear()
        } catch (e) {
          // Element might not support clear or might be unmounted
          console.log('Could not clear card expiry element:', e)
        }
      }
      if (cardCvcElement) {
        try {
          cardCvcElement.clear()
        } catch (e) {
          // Element might not support clear or might be unmounted
          console.log('Could not clear card CVC element:', e)
        }
      }
    }
  }, [paymentMethod, cardNumberElement, cardExpiryElement, cardCvcElement])

  // Check for Apple Pay availability
  useEffect(() => {
    const checkPaymentAvailability = async () => {
      // Check Apple Pay availability
      if (typeof window !== 'undefined' && window.ApplePaySession) {
        try {
          // Check if Apple Pay is available and user has cards
          const canMakePayments = ApplePaySession.canMakePayments()
          
          if (canMakePayments) {
            console.log('✅ Apple Pay is available')
            setIsApplePayAvailable(true)
          } else {
            console.log('❌ Apple Pay not available - canMakePayments returned false')
            setIsApplePayAvailable(false)
          }
        } catch (error) {
          console.log('❌ Apple Pay not available:', error)
          setIsApplePayAvailable(false)
        }
      } else {
        console.log('❌ Apple Pay not available - ApplePaySession not found')
        setIsApplePayAvailable(false)
      }
    }

    // Check availability
    checkPaymentAvailability()
  }, [])

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true)
      try {
        const response = await fetch('/api/countries')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.countries) {
            // Ordenar países em ordem alfabética pelo nome
            const sortedCountries = data.countries.sort((a: any, b: any) => 
              a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
            )
            setCountries(sortedCountries)
            console.log(`✅ ${sortedCountries.length} países carregados e ordenados alfabeticamente`)
          } else {
            console.warn('❌ Falha ao carregar países da API')
          }
        }
      } catch (error) {
        console.error('❌ Erro ao buscar países:', error)
        // Fallback com países principais (em ordem alfabética)
        const fallbackCountries = [
          { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$', flag: '��' },
          { code: 'BR', name: 'Brasil', currency: 'BRL', currencySymbol: 'R$', flag: '��' },
          { code: 'CA', name: 'Canada', flag: '🇨🇦' },
          { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
          { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', flag: '🇺🇸' }
        ]
        setCountries(fallbackCountries)
      } finally {
        setIsLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])

  // Fetch exchange rates from Frankfurter API with cache
  const fetchExchangeRates = async (targetCurrency: string) => {
    if (targetCurrency === 'USD') {
      setConvertedPrice(film?.price || 0)
      setSelectedCurrency('USD')
      setCurrencySymbol('$')
      return
    }

    // Check cache first (24 hour cache)
    const cacheKey = `exchange_rates_${targetCurrency}_${new Date().toDateString()}`
    const cachedRate = localStorage.getItem(cacheKey)
    
    if (cachedRate) {
      const rate = parseFloat(cachedRate)
      const converted = (film?.price || 0) * rate
      setConvertedPrice(converted)
      setExchangeRates(prev => ({ ...prev, [targetCurrency]: rate }))
      console.log(`✅ Taxa de câmbio do cache: 1 USD = ${rate} ${targetCurrency}`)
      return
    }

    setIsLoadingRates(true)
    try {
      const response = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${targetCurrency}`)
      if (response.ok) {
        const data = await response.json()
        const rate = data.rates[targetCurrency]
        
        if (rate) {
          // Save to cache
          localStorage.setItem(cacheKey, rate.toString())
          
          const converted = (film?.price || 0) * rate
          setConvertedPrice(converted)
          setExchangeRates(prev => ({ ...prev, [targetCurrency]: rate }))
          console.log(`✅ Taxa de câmbio obtida: 1 USD = ${rate} ${targetCurrency}`)
        }
      } else {
        console.warn(`❌ Erro ao buscar taxa de câmbio para ${targetCurrency}`)
        // Fallback to USD
        setConvertedPrice(film?.price || 0)
        setSelectedCurrency('USD')
        setCurrencySymbol('$')
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar taxa de câmbio:`, error)
      // Fallback to USD
      setConvertedPrice(film?.price || 0)
      setSelectedCurrency('USD')
      setCurrencySymbol('$')
    } finally {
      setIsLoadingRates(false)
    }
  }

  // Update currency when country changes or payment method changes
  useEffect(() => {
    // Always use USD for PayPal
    if (paymentMethod === 'paypal') {
      setSelectedCurrency('USD')
      setCurrencySymbol('$')
      setConvertedPrice(film?.price || 0)
      return
    }

    const selectedCountry = countries.find(country => country.code === formData.country)
    if (selectedCountry && selectedCountry.currency) {
      const currency = selectedCountry.currency
      const symbol = selectedCountry.currencySymbol || currency
      
      setSelectedCurrency(currency)
      setCurrencySymbol(symbol)
      
      if (currency !== 'USD') {
        fetchExchangeRates(currency)
      } else {
        setConvertedPrice(film?.price || 0)
      }
    } else {
      // Default to USD when no country is selected or country has no currency
      setSelectedCurrency('USD')
      setCurrencySymbol('$')
      setConvertedPrice(film?.price || 0)
    }
  }, [formData.country, countries, film?.price, paymentMethod])

  // Initialize Stripe Elements
  useEffect(() => {
    const initializeStripe = async () => {
      if (typeof window !== 'undefined') {
        // Load Stripe script if not loaded
        if (!window.Stripe) {
          const script = document.createElement('script')
          script.src = 'https://js.stripe.com/v3/'
          script.async = true
          document.head.appendChild(script)
          
          await new Promise((resolve) => {
            script.onload = resolve
          })
        }
        
        if (window.Stripe) {
          // Always create a new Stripe instance if not exists
          let stripeInstance = stripe
          if (!stripeInstance) {
            stripeInstance = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
            setStripe(stripeInstance)
          }
          
          // Criar PaymentRequest para Apple Pay antecipadamente
          if (paymentMethod === 'apple-pay' && film) {
            const paymentReq = stripeInstance.paymentRequest({
              country: 'US',
              currency: 'usd',
              total: {
                label: film.title,
                amount: Math.round(convertedPrice * 100)
              },
              requestPayerName: true,
              requestPayerEmail: true,
            })
            
            // Verificar disponibilidade e configurar eventos
            paymentReq.canMakePayment().then((result: any) => {
              console.log('Stripe Apple Pay availability:', result)
              if (result) {
                setPaymentRequest(paymentReq)
                setIsStripeApplePayReady(true)
                
                // Configurar evento de pagamento autorizado
                paymentReq.on('paymentmethod', async (ev: any) => {
                  try {
                    const response = await fetch('/api/payments/process-apple-pay-stripe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        paymentMethodId: ev.paymentMethod.id,
                        amount: film.price,
                        filmId: film.id,
                        userId: userId
                      })
                    })

                    const result = await response.json()

                    if (response.ok && result.success) {
                      ev.complete('success')
                      const successUrl = `/payment/success?source=apple_pay&payment_intent=${result.paymentId}&filmId=${film.id}&userId=${userId}`
                      window.location.href = successUrl
                      onPaymentSuccess(film.id)
                    } else {
                      ev.complete('fail')
                      setErrors({
                        paymentError: result.error || 'Erro no pagamento Apple Pay'
                      })
                      setIsProcessing(false)
                    }
                  } catch (error: any) {
                    console.error('Apple Pay payment error:', error)
                    ev.complete('fail')
                    setErrors({
                      paymentError: 'Erro no processamento do pagamento'
                    })
                    setIsProcessing(false)
                  }
                })
              } else {
                setIsStripeApplePayReady(false)
              }
            }).catch((error: any) => {
              console.log('Error checking Stripe Apple Pay availability:', error)
              setIsStripeApplePayReady(false)
            })
          }
          
          // Always create new Elements when card method is selected
          const elements = stripeInstance.elements()
          
          // Estilo comum para todos os elementos
          const elementStyle = {
            base: {
              fontSize: '16px',
              color: '#ffffff',
              backgroundColor: 'transparent',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
          }
          
          // Destroy existing elements if they exist
          if (cardNumberElement) {
            cardNumberElement.unmount()
          }
          if (cardExpiryElement) {
            cardExpiryElement.unmount()
          }
          if (cardCvcElement) {
            cardCvcElement.unmount()
          }
          
          // Criar novos elementos
          const cardNumberEl = elements.create('cardNumber', {
            style: elementStyle,
            disableLink: true,
          })
          
          const cardExpiryEl = elements.create('cardExpiry', {
            style: elementStyle,
            disableLink: true,
          })
          
          const cardCvcEl = elements.create('cardCvc', {
            style: elementStyle,
            disableLink: true,
          })
          
          setCardNumberElement(cardNumberEl)
          setCardExpiryElement(cardExpiryEl)
          setCardCvcElement(cardCvcEl)
          
          // Mount elementos nos seus containers
          setTimeout(() => {
            const cardNumberMount = document.getElementById('card-number-element')
            const cardExpiryMount = document.getElementById('card-expiry-element')
            const cardCvcMount = document.getElementById('card-cvc-element')
            
            if (cardNumberMount) {
              cardNumberEl.mount('#card-number-element')
              console.log('✅ Card Number Element mounted')
            }
            if (cardExpiryMount) {
              cardExpiryEl.mount('#card-expiry-element')
              console.log('✅ Card Expiry Element mounted')
            }
            if (cardCvcMount) {
              cardCvcEl.mount('#card-cvc-element')
              console.log('✅ Card CVC Element mounted')
            }
          }, 200)
        }
      }
    }
    
    if (isOpen && (paymentMethod === 'card' || paymentMethod === 'apple-pay')) {
      initializeStripe()
    }
  }, [isOpen, paymentMethod]) // Removed stripe from dependencies

  // Clean up Stripe Elements when switching away from card method
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts or payment method changes
      if (paymentMethod !== 'card') {
        if (cardNumberElement) {
          try {
            cardNumberElement.unmount()
          } catch (e) {
            // Element might already be unmounted
          }
        }
        if (cardExpiryElement) {
          try {
            cardExpiryElement.unmount()
          } catch (e) {
            // Element might already be unmounted
          }
        }
        if (cardCvcElement) {
          try {
            cardCvcElement.unmount()
          } catch (e) {
            // Element might already be unmounted
          }
        }
      }
    }
  }, [paymentMethod])

  if (!isOpen || !film) return null



  const translateErrorCode = (errorCode: string): string => {
    switch (errorCode) {
      case 'card_declined':
        return t('payment.cardDeclined')
      case 'card_expired':
        return t('payment.cardExpiredError')
      case 'insufficient_funds':
        return t('payment.cardInformationinsufficientFunds')
      case 'incorrect_cvc':
        return t('payment.incorrectCvc')
      default:
        return t('payment.paymentError')
    }
  }

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }



  const getLocalizedTitle = (film: Film, locale: string) => {
    if (locale === "pt-BR") return film.title_pt || film.title
    if (locale === "es") return film.title_es || film.title
    if (locale === "zh") return film.title_zh || film.title
    return film.title
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentForm> = {}

    if (paymentMethod === 'paypal') {
      // For PayPal, we only need email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!formData.email || !emailRegex.test(formData.email)) {
        newErrors.email = t('payment.invalidEmailPaypal')
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    // Card validation - Stripe Elements handles card data validation
    // Only validate the fields we collect manually
    
    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = t('payment.requiredCardholderName')
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = t('payment.invalidEmail')
    }

    // Country validation (required for card and Apple Pay payments)
    if ((paymentMethod === 'card' || paymentMethod === 'apple-pay') && !formData.country) {
      newErrors.country = t('payment.requiredCountry')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (paymentMethod === 'paypal') {
      if (!validateForm()) {
        return
      }
      handlePayPalPayment()
      return
    }

    if (paymentMethod === 'apple-pay') {
      handleApplePayPayment()
      return
    }
    
    if (!validateForm()) {
      return
    }

    setIsProcessing(true)
    setErrors({})

    try {
      console.log('Starting Stripe payment process...')
      
      // Step 1: Create Payment Intent
      const paymentIntentResponse = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: film.price, // Manter em USD para backend processar
          originalAmount: film.price,
          convertedAmount: convertedPrice,
          currency: selectedCurrency,
          filmId: film.id,
          userId: userId,
          paymentData: {
            ...formData,
            cardFunction: 'credit'
          }
        }),
      })

      if (!paymentIntentResponse.ok) {
        const errorData = await paymentIntentResponse.json()
        
        // Se for um erro crítico (cartão recusado, expirado, etc), redirecionar para tela de erro
        if (errorData.errorCode && ['card_declined', 'card_expired', 'insufficient_funds', 'incorrect_cvc'].includes(errorData.errorCode)) {
          const errorMessage = translateErrorCode(errorData.errorCode)
          const errorUrl = `/payment/error?source=stripe&error=${encodeURIComponent(errorMessage)}&filmId=${film.id}&userId=${userId}`
          window.location.href = errorUrl
          return
        }
        
        const errorMessage = errorData.errorCode ? translateErrorCode(errorData.errorCode) : (errorData.error || t('paymentError'))
        throw new Error(errorMessage)
      }

      const paymentIntent = await paymentIntentResponse.json()
      console.log('Payment Intent created:', paymentIntent.id)

      // Step 2: Create Payment Method usando Stripe Elements
      let confirmedPayment: any
      if (stripe && cardNumberElement) {
        // Criar Payment Method usando Stripe Elements (mais seguro)
        const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardNumberElement,
          billing_details: {
            name: formData.cardholderName,
            email: formData.email
          }
        })

        if (paymentMethodError) {
          console.error('Payment Method creation error:', paymentMethodError)
          throw new Error(paymentMethodError.message || 'Erro ao criar método de pagamento')
        }

        console.log('Payment Method created:', paymentMethod.id)

        // Step 3: Confirm Payment usando o Payment Method ID
        const confirmResponse = await fetch('/api/payments/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntent.id,
            payment_method_id: paymentMethod.id,  // ✅ Usar apenas ID seguro
            amount: film.price,
            originalAmount: film.price,
            convertedAmount: convertedPrice,
            currency: selectedCurrency,
            filmId: film.id,
            userId: userId
          }),
        })

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json()
          
          // Se for um erro crítico (cartão recusado, expirado, etc), redirecionar para tela de erro
          if (errorData.errorCode && ['card_declined', 'card_expired', 'insufficient_funds', 'incorrect_cvc'].includes(errorData.errorCode)) {
            const errorMessage = translateErrorCode(errorData.errorCode)
            const errorUrl = `/payment/error?source=stripe&error=${encodeURIComponent(errorMessage)}&filmId=${film.id}&userId=${userId}`
            window.location.href = errorUrl
            return
          }
          
          const errorMessage = errorData.errorCode ? translateErrorCode(errorData.errorCode) : (errorData.error || t('paymentError'))
          throw new Error(errorMessage)
        }

        confirmedPayment = await confirmResponse.json()
        console.log('Payment confirmed:', confirmedPayment.status)

        if (confirmedPayment.status === 'succeeded') {
          console.log('Payment successful!')
          
          // Redirecionar para tela de sucesso
          const successUrl = `/payment/success?source=stripe&payment_intent=${confirmedPayment.id}&filmId=${film.id}&userId=${userId}`
          window.location.href = successUrl
          
          // Também chamar onPaymentSuccess para atualizar estado local se necessário
          onPaymentSuccess(film.id)
          // onClose()
        } else if (confirmedPayment.status === 'requires_action') {
          setErrors({ 
            paymentError: t('payment.requiresAction') || 'Your payment requires additional authentication. Please contact your bank.'
          })
        } else {
          setErrors({ 
            paymentError: t('payment.paymentNotApproved') || 'Payment was not approved. Please try again.'
          })
        }

      } else {
        throw new Error('Stripe não está carregado. Tente recarregar a página.')
      }

    } catch (error: any) {
      console.error('Stripe payment error:', error)
      
      // Redirecionar para tela de erro para erros críticos
      if (error.message.includes('declined') || error.message.includes('expired') || error.message.includes('insufficient')) {
        const errorUrl = `/payment/error?source=stripe&error=${encodeURIComponent(error.message)}&filmId=${film.id}&userId=${userId}`
        window.location.href = errorUrl
        return
      }
      
      // Para outros erros, mostrar no modal
      setErrors({ 
        paymentError: error.message || t('payment.paymentError') + '. ' + t('common.tryAgain')
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayPalPayment = async () => {
    setIsProcessing(true)

    // Adiciona listener para resetar estado ao voltar do PayPal
    window.addEventListener('pageshow', handlePageShow)

    try {
      const response = await fetch('/api/payments/create-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: film.price,
          filmId: film.id,
          userId: userId,
          email: formData.email,
          title: film.title
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      const { approvalUrl } = data
      
      if (!approvalUrl) {
        throw new Error('URL de aprovação PayPal não encontrada')
      }
      
      window.location.href = approvalUrl

    } catch (error: any) {
      setErrors({ 
        email: error.message || `${t('payment.paymentError')}. ${t('common.tryAgain')}.`
      })
      setIsProcessing(false)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }

  const handleApplePayPayment = () => {
    console.log('🍎📱'.repeat(25))
    console.log('🍎 FRONTEND: Apple Pay button clicked')
    console.log('🍎📱'.repeat(25))
    
    if (!stripe || !film) {
      console.log('🍎 FRONTEND: ❌ Missing stripe or film')
      console.log('🍎 FRONTEND: - stripe:', !!stripe)
      console.log('🍎 FRONTEND: - film:', !!film)
      setErrors({ 
        paymentError: 'Apple Pay não está pronto. Tente novamente.'
      })
      return
    }

    // ✅ Verificar se país foi selecionado
    if (!formData.country) {
      console.log('🍎 FRONTEND: ❌ No country selected')
      console.log('🍎 FRONTEND: - formData.country:', formData.country)
      setErrors({ 
        country: t('payment.requiredCountry'),
        paymentError: 'Por favor, selecione seu país antes de usar o Apple Pay.'
      })
      return
    }

    console.log('🍎 FRONTEND: ✅ Initial validation passed')
    console.log('🍎 FRONTEND: Starting payment process...')
    console.log('🍎 FRONTEND: - film:', film.title, 'ID:', film.id)
    console.log('🍎 FRONTEND: - user:', userId)
    console.log('🍎 FRONTEND: - country:', formData.country)
    console.log('🍎 FRONTEND: - currency:', selectedCurrency)
    console.log('🍎 FRONTEND: - converted price:', convertedPrice)

    setIsProcessing(true)
    
    // ✅ SOLUÇÃO: Usar a mesma moeda/país detectado que os cartões
    const paymentCurrency = selectedCurrency.toLowerCase()
    const paymentCountry = selectedCurrency === 'BRL' ? 'BR' : 
                          selectedCurrency === 'EUR' ? 'FR' : 
                          selectedCurrency === 'GBP' ? 'GB' : 'US'
    
    console.log('🍎 FRONTEND: Payment configuration:')
    console.log('🍎 FRONTEND: - currency:', paymentCurrency)
    console.log('🍎 FRONTEND: - country:', paymentCountry)
    console.log('🍎 FRONTEND: - amount:', convertedPrice)
    console.log('🍎 FRONTEND: - original amount:', film.price)

    // Criar um novo PaymentRequest com a moeda correta
    const paymentRequest = stripe.paymentRequest({
      country: paymentCountry, // ✅ País baseado na moeda
      currency: paymentCurrency, // ✅ Moeda selecionada (BRL/USD/etc)
      total: {
        label: film.title,
        amount: Math.round(convertedPrice * 100) // ✅ Valor convertido
      },
      requestPayerName: true,
      requestPayerEmail: true,
    })
    
    console.log('🍎 FRONTEND: PaymentRequest created with:')
    console.log('🍎 FRONTEND: - country:', paymentCountry)
    console.log('🍎 FRONTEND: - currency:', paymentCurrency)
    console.log('🍎 FRONTEND: - amount (cents):', Math.round(convertedPrice * 100))

    // Configurar evento de pagamento autorizado
    paymentRequest.on('paymentmethod', async (ev: any) => {
      console.log('🍎 FRONTEND: Payment method received from Apple Pay')
      console.log('🍎 FRONTEND: - Payment method ID:', ev.paymentMethod.id)
      console.log('🍎 FRONTEND: - Payment method type:', ev.paymentMethod.type)
      
      try {
        console.log('🍎 FRONTEND: Sending payment to backend...')
        const backendPayload = {
          paymentMethodId: ev.paymentMethod.id,
          amount: convertedPrice, // ✅ Usar valor convertido
          originalAmount: film.price, // ✅ Valor original em USD
          currency: selectedCurrency, // ✅ Moeda selecionada
          filmId: film.id,
          userId: userId
        }
        console.log('🍎 FRONTEND: Backend payload:', JSON.stringify(backendPayload, null, 2))
        
        const response = await fetch('/api/payments/process-apple-pay-stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendPayload)
        })

        console.log('🍎 FRONTEND: Backend response received')
        console.log('🍎 FRONTEND: - Status:', response.status)
        console.log('🍎 FRONTEND: - Status text:', response.statusText)
        console.log('🍎 FRONTEND: - OK:', response.ok)

        const result = await response.json()
        console.log('🍎 FRONTEND: Backend result:', JSON.stringify(result, null, 2))

        // Log detalhado da verificação de condições
        console.log('🍎 FRONTEND: 🔍 Verificando condições de sucesso...')
        console.log('🍎 FRONTEND: - response.ok:', response.ok, '(tipo:', typeof response.ok, ')')
        console.log('🍎 FRONTEND: - result.success:', result.success, '(tipo:', typeof result.success, ')')
        console.log('🍎 FRONTEND: - Condição completa (response.ok && result.success):', (response.ok && result.success))

        if (response.ok && result.success) {
          console.log('🍎 FRONTEND: ✅ Entrando no bloco de SUCESSO!')
          console.log('🍎 FRONTEND: ✅ Chamando ev.complete("success")')
          ev.complete('success')
          
          const successUrl = `/payment/success?source=apple_pay&payment_intent=${result.paymentId}&filmId=${film.id}&userId=${userId}`
          console.log('🍎 FRONTEND: ✅ URL de sucesso gerada:', successUrl)
          console.log('🍎 FRONTEND: ✅ Redirecionando para página de sucesso...')
          
          window.location.href = successUrl
          onPaymentSuccess(film.id)
          console.log('🍎 FRONTEND: ✅ Redirecionamento executado com sucesso!')
        } else {
          console.log('🍎 FRONTEND: ❌ Entrando no bloco de ERRO!')
          console.log('🍎 FRONTEND: ❌ Condições não atendidas para sucesso')
          console.log('🍎 FRONTEND: - Response OK:', response.ok)
          console.log('🍎 FRONTEND: - Result success:', result.success)
          console.log('🍎 FRONTEND: - Error:', result.error)
          console.log('🍎 FRONTEND: ❌ Chamando ev.complete("fail")')
          ev.complete('fail')
          
          console.log('🍎 FRONTEND: ❌ Definindo erro na interface...')
          setErrors({
            paymentError: result.error || 'Erro no pagamento Apple Pay'
          })
          setIsProcessing(false)
          console.log('🍎 FRONTEND: ❌ Estado de erro definido')
        }
      } catch (error: any) {
        console.log('🍎 FRONTEND: ❌ EXCEÇÃO CAPTURADA - Indo para catch block')
        console.log('🍎 FRONTEND: - Error type:', error.constructor.name)
        console.log('🍎 FRONTEND: - Error message:', error.message)
        console.log('🍎 FRONTEND: - Error stack:', error.stack)
        console.log('🍎 FRONTEND: - Full error:', error)
        console.log('🍎 FRONTEND: ❌ Chamando ev.complete("fail") do catch')
        ev.complete('fail')
        
        console.log('🍎 FRONTEND: ❌ Definindo erro de exceção na interface...')
        setErrors({
          paymentError: 'Erro no processamento do pagamento'
        })
        setIsProcessing(false)
        console.log('🍎 FRONTEND: ❌ Estado de erro de exceção definido')
      }
    })

    // Verificar disponibilidade e mostrar
    console.log('🍎 FRONTEND: Checking Apple Pay availability...')
    paymentRequest.canMakePayment().then((result: any) => {
      console.log('🍎 FRONTEND: Can make payment result:', result)
      if (result) {
        console.log('🍎 FRONTEND: ✅ Apple Pay available, showing payment sheet...')
        paymentRequest.show().catch((error: any) => {
          console.log('🍎 FRONTEND: ❌ Error showing payment sheet:', error)
          setIsProcessing(false)
          setErrors({ 
            paymentError: 'Erro ao abrir Apple Pay: ' + error.message
          })
        })
      } else {
        console.log('🍎 FRONTEND: ❌ Apple Pay not available')
        setIsProcessing(false)
        setErrors({ 
          paymentError: 'Apple Pay não está disponível neste dispositivo.'
        })
      }
    }).catch((error: any) => {
      console.log('🍎 FRONTEND: ❌ Error checking Apple Pay availability:', error)
      setIsProcessing(false)
      setErrors({ 
        paymentError: 'Erro ao verificar Apple Pay: ' + error.message
      })
    })
  }

  // Handler para resetar estado ao voltar do PayPal
  const handlePageShow = (event: PageTransitionEvent) => {
    // Só reseta se for navigation type 'back_forward' (voltar do PayPal)
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
      setIsProcessing(false)
      setErrors({})
      window.removeEventListener('pageshow', handlePageShow)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl rounded-2xl w-full max-w-md sm:max-w-5xl max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl relative">
        {/* Mobile close button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="lg:hidden absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/90 transition-all duration-300 transform hover:scale-110 border border-white/20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {i % 4 === 0 ? (
                <Heart className="w-3 h-3 text-pink-400/30" />
              ) : i % 4 === 1 ? (
                <Star className="w-2 h-2 text-yellow-400/30" />
              ) : i % 4 === 2 ? (
                <Sparkles className="w-3 h-3 text-cyan-400/30" />
              ) : (
                <div className="w-1 h-1 rounded-full bg-purple-400/30" />
              )}
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row">
          {/* Left side - Film info */}
          <div className="lg:w-1/3 p-4 sm:p-6 border-r border-white/20">
            <div className="relative aspect-[2/3] mb-6 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={film.posterUrl || "/placeholder.svg"}
                alt={getLocalizedTitle(film, locale)}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Pride badge */}
              <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                <Crown className="w-3 h-3" />
                <span>{movies.premium}</span>
              </div>
            </div>
            
            <h3 className="text-white text-xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {getLocalizedTitle(film, locale)}
              </span>
            </h3>
            <p className="text-gray-300 text-sm mb-6">{t(`genre.${film.genre}`)} • {film.releaseYear}</p>

            {/* Pricing breakdown */}
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-300">{t('payment.subtotal')}:</span>
                <span className="text-white font-medium">
                  {isLoadingRates ? (
                    <div className="animate-pulse">Convertendo...</div>
                  ) : (
                    `${currencySymbol}${convertedPrice.toFixed(2)} ${selectedCurrency}`
                  )}
                </span>
              </div>
              {selectedCurrency !== 'USD' && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400 text-xs">Original (USD):</span>
                  <span className="text-gray-400 text-xs">USD ${film.price.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-300">{t('payment.prideSupportFee')}:</span>
                <span className="text-green-400 font-medium">{currencySymbol}0.00</span>
              </div>
              <hr className="border-white/20 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-white font-bold flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                  {t('payment.total')}:
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {isLoadingRates ? (
                    <div className="animate-pulse text-base">Convertendo...</div>
                  ) : (
                    `${currencySymbol}${convertedPrice.toFixed(2)} ${selectedCurrency}`
                  )}
                </span>
              </div>
            </div>

            {/* Security badges */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Shield className="w-4 h-4 text-green-400" />
                <span>{t('payment.ssl256Encryption')}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span>
                  {paymentMethod === 'paypal' ? t('payment.processedViaPayPal') : t('payment.processedViaStripe')}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - PayPal payment */}
          <div className="flex-1 p-4 sm:p-6">
            {/* Desktop close button */}
            <div className="hidden lg:flex items-center justify-between mb-4 sm:mb-8">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  paymentMethod === 'paypal' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                }`}>
                  {paymentMethod === 'paypal' ? (
                    <Wallet className="w-5 h-5 text-white" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-white text-xl sm:text-2xl font-bold">
                    <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
                      paymentMethod === 'paypal' 
                        ? 'from-blue-400 to-cyan-400' 
                        : 'from-cyan-400 to-purple-400'
                    }`}>
                      {paymentMethod === 'paypal' ? t('payment.paypalPayment') : t('payment.finalizePurchase')}
                    </span>
                  </h2>
                  <p className="text-gray-300 text-xs sm:text-sm">{t('payment.secureInstantPayment')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/90 transition-all duration-300 transform hover:scale-110 border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Payment Method Tabs */}
              <div className="mb-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-white/10 backdrop-blur-sm p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-lg transition-all duration-300 ${
                      paymentMethod === 'card'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    disabled={isProcessing}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      {t('payment.card')}
                    </span>
                  </button>
                  
                  {isApplePayAvailable && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple-pay')}
                      className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-lg transition-all duration-300 ${
                        paymentMethod === 'apple-pay'
                          ? 'bg-gradient-to-r from-gray-800 to-black text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                      disabled={isProcessing}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span className="font-medium text-sm">Apple Pay</span>
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-lg transition-all duration-300 ${
                      paymentMethod === 'paypal'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    disabled={isProcessing}
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="font-medium text-sm">PayPal</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <>
                  {/* Card Information */}
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <h3 className="text-white font-bold mb-4 flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-green-400" />
                      <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {t('payment.cardInformation')}
                      </span>
                    </h3>



                    <div className="space-y-4">
                      <form autoComplete="off">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            {t('payment.cardNumber')}
                          </label>
                          <div 
                            id="card-number-element"
                            className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all duration-300 min-h-[56px]"
                          />
                          {errors.paymentError && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.paymentError}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              {t('payment.expiryDate')}
                            </label>
                            <div 
                              id="card-expiry-element"
                              className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-400/20 transition-all duration-300 min-h-[56px]"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              {t('payment.cvv')}
                            </label>
                            <div 
                              id="card-cvc-element"
                              className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-400/20 transition-all duration-300 min-h-[56px]"
                            />
                          </div>
                        </div>
                      </form>                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          {t('payment.cardholderName')}
                        </label>
                        <input
                          type="text"
                          value={formData.cardholderName}
                          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                          placeholder={t('payment.cardholderNamePlaceholder')}
                          className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                            errors.cardholderName ? 'border-red-500' : 'border-white/20'
                          } focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300`}
                          disabled={isProcessing}
                        />
                        {errors.cardholderName && (
                          <p className="text-red-400 text-sm mt-1">{errors.cardholderName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          {t('payment.email')}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder={t('payment.emailPlaceholder')}
                          className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                            errors.email ? 'border-red-500' : 'border-white/20'
                          } focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300`}
                          disabled={isProcessing}
                        />
                        {errors.email && (
                          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          {t('payment.country')}
                        </label>
                        <select
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                          disabled={isProcessing || isLoadingCountries}
                        >
                          {isLoadingCountries ? (
                            <option value="">Carregando países...</option>
                          ) : (
                            <>
                              <option value="" className="bg-gray-800 text-gray-400">
                                {t('payment.selectCountry')}
                              </option>
                              {countries.map((country) => (
                                <option 
                                  key={country.code} 
                                  value={country.code}
                                  className="bg-gray-800 text-white"
                                >
                                  {country.flag} {country.name} ({country.code})
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                        {errors.country && (
                          <p className="text-red-400 text-sm mt-1">{errors.country}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Billing Information */}
                  {/* <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <h3 className="text-white font-bold mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-pink-400" />
                      <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {t('payment.billingInformation')}
                      </span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          {t('payment.email')}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder={t('payment.emailPlaceholder')}
                          className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                            errors.email ? 'border-red-500' : 'border-white/20'
                          } focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300`}
                          disabled={isProcessing}
                        />
                        {errors.email && (
                          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            {t('payment.zipCode')}
                          </label>
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            placeholder={t('payment.zipCodePlaceholder')}
                            className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                            disabled={isProcessing}
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            {t('payment.city')}
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder={t('payment.cityPlaceholder')}
                            className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                            disabled={isProcessing}
                          />
                        </div>
                      </div>
                    </div>
                  </div> */}
                </>
              )}

              {paymentMethod === 'apple-pay' && (
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-8 rounded-xl border border-white/20">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg sm:text-xl mb-2">
                      <span className="bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent">
                        Apple Pay
                      </span>
                    </h3>
                    <p className="text-gray-300 text-xs sm:text-sm mb-6">
                      {t('payment.applePayDescription')}
                    </p>
                    
                    {/* Country Selection for Apple Pay */}
                    <div className="mb-6">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        <span className="text-red-400">*</span> {t('payment.country')}
                      </label>
                      <p className="text-gray-400 text-xs mb-3">
                        {t('payment.applePayCountryDescription')}
                      </p>
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                        disabled={isProcessing || isLoadingCountries}
                      >
                        {isLoadingCountries ? (
                          <option value="">{t('payment.loadingCountries')}</option>
                        ) : (
                          <>
                            <option value="" className="bg-gray-800 text-gray-400">
                              {t('payment.selectCountry')}
                            </option>
                            {countries.map((country) => (
                              <option 
                                key={country.code} 
                                value={country.code}
                                className="bg-gray-800 text-white"
                              >
                                {country.flag} {country.name} ({country.code})
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      {errors.country && (
                        <p className="text-red-400 text-sm mt-1">{errors.country}</p>
                      )}
                    </div>

                    <div className="bg-gray-800/20 border border-gray-600/30 rounded-xl p-2 sm:p-4 mb-4 sm:mb-6">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-300">{t('payment.totalToPay')}:</span>
                        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          {isLoadingRates ? (
                            <div className="animate-pulse text-base">{t('payment.convertingAmount')}</div>
                          ) : (
                            `${currencySymbol}${convertedPrice.toFixed(2)} ${selectedCurrency}`
                          )}
                        </span>
                      </div>
                      {formData.country && selectedCurrency !== 'USD' && (
                        <div className="text-center mt-2 text-xs text-gray-400">
                          {t('payment.originalValue')}: USD ${film.price.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="w-full">
                      <button
                        type="button"
                        onClick={handleApplePayPayment}
                        disabled={isProcessing || !formData.country}
                        className={`apple-pay-button w-full h-12 rounded-lg border-none cursor-pointer flex items-center justify-center text-white font-medium transition-all duration-300 ${
                          !formData.country 
                            ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                            : 'bg-black hover:bg-gray-800'
                        }`}
                        style={formData.country ? {
                          WebkitAppearance: '-apple-pay-button' as any,
                          appearance: '-apple-pay-button' as any
                        } : {}}
                      >
                        {!formData.country && (
                          <span className="text-sm">{t('payment.selectCountryFirst')}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-8 rounded-xl border border-white/20">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg sm:text-xl mb-2 sm:mb-4">
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      PayPal
                    </span>
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">
                    {t('payment.redirectMessage')}
                  </p>
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-2 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-300">{t('payment.totalToPay')}:</span>
                      <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        USD {film.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Email field for PayPal */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
                    {t('payment.paypalEmail')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t('payment.paypalEmailPlaceholder')}
                    className={`w-full p-3 sm:p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                      errors.email ? 'border-red-500' : 'border-white/20'
                    } focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300`}
                    disabled={isProcessing}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {t('payment.enterPaypalEmail')}
                  </p>
                </div>

                {/* PayPal Payment Button */}
                <div className="mb-4 sm:mb-6">
                  <button
                    type="button"
                    onClick={handlePayPalPayment}
                    disabled={isProcessing || !formData.email}
                    className="w-full py-3 sm:py-5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 hover:shadow-blue-500/25"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                        <span>{t('payment.redirectingToPaypal')}</span>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2 px-3">
                        <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>{t('payment.payWithPaypal')}</span>
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
                      </div>
                    )}
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3 text-xs text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>{t('payment.paypalBuyerProtection')}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Wallet className="w-4 h-4 text-blue-400" />
                    <span>{t('payment.securePayment100')}</span>
                  </div>
                </div>
              </div>
              )}

              {/* Submit Button - Only for Card payments */}
              {paymentMethod === 'card' && (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 sm:py-5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white hover:from-green-600 hover:via-emerald-600 hover:to-cyan-600 hover:shadow-green-500/25"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                      <span>{t('payment.processingWithLove')}</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-6 h-6" />
                      <span>
                        {t('payment.finalizeCardPurchase')} - {currencySymbol}{convertedPrice.toFixed(2)} {selectedCurrency}
                      </span>
                      <Heart className="w-5 h-5 text-pink-300" />
                    </>
                  )}
                </button>
              )}

              {/* Security Notice */}
              <div className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-300 text-xs sm:text-sm">
                    <strong>{t('payment.securePaymentNotice')}</strong> {t('payment.militaryEncryption').replace('PayPal', paymentMethod === 'paypal' ? 'PayPal' : 'Stripe com certificação PCI DSS')}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    {t('payment.supportDiverseContent')}
                  </p>
                </div>
              </div>
            </form>

            {/* PayPal Benefits - Only show for PayPal */}
            {paymentMethod === 'paypal' && (
              <div className="mt-4 sm:mt-6 bg-blue-500/10 border border-blue-400/20 rounded-xl p-3 sm:p-4">
                <h4 className="text-blue-300 font-medium mb-2 sm:mb-3 text-center">{t('payment.paypalAdvantages')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span>{t('payment.totalBuyerProtection')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-3 h-3 text-blue-400" />
                    <span>{t('payment.noShareBankData')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span>{t('payment.instantPayment')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-3 h-3 text-pink-400" />
                    <span>{t('payment.support24x7')}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Pride Footer */}
            <div className="mt-4 sm:mt-6 text-center">
              <div className="flex justify-center space-x-1 mb-2">
                {['🏳️‍🌈', '🏳️‍⚧️', '❤️', '🧡', '💛', '💚', '💙', '💜'].map((emoji, i) => (
                  <span key={i} className="text-lg animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                    {emoji}
                  </span>
                ))}
              </div>
              <p className="text-gray-400 text-xs">
                {t('payment.thankYouSupport')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}