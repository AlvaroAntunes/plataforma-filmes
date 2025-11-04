"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/hooks/useTranslation"
import { initializeAuth, getCurrentUser } from "@/lib/auth"
import { getMovies, getUserPurchasedFilms, purchaseFilm } from "@/lib/movies"
import type { Film } from "@/lib/types"
import ModernHeroSection from "@/components/modern-hero-section"
import ModernHomeContent from "@/components/modern-home-content"
import FilmModal from "@/components/film-modal"
import PaymentModal from "@/components/payment-modal"
import AddFilmModal from "@/components/add-film-modal"

export default function Home() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isAddFilmModalOpen, setIsAddFilmModalOpen] = useState(false)
  const [heroFilm, setHeroFilm] = useState<Film | null>(null)
  const [purchasedFilmIds, setPurchasedFilmIds] = useState<string[]>([])
  const [userId, setUserId] = useState('')
  const [films, setFilms] = useState<Film[]>([])
  const router = useRouter()

  useEffect(() => {
    const initApp = async () => {
      try {
        // Check authentication (optional for this page)
        const user = await initializeAuth()
        
        if (user) {
          setUserId(user.id)
          // Load films and user purchases if logged in
          await loadFilmsData(user.id)
        } else {
          // Load only films data if not logged in
          const allFilms = await getMovies()
          // Filter only films that are marked as launches
          const launchFilms = allFilms.filter(film => film.launch === true)
          setFilms(launchFilms)
          
          if (launchFilms.length > 0) {
            // First try to find films marked as main
            const mainFilms = launchFilms.filter(film => film.main === true)
            
            if (mainFilms.length > 0) {
              // Sort by creation date - most recent first
              const sortedMainFilms = mainFilms.sort((a, b) => {
                if (a.created_at && b.created_at) {
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                }
                return parseInt(b.id) - parseInt(a.id)
              })
              setHeroFilm(sortedMainFilms[0])
            } else {
              // No main films, pick random
              const randomIndex = Math.floor(Math.random() * launchFilms.length)
              setHeroFilm(launchFilms[randomIndex])
            }
          }
        }
      } catch (error) {
        // Still load films even if auth fails
        try {
          const allFilms = await getMovies()
          // Filter only films that are marked as launches
          const launchFilms = allFilms.filter(film => film.launch === true)
          setFilms(launchFilms)
          
          if (launchFilms.length > 0) {
            // First try to find films marked as main
            const mainFilms = launchFilms.filter(film => film.main === true)
            
            if (mainFilms.length > 0) {
              // Sort by creation date - most recent first
              const sortedMainFilms = mainFilms.sort((a, b) => {
                if (a.created_at && b.created_at) {
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                }
                return parseInt(b.id) - parseInt(a.id)
              })
              setHeroFilm(sortedMainFilms[0])
            } else {
              // No main films, pick random
              const randomIndex = Math.floor(Math.random() * launchFilms.length)
              setHeroFilm(launchFilms[randomIndex])
            }
          }
        } catch (filmError) {
          console.error('Error loading films:', filmError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initApp()
  }, [router])

  const loadFilmsData = async (userId: string) => {
    const [allFilms, purchases] = await Promise.all([
      getMovies(),
      getUserPurchasedFilms(userId)
    ])

    // Filter only films that are marked as launches
    const launchFilms = allFilms.filter(film => film.launch === true)
    
    setFilms(launchFilms)
    setPurchasedFilmIds(purchases)

    if (launchFilms.length > 0) {
      // First try to find films marked as main that haven't been purchased
      const mainFilms = launchFilms.filter(
        film => film.main === true && !purchases.includes(film.id) // ✅ Filtrar filmes NÃO comprados
      )
      
      if (mainFilms.length > 0) {
        // Sort by creation date (assuming created_at field exists) - most recent first
        // If no created_at, sort by id as fallback (higher id = newer)
        const sortedMainFilms = mainFilms.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }
          // Fallback: use id comparison (assuming higher id = newer)
          return parseInt(b.id) - parseInt(a.id)
        })
        setHeroFilm(sortedMainFilms[0]) // Most recent main film that hasn't been purchased
      } else {
        // No unpurchased main films, try to find any unpurchased launch film
        const unpurchasedLaunchFilms = launchFilms.filter(film => !purchases.includes(film.id))
        
        if (unpurchasedLaunchFilms.length > 0) {
          // Pick random from unpurchased films
          const randomIndex = Math.floor(Math.random() * unpurchasedLaunchFilms.length)
          setHeroFilm(unpurchasedLaunchFilms[randomIndex])
        } else {
          // All launch films are purchased - this is an edge case
          // You could either show no hero film or show a purchased one
          // For now, let's show the most recent main film even if purchased
          const allMainFilms = launchFilms.filter(film => film.main === true)
          if (allMainFilms.length > 0) {
            const sortedMainFilms = allMainFilms.sort((a, b) => {
              if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              }
              return parseInt(b.id) - parseInt(a.id)
            })
            setHeroFilm(sortedMainFilms[0])
          } else {
            // No main films at all, pick random
            const randomIndex = Math.floor(Math.random() * launchFilms.length)
            setHeroFilm(launchFilms[randomIndex])
          }
        }
      }
    }
  }

  const handleFilmClick = (film: Film) => {
    setSelectedFilm(film)
    setIsModalOpen(true)
  }

  const handleHeroPlay = () => {
    if (!heroFilm) return
    
    setSelectedFilm(heroFilm)
    setIsModalOpen(true)
  }

  const handleAdminClick = () => {
    // Open add film modal when admin button is clicked
    setIsAddFilmModalOpen(true)
  }

  const handlePurchaseClick = (filmId: string) => {
    const user = getCurrentUser()
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push('/login')
      return
    }
    
    // Close film modal and open payment modal
    setIsModalOpen(false)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = async (filmId: string) => {
    const user = getCurrentUser()
    if (!user) return

    try {
      const success = await purchaseFilm(user.id, filmId)
      if (success) {
        const newPurchasedFilmIds = [...purchasedFilmIds, filmId]
        setPurchasedFilmIds(newPurchasedFilmIds)
        setIsPaymentModalOpen(false)
        
        // If the purchased film is the current hero film, find a new one
        if (heroFilm && heroFilm.id === filmId) {
          const unpurchasedMainFilms = films.filter(
            film => film.main === true && !newPurchasedFilmIds.includes(film.id)
          )
          
          if (unpurchasedMainFilms.length > 0) {
            // Sort by creation date - most recent first
            const sortedMainFilms = unpurchasedMainFilms.sort((a, b) => {
              if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              }
              return parseInt(b.id) - parseInt(a.id)
            })
            setHeroFilm(sortedMainFilms[0])
          } else {
            // No unpurchased main films, try any unpurchased launch film
            const unpurchasedLaunchFilms = films.filter(film => !newPurchasedFilmIds.includes(film.id))
            
            if (unpurchasedLaunchFilms.length > 0) {
              const randomIndex = Math.floor(Math.random() * unpurchasedLaunchFilms.length)
              setHeroFilm(unpurchasedLaunchFilms[randomIndex])
            } else {
              // All films are purchased - keep the current hero film or set to null
              // This is an edge case where user bought all available films
              setHeroFilm(null)
            }
          }
        }
      }
    } catch (error) {
      // console.error('Error purchasing film:', error)
    }
  }

  const handleFilmAdded = async () => {
    // Reload films data after a new film is added
    try {
      const user = getCurrentUser()
      if (user) {
        await loadFilmsData(user.id)
      } else {
        // If not logged in, still reload launch films
        const allFilms = await getMovies()
        const launchFilms = allFilms.filter(film => film.launch === true)
        setFilms(launchFilms)
        
        if (launchFilms.length > 0) {
          // First try to find films marked as main
          const mainFilms = launchFilms.filter(film => film.main === true)
          
          if (mainFilms.length > 0) {
            // Sort by creation date - most recent first
            const sortedMainFilms = mainFilms.sort((a, b) => {
              if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              }
              return parseInt(b.id) - parseInt(a.id)
            })
            setHeroFilm(sortedMainFilms[0])
          } else {
            // No main films, pick random
            const randomIndex = Math.floor(Math.random() * launchFilms.length)
            setHeroFilm(launchFilms[randomIndex])
          }
        }
      }
    } catch (error) {
      // console.error('Error reloading films data:', error)
    }
  }

  const handlePlay = (film: Film) => {
    // This would typically open a video player
    console.log("Playing film:", film.title)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center overflow-hidden">
        <div className="relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 w-96 h-96">
            <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-20 right-0 w-24 h-24 bg-purple-500/30 rounded-full blur-lg animate-bounce"></div>
            <div className="absolute bottom-0 left-20 w-28 h-28 bg-red-500/30 rounded-full blur-xl animate-pulse delay-300"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-white text-2xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              EROS UNLIMITED
            </h2>
            <p className="text-gray-300 animate-pulse">{t('common.loadExperience')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!heroFilm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Nenhum Lançamento Disponível</h2>
          <p className="text-gray-400">Não há filmes marcados como lançamentos no momento</p>
        </div>
      </div>
    )
  }

  // Check if selected film is purchased
  const isSelectedFilmPurchased = selectedFilm ? purchasedFilmIds.includes(selectedFilm.id) : false

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20 relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Animated particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-pink-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <ModernHeroSection 
          film={heroFilm} 
          onPlayClick={handleHeroPlay}
          onAdminClick={handleAdminClick}
        />
        
        <ModernHomeContent 
          films={films}
          onFilmClick={handleFilmClick}
          purchasedFilmIds={purchasedFilmIds}
          customTitle={t('movies.releasesCatalog')}
          customDescription={t('movies.releasesCatalogDescription')}
          customSectionTitle={purchasedFilmIds.length === 0 ? t('movies.releasesSection') : t('movies.releasesDisponiveis')}
        />
      </div>

      {/* Film Details Modal */}
      <FilmModal
        film={selectedFilm}
        isOpen={isModalOpen}
        isPurchased={isSelectedFilmPurchased}
        onClose={() => setIsModalOpen(false)}
        onPurchase={handlePurchaseClick}
        onPlay={handlePlay}
      />

      {/* Payment Modal */}
      <PaymentModal
        film={selectedFilm}
        isOpen={isPaymentModalOpen}
        userId={userId}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Add Film Modal (Admin Only) */}
      <AddFilmModal
        isOpen={isAddFilmModalOpen}
        onClose={() => setIsAddFilmModalOpen(false)}
        onFilmAdded={handleFilmAdded}
      />
    </div>
  )
}