'use client'

import { useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-provider'
import { Locale, localeNames } from '@/lib/i18n'

export default function LanguageSelector() {
  const { locale, setLocale, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-40 bg-black/90 backdrop-blur-sm border border-white/20 rounded-md shadow-lg z-50">
            <div className="p-1">
              {Object.entries(localeNames).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => handleLocaleChange(code as Locale)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    locale === code
                      ? 'bg-pink-600 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
