// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { getCurrentUser, logout, initializeAuth } from '@/lib/auth'
import type { Client } from '@/lib/auth'

export const useAuth = () => {
  const [user, setUser] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get user from localStorage first (faster)
        const localUser = getCurrentUser()
        if (localUser) {
          setUser(localUser)
          setIsLoading(false)
        }

        // Then verify with Supabase (more reliable)
        const verifiedUser = await initializeAuth()
        setUser(verifiedUser)
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for user login/logout/update events
    const handleUserLogin = () => {
      const user = getCurrentUser()
      setUser(user)
    }

    const handleUserLogout = () => {
      setUser(null)
    }

    const handleUserUpdate = (event: CustomEvent) => {
      const updatedUser = event.detail as Client
      setUser(updatedUser)
    }

    window.addEventListener('user-login', handleUserLogin)
    window.addEventListener('user-logout', handleUserLogout)
    window.addEventListener('user-updated', handleUserUpdate as EventListener)

    return () => {
      window.removeEventListener('user-login', handleUserLogin)
      window.removeEventListener('user-logout', handleUserLogout)
      window.removeEventListener('user-updated', handleUserUpdate as EventListener)
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      setUser(null)
    } catch (error) {
      // Silent error handling for logout
    } finally {
      setIsLoggingOut(false)
    }
  }

  const updateUser = (newUser: Client | null) => {
    setUser(newUser)
  }

  return {
    user,
    isLoading,
    isLoggingOut,
    logout: handleLogout,
    updateUser,
    isAuthenticated: !!user
  }
}