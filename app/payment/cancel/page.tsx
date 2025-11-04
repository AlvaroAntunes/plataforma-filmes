"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, Heart, Home } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function PaymentCancel() {
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    // Redirect to home after 10 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/20 shadow-2xl">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              {t('paymentCancel.title')}
            </span>
          </h1>

          {/* Message */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            {t('paymentCancel.message')}
          </p>

          <div className="bg-orange-500/10 border border-orange-400/20 rounded-xl p-4 mb-6">
            <p className="text-orange-300 text-sm">
              {t('paymentCancel.tryAgain')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>{t('paymentCancel.backHome')}</span>
            </button>
            
            <button
              onClick={() => router.back()}
              className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:bg-white/20 border border-white/20 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('paymentCancel.backPaypal')}</span>
            </button>
          </div>

          {/* Auto redirect notice */}
          <p className="text-gray-400 text-xs mt-6">
            {t('paymentCancel.autoRedirect')}
          </p>
        </div>

        {/* Pride Footer */}
        <div className="mt-6 text-center">
          <div className="flex justify-center space-x-1 mb-2">
            {['🏳️‍🌈', '🏳️‍⚧️', '❤️', '🧡', '💛', '💚', '💙', '💜'].map((emoji, i) => (
              <span key={i} className="text-lg animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                {emoji}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-xs">
            {t('paymentCancel.footer')}
          </p>
        </div>
      </div>
    </div>
  )
}
