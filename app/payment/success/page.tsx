"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, AlertTriangle, Home } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [countdown, setCountdown] = useState(10)

  const token = searchParams.get('token')
  const PayerID = searchParams.get('PayerID')
  const payment_intent = searchParams.get('payment_intent')
  const payment_intent_client_secret = searchParams.get('payment_intent_client_secret')
  const source = searchParams.get('source') || 'paypal' // default to paypal for backwards compatibility
  const { t } = useTranslation()

  // Countdown timer effect
  useEffect(() => {
    if (success || error) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            router.push('/')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [success, error, router])

  useEffect(() => {
    const processPayment = async () => {
      // Processar pagamento Stripe ou Apple Pay
      if ((source === 'stripe' || source === 'apple_pay') && payment_intent) {
        try {
          // Para Stripe e Apple Pay, apenas confirmar se o pagamento foi bem-sucedido
          // (o processamento já foi feito no modal)
          setSuccess(true)
          setPaymentData({
            id: payment_intent,
            source: source, // Preserve the original source (stripe or apple_pay)
            status: 'succeeded'
          })
          setIsProcessing(false)
          return
        } catch (error: any) {
          setError(`Erro ao processar pagamento ${source === 'apple_pay' ? 'Apple Pay' : 'Stripe'}`)
          setIsProcessing(false)
          return
        }
      }

      // Processar pagamento PayPal (código existente)
      if (!token || !PayerID) {
        setError('Dados do pagamento PayPal não encontrados na URL')
        setIsProcessing(false)
        return
      }

      try {
        const response = await fetch('/api/payments/capture-paypal-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            orderID: token
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorText = await response.text().catch(() => 'Erro desconhecido')
          throw new Error(`Erro HTTP ${response.status}: ${errorData.error || errorText}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error('Falha na captura do pagamento PayPal')
        }

        setSuccess(true)
        setPaymentData(result.payment)
        setIsProcessing(false)

      } catch (error: any) {
        setError(error.message || 'Erro ao processar pagamento')
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [token, PayerID, payment_intent, source, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center p-4">
      <div className="relative z-10 max-w-lg w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/20 shadow-2xl">

          {isProcessing ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {t('paymentSuccess.processingTitle')}
                </span>
              </h1>
              <p className="text-gray-300 mb-6">
                {t('paymentSuccess.processingMessage')}
              </p>
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
                <p className="text-blue-300 text-sm">
                  ⏳ {t('paymentSuccess.capturing')}
                </p>
              </div>
            </>
          ) : error ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  {t('paymentSuccess.errorTitle')}
                </span>
              </h1>
              <p className="text-gray-300 mb-6">
                {error}
              </p>
              <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4 mb-6">
                <p className="text-red-300 text-sm">
                  ❌ {t('paymentSuccess.errorMessage')}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>{t('paymentSuccess.backHome')}</span>
              </button>
            </>
          ) : success ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  🎉 {t('paymentSuccess.successTitle')}
                </span>
              </h1>
              <p className="text-gray-300 mb-6">
                {t('paymentSuccess.successMessage')}
              </p>
              {paymentData && (
                <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 mb-6">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-green-300 font-bold text-lg">
                        {paymentData.source === 'apple_pay' ? `🍎 Apple Pay` : 
                         paymentData.source === 'stripe' ? `💳 ${t('payment.card')}` : 
                         '🅿️ PayPal'}
                      </span>
                    </div>
                    {paymentData.amount && (
                      <div className="text-green-300 font-bold text-xl">
                        USD ${paymentData.amount}
                      </div>
                    )}
                    <div className="text-green-400 font-medium">
                      ✅ {t('paymentSuccess.approved')}
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  🔄 {t('paymentError.autoRedirect').replace('{seconds}', countdown.toString())}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>{t('paymentSuccess.goToCatalog')}</span>
              </button>
            </>
          ) : null}
        </div>

        <div className="mt-6 text-center">
          <div className="flex justify-center space-x-1 mb-2">
            {['🏳️‍🌈', '🏳️‍⚧️', '❤️', '🧡', '💛', '💚', '💙', '💜'].map((emoji, i) => (
              <span key={i} className="text-lg animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                {emoji}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-xs">
            {t('paymentSuccess.footer')}
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading component para o Suspense
function LoadingPayment() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t('paymentSuccess.loading')}
          </span>
        </h2>
        <p className="text-gray-300">
          {t('paymentSuccess.preparing')}
        </p>
      </div>
    </div>
  )
}

// Componente principal com Suspense
export default function PaymentSuccess() {
  return (
    <Suspense fallback={<LoadingPayment />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}