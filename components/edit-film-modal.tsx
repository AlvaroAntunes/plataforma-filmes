"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Film as FilmIcon, Heart, Calendar, Clock, Star, DollarSign, Upload, Sparkles, Crown, Check, Trash2, Image as ImageIcon, Camera } from "lucide-react"
import { updateFilm, deleteFilm } from "@/lib/movies"
import type { Film } from "@/lib/types"

interface FilmFormData {
  title: string
  title_pt: string
  title_es: string
  title_zh: string
  synopsis: string
  synopsis_pt: string
  synopsis_es: string
  synopsis_zh: string
  genre: string
  duration: number | string
  releaseYear: number | string
  rating: number | string
  price: number | string
  launch: boolean
  main: boolean
  posterUrl: string
  img_1: string
  img_2: string
  img_3: string
  trailerUrl: string
  videoUrl: string
}

interface EditFilmModalProps {
  film: Film
  isOpen: boolean
  onClose: () => void
  onFilmUpdated: () => void
}

export default function EditFilmModal({ film, isOpen, onClose, onFilmUpdated }: EditFilmModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FilmFormData>({
    title: '',
    title_pt: '',
    title_es: '',
    title_zh: '',
    synopsis: '',
    synopsis_pt: '',
    synopsis_es: '',
    synopsis_zh: '',
    genre: '',
    duration: '',
    releaseYear: new Date().getFullYear(),
    rating: '',
    price: '',
    launch: false,
    main: false,
    posterUrl: '',
    img_1: '',
    img_2: '', 
    img_3: '',
    trailerUrl: '',
    videoUrl: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<Partial<FilmFormData>>({})

  // Populate form data when film changes
  useEffect(() => {
    if (film && isOpen) {
      // Extract Google Drive ID from poster URL if it exists
      let posterIdOnly = ''
      if (film.posterUrl) {
        const driveMatch = film.posterUrl.match(/id=([a-zA-Z0-9_-]+)/)
        posterIdOnly = driveMatch ? driveMatch[1] : film.posterUrl
      }

      // Extract Google Drive IDs from image URLs if they exist
      let img1IdOnly = ''
      if (film.img_1) {
        const driveMatch = film.img_1.match(/id=([a-zA-Z0-9_-]+)/)
        img1IdOnly = driveMatch ? driveMatch[1] : film.img_1
      }

      let img2IdOnly = ''
      if (film.img_2) {
        const driveMatch = film.img_2.match(/id=([a-zA-Z0-9_-]+)/)
        img2IdOnly = driveMatch ? driveMatch[1] : film.img_2
      }

      let img3IdOnly = ''
      if (film.img_3) {
        const driveMatch = film.img_3.match(/id=([a-zA-Z0-9_-]+)/)
        img3IdOnly = driveMatch ? driveMatch[1] : film.img_3
      }

      setFormData({
        title: film.title || '',
        title_pt: film.title_pt || '',
        title_es: film.title_es || '',
        title_zh: film.title_zh || '',
        synopsis: film.synopsis || '',
        synopsis_pt: film.synopsis_pt || '',
        synopsis_es: film.synopsis_es || '',
        synopsis_zh: film.synopsis_zh || '',
        genre: film.genre || '',
        duration: film.duration || '',
        releaseYear: film.releaseYear || new Date().getFullYear(),
        rating: film.rating || '',
        price: film.price || '',
        launch: film.launch || false,
        main: film.main || false,
        posterUrl: posterIdOnly,
        img_1: img1IdOnly,
        img_2: img2IdOnly,
        img_3: img3IdOnly,
        trailerUrl: film.trailerUrl || '',
        videoUrl: film.videoUrl || ''
      })
    }
  }, [film, isOpen])

  if (!isOpen) return null

  const genres = [
    'Ação', 'Aventura', 'Animação', 'Comédia', 'Crime', 'Drama', 
    'Fantasia', 'Ficção Científica', 'Horror', 'Mistério', 'Romance', 
    'Thriller', 'Guerra', 'Western', 'Musical', 'Documentário'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

  const handleInputChange = (field: keyof FilmFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FilmFormData> = {}

    // Required fields validation
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.title_pt.trim()) {
      newErrors.title_pt = 'Título em Português é obrigatório'
    }

    if (!formData.title_es.trim()) {
      newErrors.title_es = 'Título em Espanhol é obrigatório'
    }

    if (!formData.title_zh.trim()) {
      newErrors.title_zh = 'Título em Chinês é obrigatório'
    }

    if (!formData.synopsis.trim()) {
      newErrors.synopsis = 'Sinopse é obrigatória'
    }

    if (!formData.synopsis_pt.trim()) {
      newErrors.synopsis_pt = 'Sinopse em Português é obrigatória'
    }

    if (!formData.synopsis_es.trim()) {
      newErrors.synopsis_es = 'Sinopse em Espanhol é obrigatória'
    }

    if (!formData.synopsis_zh.trim()) {
      newErrors.synopsis_zh = 'Sinopse em Chinês é obrigatória'
    }

    if (!formData.genre) {
      newErrors.genre = 'Gênero é obrigatório'
    }

    // URLs are now required
    if (!formData.posterUrl.trim()) {
      newErrors.posterUrl = 'ID do Poster é obrigatória'
    }

    if (!formData.trailerUrl.trim()) {
      newErrors.trailerUrl = 'URL do Trailer é obrigatória'
    }

    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'URL do Filme Completo é obrigatória'
    }

    // Convert to numbers for validation
    const duration = Number(formData.duration)
    const releaseYear = Number(formData.releaseYear)
    const rating = Number(formData.rating)
    const price = Number(formData.price)

    // Duration validation (should be positive integer)
    if (isNaN(duration) || duration <= 0 || duration > 999) {
      newErrors.duration = 'Duração deve estar entre 1 e 999 minutos'
    }

    // Release year validation
    if (isNaN(releaseYear) || releaseYear < 1900 || releaseYear > currentYear) {
      newErrors.releaseYear = 'Ano de lançamento inválido'
    }

    // Rating validation - CRITICAL: limit to 9.9 due to database constraint NUMERIC(2,1)
    if (isNaN(rating) || rating < 0 || rating > 9.9) {
      newErrors.rating = 'Avaliação deve estar entre 0 e 9.9'
    }

    // Price validation - limit to reasonable values
    if (isNaN(price) || price < 0 || price > 9999.99) {
      newErrors.price = 'Preço deve estar entre 0 e 9999.99'
    }

    // URL validation (optional)
    const urlFields = ['trailerUrl', 'videoUrl'] as const
    urlFields.forEach(field => {
      const url = formData[field] as string
      if (url && url.trim()) {
        try {
          new URL(url.trim())
        } catch {
          newErrors[field] = 'URL inválida'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data with proper type conversion and limits
      const filmToUpdate = {
        title: formData.title.trim(),
        title_pt: formData.title_pt.trim(),
        title_es: formData.title_es.trim(),
        title_zh: formData.title_zh.trim(),
        synopsis: formData.synopsis.trim(),
        synopsis_pt: formData.synopsis_pt.trim(),
        synopsis_es: formData.synopsis_es.trim(),
        synopsis_zh: formData.synopsis_zh.trim(),
        genre: formData.genre,
        duration: Math.min(999, Math.max(1, Number(formData.duration))), // Clamp between 1-999
        releaseYear: Number(formData.releaseYear),
        rating: Math.min(9.9, Math.max(0, Number(formData.rating))), // Clamp between 0-9.9
        price: Math.min(9999.99, Math.max(0, Number(formData.price))), // Clamp price
        launch: formData.launch,
        main: formData.main,
        posterUrl: formData.posterUrl.trim() ? `https://drive.usercontent.google.com/download?id=${formData.posterUrl.trim()}` : undefined,
        img_1: formData.img_1.trim() ? `https://drive.usercontent.google.com/download?id=${formData.img_1.trim()}` : undefined,
        img_2: formData.img_2.trim() ? `https://drive.usercontent.google.com/download?id=${formData.img_2.trim()}` : undefined,
        img_3: formData.img_3.trim() ? `https://drive.usercontent.google.com/download?id=${formData.img_3.trim()}` : undefined,
        trailerUrl: formData.trailerUrl.trim() || undefined,
        videoUrl: formData.videoUrl.trim() || undefined,
      }

      const updatedFilm = await updateFilm(film.id, filmToUpdate)

      if (updatedFilm) {
        // Show success message
        setShowSuccessMessage(true)
        
        // Scroll to top of the modal to show the success overlay
        setTimeout(() => {
          const modalElement = document.querySelector('.modal-container')
          if (modalElement) {
            modalElement.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }, 100)
        
        // Clear errors
        setErrors({})

        // Notify parent component
        onFilmUpdated()

        // Wait 2 seconds then close modal
        setTimeout(() => {
          setShowSuccessMessage(false)
          onClose()
        }, 2000)
      } else {
        setErrors({
          title: 'Erro inesperado ao atualizar filme'
        })
      }
    } catch (error: any) {
      // Show error to user
      setErrors({
        title: error.message || 'Erro ao atualizar filme. Tente novamente.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting && !showSuccessMessage && !isDeleting) {
      onClose()
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const success = await deleteFilm(film.id)
      
      if (success) {
        // Notify parent component to reload films
        onFilmUpdated()
        
        // Close modal after successful deletion
        onClose()
      } else {
        setErrors({
          title: 'Erro inesperado ao deletar filme'
        })
      }
    } catch (error: any) {
      setErrors({
        title: error.message || 'Erro ao deletar filme. Tente novamente.'
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleShowDeleteConfirm = () => {
    setShowDeleteConfirm(true)
    // Scroll to top of the modal to show the confirmation overlay
    setTimeout(() => {
      const modalElement = document.querySelector('.modal-container')
      if (modalElement) {
        modalElement.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4">
      <div className="modal-container bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl rounded-2xl w-full max-w-md sm:max-w-5xl max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl relative flex flex-col">
        
        {/* Success Message Overlay */}
        {showSuccessMessage && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 rounded-2xl border border-green-400/30 shadow-2xl transform animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Filme Atualizado!</h3>
                  <p className="text-white/80">As alterações foram salvas com sucesso.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-500 p-8 rounded-2xl border border-red-400/30 shadow-2xl max-w-md mx-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Confirmar Exclusão</h3>
                  <p className="text-white/80">Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              <p className="text-white mb-6">
                Tem certeza que deseja deletar o filme <strong>"{film.title}"</strong>? 
                Todas as informações e compras relacionadas serão removidas.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      <span>Deletando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Sim, Deletar</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(20)].map((_, i) => (
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
              {i % 6 === 0 ? (
                <Star className="w-3 h-3 text-yellow-400/30" />
              ) : i % 6 === 1 ? (
                <Heart className="w-3 h-3 text-pink-400/30" />
              ) : i % 6 === 2 ? (
                <Sparkles className="w-2 h-2 text-cyan-400/30" />
              ) : i % 6 === 3 ? (
                <FilmIcon className="w-3 h-3 text-purple-400/30" />
              ) : i % 6 === 4 ? (
                <Crown className="w-2 h-2 text-orange-400/30" />
              ) : (
                <div className="w-1 h-1 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 opacity-30" />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-4 sm:p-8 border-b border-white/20 gap-4 sm:gap-0">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <FilmIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white text-2xl sm:text-3xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Editar Filme
                </span>
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm">Modificar informações do filme: {film.title}</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={handleClose}
            disabled={isSubmitting || showSuccessMessage || isDeleting || showDeleteConfirm}
            className="block sm:hidden absolute top-2 right-2 text-gray-400 hover:text-white p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
            style={{ position: 'absolute' }}
          >
            <X className="w-5 h-5" />
          </button>
          {/* Desktop close button */}
          <button
            onClick={handleClose}
            disabled={isSubmitting || showSuccessMessage || isDeleting || showDeleteConfirm}
            className="hidden sm:block text-gray-400 hover:text-white p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 p-2 sm:p-8 space-y-4 sm:space-y-8">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-6 rounded-xl border border-white/20">
            <h3 className="text-white font-bold text-xl mb-6 flex items-center">
              <Sparkles className="w-5 h-5 mr-3 text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Informações Básicas
              </span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
              {/* Title em inglês */}
              <div className="md:col-span-2">
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <FilmIcon className="w-4 h-4 mr-2 text-purple-400" />
                  Título em inglês *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Miss Brian's Carnival Curse"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.title ? 'border-red-500' : 'border-white/20'
                  } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Title em português */}
              <div className="md:col-span-2">
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <FilmIcon className="w-4 h-4 mr-2 text-purple-400" />
                  Título em português *
                </label>
                <input
                  type="text"
                  value={formData.title_pt}
                  onChange={(e) => handleInputChange('title_pt', e.target.value)}
                  placeholder="Ex: A Maldição do Carnaval de Miss Brian"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.title_pt ? 'border-red-500' : 'border-white/20'
                  } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.title_pt && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.title_pt}
                  </p>
                )}
              </div>

              {/* Title em espanhol */}
              <div className="md:col-span-2">
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <FilmIcon className="w-4 h-4 mr-2 text-purple-400" />
                  Título em espanhol *
                </label>
                <input
                  type="text"
                  value={formData.title_es}
                  onChange={(e) => handleInputChange('title_es', e.target.value)}
                  placeholder="Ex: La Maldición del Carnaval de Miss Brian"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.title_es ? 'border-red-500' : 'border-white/20'
                  } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.title_es && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.title_es}
                  </p>
                )}
              </div>

              {/* Title em mandarim */}
              <div className="md:col-span-2">
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <FilmIcon className="w-4 h-4 mr-2 text-purple-400" />
                  Título em mandarim *
                </label>
                <input
                  type="text"
                  value={formData.title_zh}
                  onChange={(e) => handleInputChange('title_zh', e.target.value)}
                  placeholder="Ex: 布莱恩小姐的狂欢节诅咒"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.title_zh ? 'border-red-500' : 'border-white/20'
                  } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.title_zh && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.title_zh}
                  </p>
                )}
              </div>

              {/* Genre */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-400" />
                  Gênero *
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.genre ? 'border-red-500' : 'border-white/20'
                  } focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                >
                  <option value="">Selecione um gênero</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre} className="bg-gray-800">
                      {genre}
                    </option>
                  ))}
                </select>
                {errors.genre && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.genre}
                  </p>
                )}
              </div>

              {/* Release Year */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                  Ano de Lançamento *
                </label>
                <select
                  value={formData.releaseYear}
                  onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value))}
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.releaseYear ? 'border-red-500' : 'border-white/20'
                  } focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                >
                  {years.map((year) => (
                    <option key={year} value={year} className="bg-gray-800">
                      {year}
                    </option>
                  ))}
                </select>
                {errors.releaseYear && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.releaseYear}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-green-400" />
                  Duração (minutos) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="Ex: 132"
                  min="1"
                  max="999"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.duration ? 'border-red-500' : 'border-white/20'
                  } focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.duration && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.duration}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-400" />
                  Avaliação *
                </label>
                <input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  placeholder="Ex: 8.7"
                  min="0"
                  max="9.9"
                  step="0.1"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.rating ? 'border-red-500' : 'border-white/20'
                  } focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.rating && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.rating}
                  </p>
                )}
                <p className="text-gray-400 text-xs mt-2 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  ⚠️ Máximo 9.9 devido às limitações atuais do banco de dados
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-emerald-400" />
                  Preço (USD) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Ex: 24.99"
                  min="0"
                  max="9999.99"
                  step="0.01"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.price ? 'border-red-500' : 'border-white/20'
                  } focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.price && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Launch */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
                  É um lançamento? *
                </label>
                <select
                  value={formData.launch ? 'sim' : 'nao'}
                  onChange={(e) => handleInputChange('launch', e.target.value === 'sim')}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                  disabled={isSubmitting || showSuccessMessage}
                >
                  <option value="nao" className="bg-gray-800 text-white">Não</option>
                  <option value="sim" className="bg-gray-800 text-white">Sim</option>
                </select>
                <p className="text-gray-400 text-xs mt-2 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Filmes marcados como lançamento aparecerão também em uma página dedicada a lançamentos.
                </p>
              </div>

              {/* Main */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Crown className="w-4 h-4 mr-2 text-orange-400" />
                  Esse filme é o principal? *
                </label>
                <select
                  value={formData.main ? 'sim' : 'nao'}
                  onChange={(e) => handleInputChange('main', e.target.value === 'sim')}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300"
                  disabled={isSubmitting || showSuccessMessage}
                >
                  <option value="nao" className="bg-gray-800 text-white">Não</option>
                  <option value="sim" className="bg-gray-800 text-white">Sim</option>
                </select>
                <p className="text-gray-400 text-xs mt-2 flex items-center">
                  <Crown className="w-3 h-3 mr-1" />
                  Filmes marcados como principais aparecerão no filme em destaque
                </p>
              </div>

              {/* Synopsis em inglês */}
              <div className="md:col-span-2">
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-400" />
                  Sinopse em inglês *
                </label>
                <textarea
                  value={formData.synopsis}
                  onChange={(e) => handleInputChange('synopsis', e.target.value)}
                  placeholder="Tell the story of this incredible film..."
                  rows={4}
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.synopsis ? 'border-red-500' : 'border-white/20'
                  } focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 resize-vertical`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.synopsis && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.synopsis}
                  </p>
                )}
              </div>

              {/* Synopsis em português */}
              <div className="md:col-span-2">
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-400" />
                  Sinopse em português *
                </label>
                <textarea
                  value={formData.synopsis_pt}
                  onChange={(e) => handleInputChange('synopsis_pt', e.target.value)}
                  placeholder="Conte a história deste filme incrível..."
                  rows={4}
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.synopsis_pt ? 'border-red-500' : 'border-white/20'
                  } focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 resize-vertical`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.synopsis_pt && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.synopsis_pt}
                  </p>
                )}
              </div>

              {/* Synopsis em espanhol */}
              <div className="md:col-span-2">
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-400" />
                  Sinopse em espanhol *
                </label>
                <textarea
                  value={formData.synopsis_es}
                  onChange={(e) => handleInputChange('synopsis_es', e.target.value)}
                  placeholder="Cuente la historia de esta increíble película..."
                  rows={4}
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.synopsis_es ? 'border-red-500' : 'border-white/20'
                  } focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 resize-vertical`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.synopsis_es && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.synopsis_es}
                  </p>
                )}
              </div>

              {/* Synopsis em mandarim */}
              <div className="md:col-span-2">
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-400" />
                  Sinopse em mandarim *
                </label>
                <textarea
                  value={formData.synopsis_zh}
                  onChange={(e) => handleInputChange('synopsis_zh', e.target.value)}
                  placeholder="讲述这部精彩电影的故事..."
                  rows={4}
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.synopsis_zh ? 'border-red-500' : 'border-white/20'
                  } focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 resize-vertical`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.synopsis_zh && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.synopsis_zh}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-6 rounded-xl border border-white/20">
            <h3 className="text-white font-bold text-xl mb-6 flex items-center">
              <Upload className="w-5 h-5 mr-3 text-cyan-400" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                URLs de Mídia (Obrigatórias)
              </span>
            </h3>
            
            <div className="space-y-2 sm:space-y-6">
              {/* Poster e Imagem 1 na mesma linha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                {/* Poster URL */}
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                    <Upload className="w-4 h-4 mr-2 text-purple-400" />
                    ID do Poster *
                  </label>
                  <input
                    type="text"
                    value={formData.posterUrl}
                    onChange={(e) => handleInputChange('posterUrl', e.target.value)}
                    placeholder="1TNfgCz6IrRTPZdZfoUOx1dNLBXqyXiXj"
                    className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                      errors.posterUrl ? 'border-red-500' : 'border-white/20'
                    } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                    disabled={isSubmitting || showSuccessMessage}
                  />
                  {errors.posterUrl && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <X className="w-3 h-3 mr-1" />
                      {errors.posterUrl}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    💡 Cole apenas o ID do arquivo do Google Drive (a parte após "/d/" na URL)
                  </p>
                </div>

                {/* Imagem 1 */}
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2 text-purple-400" />
                    ID da imagem 1
                  </label>
                  <input
                    type="text"
                    value={formData.img_1}
                    onChange={(e) => handleInputChange('img_1', e.target.value)}
                    placeholder="1TNfgCz6IrRTPZdZfoUOx1dNLBXqyXiXj"
                    className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                      errors.img_1 ? 'border-red-500' : 'border-white/20'
                    } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                    disabled={isSubmitting || showSuccessMessage}
                  />
                  {errors.img_1 && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <X className="w-3 h-3 mr-1" />
                      {errors.img_1}
                    </p>
                  )}
                </div>
              </div>

              {/* Imagem 2 e Imagem 3 na mesma linha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                {/* Imagem 2 */}
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2 text-purple-400" />
                    ID da imagem 2
                  </label>
                  <input
                    type="text"
                    value={formData.img_2}
                    onChange={(e) => handleInputChange('img_2', e.target.value)}
                    placeholder="1TNfgCz6IrRTPZdZfoUOx1dNLBXqyXiXj"
                    className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                      errors.img_2 ? 'border-red-500' : 'border-white/20'
                    } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                    disabled={isSubmitting || showSuccessMessage}
                  />
                  {errors.img_2 && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <X className="w-3 h-3 mr-1" />
                      {errors.img_2}
                    </p>
                  )}
                </div>

                {/* Imagem 3 */}
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2 text-purple-400" />
                    ID da imagem 3
                  </label>
                  <input
                    type="text"
                    value={formData.img_3}
                    onChange={(e) => handleInputChange('img_3', e.target.value)}
                    placeholder="1TNfgCz6IrRTPZdZfoUOx1dNLBXqyXiXj"
                    className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                      errors.img_3 ? 'border-red-500' : 'border-white/20'
                    } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                    disabled={isSubmitting || showSuccessMessage}
                  />
                  {errors.img_3 && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <X className="w-3 h-3 mr-1" />
                      {errors.img_3}
                    </p>
                  )}
                </div>
              </div>

              {/* Trailer URL */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Upload className="w-4 h-4 mr-2 text-orange-400" />
                  URL do Trailer *
                </label>
                <input
                  type="url"
                  value={formData.trailerUrl}
                  onChange={(e) => handleInputChange('trailerUrl', e.target.value)}
                  placeholder="https://example.com/trailer.mp4"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.trailerUrl ? 'border-red-500' : 'border-white/20'
                  } focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.trailerUrl && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.trailerUrl}
                  </p>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Upload className="w-4 h-4 mr-2 text-green-400" />
                  URL do Filme Completo *
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="https://example.com/movie.mp4"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.videoUrl ? 'border-red-500' : 'border-white/20'
                  } focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.videoUrl && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-3 h-3 mr-1" />
                    {errors.videoUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 pt-6 border-t border-white/20">
            {/* Main Actions - First on mobile, right side on desktop */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 order-1 sm:order-2">
              <button
                type="submit"
                disabled={isSubmitting || showSuccessMessage || isDeleting || showDeleteConfirm}
                className="px-4 py-2 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold text-base sm:text-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2 sm:space-x-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : showSuccessMessage ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Atualizado!</span>
                  </>
                ) : (
                  <>
                    <FilmIcon className="w-5 h-5" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || showSuccessMessage || isDeleting || showDeleteConfirm}
                className="px-4 py-2 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                Cancelar
              </button>
            </div>

            {/* Delete Button - Last on mobile, left side on desktop */}
            <button
              type="button"
              onClick={handleShowDeleteConfirm}
              disabled={isSubmitting || showSuccessMessage || isDeleting || showDeleteConfirm}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-red-500/25 flex items-center justify-center space-x-2 order-2 sm:order-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Deletar Filme</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="relative z-10 p-2 sm:p-6 border-t border-white/20">
          <div className="text-center">
            <div className="flex justify-center space-x-1 mb-3">
              {['🎬', '✨', '📝', '🎭', '🌟'].map((emoji, i) => (
                <span key={i} className="text-xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                  {emoji}
                </span>
              ))}
            </div>
            <p className="text-gray-300 text-sm">
              ✏️ Editando conteúdo com cuidado e precisão ✏️
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
