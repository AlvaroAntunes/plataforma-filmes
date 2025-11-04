"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { register } from "@/lib/auth"
import { useAuthTranslation } from "@/hooks/useTranslation"
import { Heart, Mail, Lock, User, Sparkles, Rainbow, Star, Crown, Eye, EyeOff } from "lucide-react"

export default function Register() {
  const auth = useAuthTranslation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (password !== confirmPassword) {
      setError(auth.passwordMismatch)
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError(auth.passwordMinLength)
      setLoading(false)
      return
    }

    try {
      const user = await register(name, email, password)
      if (user) {
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message || auth.registerError)
    } finally {
      setLoading(false)
    }
  }

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden pt-16">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Rainbow gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 via-yellow-500/10 via-green-500/10 via-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-pulse"></div>
        
        {/* Floating hearts and stars */}
        {[...Array(25)].map((_, i) => (
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
            {i % 3 === 0 ? (
              <Heart className="w-4 h-4 text-pink-400/60" />
            ) : i % 3 === 1 ? (
              <Star className="w-3 h-3 text-yellow-400/60" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
            )}
          </div>
        ))}

        {/* Large decorative elements */}
        <div className="absolute top-1/6 left-1/6 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/6 right-1/6 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-56 h-56 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header with Pride Elements */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-3 -right-3">
                <Rainbow className="w-10 h-10 text-yellow-400 animate-bounce" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 via-pink-400 via-yellow-400 to-green-400 bg-clip-text text-transparent animate-pulse">
                {auth.joinTheFamily}
              </span>
            </h1>
            <p className="text-gray-200 text-lg mb-2">{auth.createAccountAndJoin}</p>
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-sm text-gray-300">{auth.diversityInclusionLove}</span>
              <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
            </div>
          </div>

          {/* Register Form */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="relative">
                <label className="block text-white text-sm font-medium mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-cyan-400" />
                  {auth.fullName}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 pl-12"
                    placeholder={auth.fullNamePlaceholder}
                    required
                    disabled={loading}
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

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
                    className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 pl-12"
                    placeholder={auth.emailPlaceholder}
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
                    placeholder={auth.passwordPlaceholder}
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

              {/* Confirm Password Field */}
              <div className="relative">
                <label className="block text-white text-sm font-medium mb-2 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-pink-400" />
                  {auth.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 pl-12 pr-12"
                    placeholder={auth.confirmPasswordPlaceholder}
                    required
                    disabled={loading}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
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
                className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-purple-500/25 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{auth.creatingAccount}</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>{auth.createMyAccount}</span>
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-300 mb-4">
                {auth.alreadyPartOfFamily}
              </p>
              <Link 
                href="/login" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Heart className="w-4 h-4" />
                <span>{auth.makeLogin}</span>
              </Link>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-8">
            <p className="text-gray-300 text-sm mb-3">
              🌈 {auth.celebratingLove} 🌈
            </p>
            <div className="flex justify-center space-x-1">
              {['❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎'].map((emoji, i) => (
                <span key={i} className="text-xl animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
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