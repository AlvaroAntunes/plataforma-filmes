"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { login } from "@/lib/auth"
import { getAndClearPostLoginAction } from "@/lib/redirect-after-login"
import { useAuthTranslation } from "@/hooks/useTranslation"
import { Heart, Mail, Lock, Sparkles, Rainbow, Star, Eye, EyeOff } from "lucide-react"

export default function Login() {
  const auth = useAuthTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = await login(email, password)
      
      if (user) {
        // Verificar se há alguma ação pendente após login
        const postLoginAction = getAndClearPostLoginAction()
        
        if (postLoginAction) {
          // Se há uma ação pendente, redirecionar para a home com parâmetros
          // A home page vai lidar com a abertura da modal do filme
          if (postLoginAction.type === 'purchase-film') {
            router.push(`/?openFilm=${postLoginAction.filmId}`)
          } else if (postLoginAction.type === 'view-film') {
            router.push(`/?openFilm=${postLoginAction.filmId}`)
          } else {
            router.push("/")
          }
        } else {
          // Redirecionamento normal para a home
          router.push("/")
        }
      } else {
        setError(auth.invalidCredentials)
      }
    } catch (error) {
      setError(auth.loginError)
    } finally {
      setLoading(false)
    }
  }

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden pt-16">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Rainbow gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 via-yellow-500/10 via-green-500/10 via-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-pulse"></div>
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', 
                '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
              ][Math.floor(Math.random() * 10)],
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}

        {/* Large decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header with Pride Elements */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <Heart className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Rainbow className="w-8 h-8 text-yellow-400 animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 via-green-400 via-yellow-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                EROS UNLIMITED
              </span>
            </h1>
            <p className="text-gray-200 text-lg mb-2">{auth.welcomeBack}</p>
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-sm text-gray-300">{auth.loveIsLove}</span>
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <label className="block text-white text-sm font-medium mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-blue-400" />
                  {auth.email}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 pl-12"
                    placeholder={auth.loginEmailPlaceholder}
                    required
                    disabled={loading}
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="block text-white text-sm font-medium mb-2 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-purple-400" />
                  {auth.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 pl-12 pr-12"
                    placeholder={auth.loginPasswordPlaceholder}
                    required
                    disabled={loading}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-pink-500/25 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{auth.login}...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    <span>{auth.signIn}</span>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-300 mb-4">
                {auth.dontHaveAccount}
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Star className="w-4 h-4" />
                <span>{auth.signUp}</span>
              </Link>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-8">
            <p className="text-gray-300 text-sm">
              ✨ {auth.createdWithLove} ✨
            </p>
            <div className="flex justify-center space-x-1 mt-2">
              {['🏳️‍🌈', '🏳️‍⚧️', '❤️', '🧡', '💛', '💚', '💙', '💜'].map((emoji, i) => (
                <span key={i} className="text-lg animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}