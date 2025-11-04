"use client"

import Link from "next/link"
import { User, Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { getCurrentUser, logout } from "@/lib/auth"
import { useTranslation } from "@/lib/i18n-provider"
import LanguageSelector from "./language-selector"
import type { Client } from "@/lib/auth"

export default function Navbar() {
  const { t } = useTranslation()
  const [user, setUser] = useState<Client | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    
    const loadUser = () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        setUser(null)
      }
    }

    loadUser()

    // Listen for storage changes (when user logs in from another tab or component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eros_user') {
        loadUser()
      }
    }

    // Listen for custom login event
    const handleLoginEvent = () => {
      loadUser()
    }

    // Listen for custom logout event
    const handleLogoutEvent = () => {
      setUser(null)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('user-login', handleLoginEvent)
    window.addEventListener('user-logout', handleLogoutEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('user-login', handleLoginEvent)
      window.removeEventListener('user-logout', handleLogoutEvent)
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setIsMobileMenuOpen(false) // Close mobile menu on logout
    try {
      await logout()
      setUser(null)
      router.push("/login")
    } catch (error) {
      // Handle logout error
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Handle mobile menu item click
  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false)
  }

  // Helper function to determine if a link is active
  const getLinkClasses = (href: string) => {
    const isActive = pathname === href
    return `text-white/80 hover:text-white transition-colors ${
      isActive ? 'font-bold text-white border-b-2 border-pink-400' : ''
    }`
  }

  const getLinkUsers = (href: string) => {
    const isActive = pathname === href
    return `flex items-center space-x-2 text-white/80 hover:text-white transition-colors ${
      isActive ? 'font-bold text-white border-b-2 border-pink-400' : ''
    }`
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Desktop Layout - Original */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-white text-2xl font-bold">
              Eros Unlimited
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className={getLinkClasses("/")}>
                {t('navbar.home')}
              </Link>
              <Link href="/about" className={getLinkClasses("/about")}>
                {t('navbar.about')}
              </Link>
              <Link href="/making-of" className={getLinkClasses("/making-of")}>
                {t('navbar.makingOf')}
              </Link>
              <Link href="/partner" className={getLinkClasses("/partner")}>
                {t('navbar.partner')}
              </Link>
              <Link href="/releases" className={getLinkClasses("/releases")}>
                {t('navbar.releases')}
              </Link>

              {user && (
                <Link href="/my-movies" className={getLinkClasses("/my-movies")}>
                  {t('navbar.myMovies')}
                </Link>
              )}

              {user?.role == 'ADMIN' &&(
                <Link href="/edit-movie" className={getLinkClasses("/edit-movie")}>
                  {t('navbar.editMovie')}
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Right Side - Original */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            
            {!mounted ? (
              <div className="text-white/80 text-sm">...</div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                <Link href={`/users/${user.id}`} className={getLinkUsers(`/users/${user.id}`)}>
                  <User className="w-6 h-6" />
                  <span className="hidden md:inline">{user.name}</span>
                </Link>

                <button 
                  onClick={handleLogout} 
                  disabled={isLoggingOut}
                  className="ml-6 text-white/80 hover:text-white text-sm disabled:opacity-50"
                >
                  {isLoggingOut ? t('navbar.loggingOut') : t('navbar.logout')}
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-white/80 hover:text-white">
                {t('navbar.login')}
              </Link>
            )}
          </div>

          {/* Mobile Right Side */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageSelector />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`
        fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50 bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 md:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-xl font-bold">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-4">
            <Link 
              href="/" 
              className={`block px-4 py-3 text-lg rounded-lg transition-colors ${
                pathname === "/" ? 'bg-pink-500/20 text-pink-400 font-semibold' : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
              onClick={handleMobileMenuClick}
            >
              {t('navbar.home')}
            </Link>
            
            <Link 
              href="/about" 
              className={`block px-4 py-3 text-lg rounded-lg transition-colors ${
                pathname === "/about" ? 'bg-pink-500/20 text-pink-400 font-semibold' : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
              onClick={handleMobileMenuClick}
            >
              {t('navbar.about')}
            </Link>

            <Link 
              href="/making-of" 
              className={`block px-4 py-3 text-lg rounded-lg transition-colors ${
                pathname === "/making-of" ? 'bg-pink-500/20 text-pink-400 font-semibold' : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
              onClick={handleMobileMenuClick}
            >
              {t('navbar.makingOf')}
            </Link>
            
            <Link 
              href="/partner" 
              className={`block px-4 py-3 text-lg rounded-lg transition-colors ${
                pathname === "/partner" ? 'bg-pink-500/20 text-pink-400 font-semibold' : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
              onClick={handleMobileMenuClick}
            >
              {t('navbar.partner')}
            </Link>
            
            <Link 
              href="/releases" 
              className={`block px-4 py-3 text-lg rounded-lg transition-colors ${
                pathname === "/releases" ? 'bg-pink-500/20 text-pink-400 font-semibold' : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
              onClick={handleMobileMenuClick}
            >
              {t('navbar.releases')}
            </Link>

            {user && (
              <Link 
                href="/my-movies" 
                className={`block px-4 py-3 text-lg rounded-lg transition-colors ${
                  pathname === "/my-movies" ? 'bg-pink-500/20 text-pink-400 font-semibold' : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
                onClick={handleMobileMenuClick}
              >
                {t('navbar.myMovies')}
              </Link>
            )}
          </div>

          {/* Mobile User Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            {!mounted ? (
              <div className="text-white/80 text-sm">...</div>
            ) : user ? (
              <div className="space-y-4">
                <Link 
                  href={`/users/${user.id}`} 
                  className={`flex items-center space-x-3 px-4 py-3 text-lg rounded-lg transition-colors ${
                    pathname === `/users/${user.id}` ? 'bg-pink-500/20 text-pink-400 font-semibold' : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={handleMobileMenuClick}
                >
                  <User className="w-6 h-6" />
                  <span>{user.name}</span>
                </Link>

                <button 
                  onClick={handleLogout} 
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-3 text-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? t('navbar.loggingOut') : t('navbar.logout')}
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="block px-4 py-3 text-lg text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
                onClick={handleMobileMenuClick}
              >
                {t('navbar.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}