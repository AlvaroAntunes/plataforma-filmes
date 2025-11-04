"use client"

import { useState, useEffect } from "react"
import type { Film } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { getMovies, getUserPurchasedFilms } from "@/lib/movies"
import FilmRow from "./film-row"

interface HomeContentProps {
  onFilmClick: (film: Film) => void
  purchasedFilmIds: string[]
}

export default function HomeContent({ onFilmClick, purchasedFilmIds }: HomeContentProps) {
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFilms = async () => {
      try {
        const moviesData = await getMovies()
        setFilms(moviesData)
      } catch (error) {
        console.error('Error loading films:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFilms()
  }, [])

  if (loading) {
    return (
      <div className="bg-black min-h-screen pt-8 pb-16 flex items-center justify-center">
        <div className="text-white text-xl">Carregando filmes...</div>
      </div>
    )
  }

  const availableFilms = films.filter((film) => !purchasedFilmIds.includes(film.id))
  const purchasedFilms = films.filter((film) => purchasedFilmIds.includes(film.id))

  return (
    <div className="bg-black min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {purchasedFilms.length > 0 && (
          <FilmRow
            title="Meus Filmes"
            films={purchasedFilms}
            purchasedFilmIds={purchasedFilmIds}
            onFilmClick={onFilmClick}
          />
        )}

        <FilmRow
          title="Filmes Disponíveis"
          films={availableFilms}
          purchasedFilmIds={purchasedFilmIds}
          onFilmClick={onFilmClick}
        />

        {films.length > 3 && (
          <FilmRow
            title="Recomendados para Você"
            films={films.slice(0, 3)}
            purchasedFilmIds={purchasedFilmIds}
            onFilmClick={onFilmClick}
          />
        )}
      </div>
    </div>
  )
}