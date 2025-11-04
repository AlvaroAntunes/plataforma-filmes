// lib/movies.ts - Complete version with addFilm function
import { supabase } from './supabase'
import { logMissingTranslations } from './translation-sync'
import type { Film } from './types'

// Transform database film to app Film type
const transformDbFilmToFilm = (dbFilm: any): Film => ({
  id: dbFilm.id,
  title: dbFilm.title,
  title_pt: dbFilm.title_pt || dbFilm.title,
  title_es: dbFilm.title_es || dbFilm.title,
  title_zh: dbFilm.title_zh || dbFilm.title,
  synopsis: dbFilm.synopsis,
  synopsis_pt: dbFilm.synopsis_pt || dbFilm.synopsis || '',
  synopsis_es: dbFilm.synopsis_es || dbFilm.synopsis || '',
  synopsis_zh: dbFilm.synopsis_zh || dbFilm.synopsis || '',
  description: dbFilm.description || dbFilm.synopsis,
  genre: dbFilm.genre,
  duration: dbFilm.duration,
  releaseYear: dbFilm.release_year,
  rating: dbFilm.rating,
  price: dbFilm.price,
  launch: dbFilm.launch,
  main: dbFilm.main,
  posterUrl: dbFilm.poster_url,
  img_1: dbFilm.img_1 || '',
  img_2: dbFilm.img_2 || '',
  img_3: dbFilm.img_3 || '',
  trailerUrl: dbFilm.trailer_url,
  videoUrl: dbFilm.movie_url,
  created_at: dbFilm.created_at,
})

// Interface for new film data
export interface NewFilmData {
  title: string
  title_pt?: string
  title_es?: string
  title_zh?: string
  synopsis: string
  synopsis_pt?: string
  synopsis_es?: string
  synopsis_zh?: string
  genre: string
  duration: number
  releaseYear: number
  rating: number
  price: number
  launch: boolean
  main: boolean
  posterUrl?: string
  img_1?: string
  img_2?: string
  img_3?: string
  trailerUrl?: string
  videoUrl?: string
}

// Get all movies with translation detection
export const getMovies = async (): Promise<Film[]> => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    const films = data.map(transformDbFilmToFilm)
    return films
  } catch (error) {
    return []
  }
}

// Get a specific movie by ID
export const getMovieById = async (movieId: string): Promise<Film | null> => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', movieId)
      .single()

    if (error || !data) {
      return null
    }

    return transformDbFilmToFilm(data)
  } catch (error) {
    return null
  }
}

// Get user's purchased films
export const getUserPurchasedFilms = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('movie_id')
      .eq('user_id', userId)

    if (error) {
      return []
    }

    return data?.map(item => item.movie_id)
  } catch (error) {
    return []
  }
}

// Purchase a film
export const purchaseFilm = async (userId: string, filmId: string): Promise<boolean> => {
  try {
    // Check if already purchased
    const { data: existing, error: checkError } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', filmId)
      .single()

    if (existing) {
      return true // Already purchased
    }

    // Insert new purchase
    const { error: insertError } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        movie_id: filmId,
        purchase_date: new Date().toISOString(),
      })

    if (insertError) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}
// Enhanced version with better URL handling - replace in lib/movies.ts

