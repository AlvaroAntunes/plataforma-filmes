"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle, AlertTriangle, Home, RotateCcw } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

function PaymentErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(20)

  const error = searchParams.get('error') || 'Unknown payment error'
  const source = searchParams.get('source') || 'unknown'
  const payment_intent = searchParams.get('payment_intent')
  const { t } = useTranslation()

  useEffect(() => {
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
  }, [router])

  const handleRetry = () => {
    router.push('/')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-lg w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/20 shadow-2xl">
          
          {/* Error Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              💔 {t('paymentError.title')}
            </span>
          </h1>

          {/* Error Message */}
          <p className="text-gray-300 mb-6">
            {t('paymentError.message')}
          </p>

          {/* Error Details */}
          <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4 mb-6">
            <div className="text-center space-y-3">
              <div className="text-red-300 font-bold text-lg">
                {source === 'stripe' ? `💳 ${t('payment.card')}` : source === 'paypal' ? '🅿️ PayPal' : '❌ Erro de Pagamento'}
              </div>
              <div className="text-red-200 text-sm">
                {error.length > 100 ? 'Erro no processamento do pagamento' : error}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>{t('paymentError.backHome')}</span>
            </button>
          </div>

          {/* Auto Redirect Notice */}
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 mt-6">
            <p className="text-blue-300 text-sm">
              🔄 {t('paymentError.autoRedirect').replace('{seconds}', countdown.toString())}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-gray-400 text-xs">
              {t('paymentError.supportMessage')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PaymentErrorContent />
    </Suspense>
  )
}