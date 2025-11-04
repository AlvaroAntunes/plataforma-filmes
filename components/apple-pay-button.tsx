"use client"

import { useState, useEffect } from "react"

interface ApplePayButtonProps {
  amount: number
  onPaymentSuccess: () => void
  onPaymentError: (error: string) => void
  className?: string
}

export default function ApplePayButton({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  className = "" 
}: ApplePayButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment) {
      setIsAvailable(true)
    } else if (typeof window !== 'undefined' && window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
      setIsAvailable(true)
    }
  }, [])

  if (!isAvailable) {
    return null
  }

  return (
    <button
      className={`apple-pay-button ${className}`}
      style={{
        display: 'block',
        width: '100%',
        height: '48px',
        backgroundColor: '#000',
        borderRadius: '8px',
        cursor: 'pointer',
        border: 'none',
        WebkitAppearance: '-apple-pay-button' as any
      } as React.CSSProperties}
      onClick={() => {
        const isDevelopment = process.env.NODE_ENV === 'development'
        
        if (isDevelopment) {
          // Simulate Apple Pay payment in development
          setTimeout(() => {
            onPaymentSuccess()
          }, 1500)
        } else {
          // Real Apple Pay implementation would go here
          onPaymentError('Apple Pay not implemented yet')
        }
      }}
    />
  )
}