export const addFilm = async (filmData: NewFilmData): Promise<Film | null> => {
  try {

    // Helper function to validate and clean URLs
    const cleanUrl = (url?: string): string | null => {
      if (!url || !url.trim()) {
        return null
      }
      
      const cleaned = url.trim()
      
      // Must start with http:// or https://
      if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        return null
      }
      
      // Basic URL validation
      try {
        new URL(cleaned)
        return cleaned
      } catch (error) {
        return null
      }
    }

    // Clean and validate URLs
    const poster_url = cleanUrl(filmData.posterUrl)
    const trailer_url = cleanUrl(filmData.trailerUrl)
    const movie_url = cleanUrl(filmData.videoUrl)

    // Prepare data for database
    const insertData = {
      title: filmData.title.trim(),
      title_pt: filmData.title_pt?.trim() || filmData.title.trim(),
      title_es: filmData.title_es?.trim() || filmData.title.trim(),
      title_zh: filmData.title_zh?.trim() || filmData.title.trim(),
      synopsis: filmData.synopsis.trim(),
      synopsis_pt: filmData.synopsis_pt?.trim() || filmData.synopsis.trim(),
      synopsis_es: filmData.synopsis_es?.trim() || filmData.synopsis.trim(),
      synopsis_zh: filmData.synopsis_zh?.trim() || filmData.synopsis.trim(),
      genre: filmData.genre,
      duration: filmData.duration,
      release_year: filmData.releaseYear,
      rating: filmData.rating,
      price: filmData.price,
      launch: filmData.launch,
      main: filmData.main,
      poster_url,
      img_1: filmData.img_1?.trim() || '',
      img_2: filmData.img_2?.trim() || '',
      img_3: filmData.img_3?.trim() || '',
      trailer_url,
      movie_url,
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('movies')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error('Database error: ' + error.message)
    }

    // Transform database response to app format
    const newFilm = transformDbFilmToFilm(data)
    return newFilm

  } catch (error) {
    throw error
  }
}

// Update an existing film (Admin only)
export const updateFilm = async (filmId: string, filmData: Partial<NewFilmData>): Promise<Film | null> => {
  try {
    // Prepare update data
    const updateData: any = {}
    if (filmData.title !== undefined) updateData.title = filmData.title
    if (filmData.title_pt !== undefined) updateData.title_pt = filmData.title_pt
    if (filmData.title_es !== undefined) updateData.title_es = filmData.title_es
    if (filmData.title_zh !== undefined) updateData.title_zh = filmData.title_zh
    if (filmData.synopsis !== undefined) updateData.synopsis = filmData.synopsis
    if (filmData.synopsis_pt !== undefined) updateData.synopsis_pt = filmData.synopsis_pt
    if (filmData.synopsis_es !== undefined) updateData.synopsis_es = filmData.synopsis_es
    if (filmData.synopsis_zh !== undefined) updateData.synopsis_zh = filmData.synopsis_zh
    if (filmData.genre !== undefined) updateData.genre = filmData.genre
    if (filmData.duration !== undefined) updateData.duration = filmData.duration
    if (filmData.releaseYear !== undefined) updateData.release_year = filmData.releaseYear
    if (filmData.rating !== undefined) updateData.rating = filmData.rating
    if (filmData.price !== undefined) updateData.price = filmData.price
    if (filmData.launch !== undefined) updateData.launch = filmData.launch
    if (filmData.main !== undefined) updateData.main = filmData.main
    if (filmData.posterUrl !== undefined) updateData.poster_url = filmData.posterUrl
    if (filmData.img_1 !== undefined) updateData.img_1 = filmData.img_1
    if (filmData.img_2 !== undefined) updateData.img_2 = filmData.img_2
    if (filmData.img_3 !== undefined) updateData.img_3 = filmData.img_3
    if (filmData.trailerUrl !== undefined) updateData.trailer_url = filmData.trailerUrl
    if (filmData.videoUrl !== undefined) updateData.movie_url = filmData.videoUrl

    // Update film
    const { data, error } = await supabase
      .from('movies')
      .update(updateData)
      .eq('id', filmId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update film: ' + error.message)
    }

    return transformDbFilmToFilm(data)
  } catch (error) {
    throw error
  }
}

// Delete a film (Admin only)
export const deleteFilm = async (filmId: string): Promise<boolean> => {
  try {
    // First, delete all purchases relationships
    const { error: relationError } = await supabase
      .from('purchases')
      .delete()
      .eq('movie_id', filmId)

    if (relationError) {
      // Continue anyway, as the film deletion is more important
    }

    // Delete the film
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', filmId)

    if (error) {
      throw new Error('Failed to delete film: ' + error.message)
    }

    return true
  } catch (error) {
    throw error
  }
}