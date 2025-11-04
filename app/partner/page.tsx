"use client"

import { useState, useEffect } from "react"
import { Mail, Phone, Camera, Heart, Users, Sparkles, Film, Star, ArrowRight, Send, Play } from "lucide-react"
import Image from "next/image"
import { usePartnerTranslation, useCommonTranslation } from "@/hooks/useTranslation"

export default function Partner() {
  const partner = usePartnerTranslation()
  const common = useCommonTranslation()
  const [hoveredImage, setHoveredImage] = useState<number | null>(null)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    filmTitle: '',
    genre: '',
    description: '',
    budget: '',
    timeline: ''
  })

  const partnershipBenefits = [
    {
      icon: <Film className="w-8 h-8" />,
      title: partner.creativeFreedom,
      description: partner.creativeFreedomDesc
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: partner.globalAudience,
      description: partner.globalAudienceDesc
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: partner.festivalNetwork,
      description: partner.festivalNetworkDesc
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: partner.passionateCommunity,
      description: partner.passionateCommunityDesc
    }
  ]

  const partnerImages = [
    {
      id: 1,
      category: partner.behindScenes,
      description: partner.behindScenesDesc
    },
    {
      id: 2,
      category: partner.festivalMoments, 
      description: partner.festivalMomentsDesc
    },
    {
      id: 3,
      category: partner.communityEvents,
      description: partner.communityEventsDesc
    },
    {
      id: 4,
      category: partner.artisticVision,
      description: partner.artisticVisionDesc
    },
    {
      id: 5,
      category: partner.collaboration,
      description: partner.collaborationDesc
    }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!formData.name || !formData.email || !formData.description) {
      setSubmitError(partner.fillRequiredFields)
      setSubmitMessage(null)
      return
    }

    // Criar o corpo do email
    const emailSubject = `Nova Consulta de Parceria - ${formData.name}`
    
    const emailBody = `
Nova Consulta de Parceria - Eros Unlimited

INFORMAÇÕES DO CONTATO:
- Nome: ${formData.name}
- Email: ${formData.email}
${formData.phone ? `- Telefone: ${formData.phone}` : ''}

INFORMAÇÕES DO PROJETO:
${formData.filmTitle ? `- Título do Filme: ${formData.filmTitle}` : ''}
${formData.genre ? `- Gênero: ${formData.genre}` : ''}
${formData.budget ? `- Orçamento: ${formData.budget}` : ''}
${formData.timeline ? `- Data de Lançamento: ${formData.timeline}` : ''}

DESCRIÇÃO DO PROJETO:
${formData.description}

---
Esta mensagem foi enviada através do formulário de parceria do site Eros Unlimited.
Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
    `.trim()

    // Criar URL mailto
    const mailtoUrl = `mailto:erosunlimitedart@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

    try {
      // Abrir cliente de email
      window.location.href = mailtoUrl
      
      // Mostrar mensagem de sucesso
      setSubmitMessage(partner.inquirySentSuccess)
      setSubmitError(null)
      
      // Limpar formulário após 2 segundos
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          filmTitle: '',
          genre: '',
          description: '',
          budget: '',
          timeline: ''
        })
      }, 2000)
      
      // Remover mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSubmitMessage(null)
      }, 3000)
      
    } catch (error) {
      console.error('Erro ao abrir cliente de email:', error)
      setSubmitError(partner.inquiryError)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-pink-800/30 to-purple-600/40" />
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-red-500/20 via-orange-500/20 via-yellow-500/20 via-green-500/20 via-blue-500/20 via-indigo-500/20 to-purple-500/20 animate-pulse" />
        </div>
        
        <div className="relative z-10 text-center max-w-6xl mx-auto px-6 sm:px-8 md:px-4 pt-20">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            {partner.heroTitle}
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl mb-8 text-gray-200 font-light">
            {partner.heroSubtitle}
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-purple-500 mx-auto mb-8 rounded-full" />
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
            {partner.heroText}
          </p>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Partnership Vision */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              {partner.partnershipVisionTitle}
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-8">
                {partner.visionText1} <span className="text-red-400 font-semibold">{partner.visionText2}</span> {partner.visionText3}
              </p>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                {partner.visionText4} <span className="text-pink-400 font-semibold">{partner.visionText5}</span> {partner.visionText6}
              </p>
            </div>
          </div>

          {/* Call to Action Box */}
          <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 rounded-2xl p-6 sm:p-8 border border-red-500/20 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-red-400">{partner.yourFilmMatters}</h3>
            <p className="text-lg sm:text-xl text-gray-300 mb-6">
              {partner.filmMattersText1} <span className="text-pink-400 font-semibold">{partner.filmMattersText2}</span>
            </p>
            <p className="text-base sm:text-lg text-gray-400">
              {partner.filmMattersText3}
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-24 bg-gradient-to-br from-red-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {partner.whyPartnerWithUs}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnershipBenefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-6 sm:p-8 border border-red-500/20 hover:border-pink-500/40 transition-all duration-300 hover:transform hover:scale-105 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-4">{benefit.title}</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Gallery */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {partner.partnershipInActionTitle}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {partnerImages.map((img, index) => (
              <div 
                key={img.id}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 flex items-center justify-center">
                    <div className="text-center p-2 sm:p-4">
                      <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-white mx-auto mb-2 sm:mb-3" />
                      <p className="text-white font-semibold text-xs sm:text-sm">{img.category}</p>
                    </div>
                  </div>
                  
                  {hoveredImage === index && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center transition-all duration-300">
                      <div className="text-center text-white p-2 sm:p-4">
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm">{img.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 text-base sm:text-lg">
              {partner.joinCommunityText}
            </p>
          </div>
        </div>
      </section>

      {/* Contact & Partnership Form */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                {partner.letsCollaborate}
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{partner.contactToCollaborate}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{partner.email}</p>
                        <a href="mailto:erosunlimitedart@gmail.com" className="text-red-400 font-semibold text-base sm:text-lg hover:text-pink-400 transition-colors break-all">
                          erosunlimitedart@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 p-4 sm:p-6 rounded-xl border border-red-500/20">
                  <h4 className="text-lg sm:text-xl font-bold text-red-400 mb-3">{partner.readyToStart}</h4>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                    {partner.readyToStartText}
                  </p>
                </div>
              </div>
            </div>

            {/* Partnership Inquiry Form */}
            <div>
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-6 sm:p-8 border border-purple-500/20">
                <h3 className="text-xl sm:text-2xl font-bold text-purple-400 mb-6">{partner.partnershipInquiry}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">{partner.name} *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">{partner.email} *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">{partner.phone}</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">{partner.filmTitle}</label>
                      <input
                        type="text"
                        value={formData.filmTitle}
                        onChange={(e) => handleInputChange('filmTitle', e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">{partner.genre}</label>
                      <input
                        type="text"
                        value={formData.genre}
                        onChange={(e) => handleInputChange('genre', e.target.value)}
                        placeholder={partner.genrePlaceholder}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">{partner.budgetRange}</label>
                      <input
                        type="text"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        placeholder={partner.budgetPlaceholder}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">{partner.projectDescription} *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder={partner.projectDescriptionPlaceholder}
                      rows={4}
                      className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none resize-vertical"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">{partner.timeline}</label>
                    <input
                      type="text"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      placeholder={partner.timelinePlaceholder}
                      className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Mensagens de feedback */}
                  {submitMessage && (
                    <div className="bg-green-900/30 border border-green-500/20 text-green-400 p-4 rounded-md">
                      {submitMessage}
                    </div>
                  )}
                  
                  {submitError && (
                    <div className="bg-red-900/30 border border-red-500/20 text-red-400 p-4 rounded-md">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>{partner.sendInquiry}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-red-900/40 via-pink-900/40 to-purple-900/40">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">{partner.readyToChangeWorld}</h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8">
            {partner.readyToChangeWorldText}
          </p>
          <div className="flex justify-center space-x-4">
            <span className="text-4xl">🎬</span>
            <span className="text-4xl">🌈</span>
            <span className="text-4xl">❤️</span>
            <span className="text-4xl">✨</span>
          </div>
        </div>
      </section>
    </div>
  )
}