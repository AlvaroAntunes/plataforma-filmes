// lib/translation-sync.ts
// Sistema para sincronizar traduções com filmes do Supabase

import { supabase } from './supabase'
import type { Film } from './types'

// Interface para estrutura de tradução
interface TranslationStructure {
  filmTitles: Record<string, string>
  filmSynopsis: Record<string, string> 
  filmGenres: Record<string, string>
}

// Função para obter filmes que não possuem traduções
export const getMissingTranslations = async (locale: string = 'pt-BR'): Promise<Film[]> => {
  try {
    // Buscar todos os filmes do Supabase
    const { data: films, error } = await supabase
      .from('films')
      .select('*')

    if (error) {
      console.error('Erro ao buscar filmes para verificação de traduções:', error)
      return []
    }

    if (!films) return []

    // Carregar arquivo de traduções atual
    const translationsPath = `/messages/${locale}.json`
    
    // Por enquanto, retornamos todos os filmes pois não temos como verificar
    // dinamicamente o arquivo de traduções no client-side
    return films.map(film => ({
      id: film.id,
      title: film.title,
      title_pt: film.title_pt || film.title,
      title_es: film.title_es || film.title,
      title_zh: film.title_zh || film.title,
      synopsis: film.synopsis,
      synopsis_pt: film.synopsis_pt || film.synopsis || '',
      synopsis_es: film.synopsis_es || film.synopsis || '',
      synopsis_zh: film.synopsis_zh || film.synopsis || '',
      description: film.description || film.synopsis,
      genre: film.genre,
      duration: film.duration,
      releaseYear: film.release_year,
      rating: film.rating,
      price: film.price,
      posterUrl: film.poster_url,
      img_1: film.img_1 || '',
      img_2: film.img_2 || '',
      img_3: film.img_3 || '',
      trailerUrl: film.trailer_url,
      videoUrl: film.movie_url,
      launch: film.launch || false,
      main: film.main || false,
      created_at: film.created_at
    }))
  } catch (error) {
    console.error('Erro em getMissingTranslations:', error)
    return []
  }
}

// Função para gerar estrutura de tradução para filmes
export const generateTranslationTemplate = (films: Film[], targetLocale: string = 'pt-BR'): TranslationStructure => {
  const template: TranslationStructure = {
    filmTitles: {},
    filmSynopsis: {},
    filmGenres: {}
  }

  films.forEach(film => {
    // Para novos filmes, usar o conteúdo original como base
    template.filmTitles[film.id] = film.title
    template.filmSynopsis[film.id] = film.synopsis
    template.filmGenres[film.id] = film.genre
  })

  return template
}

// Função utilitária para log de filmes sem tradução
export const logMissingTranslations = (films: Film[], locale: string) => {
  if (films.length === 0) {
    console.log(`✅ Todos os filmes têm traduções para ${locale}`)
    return
  }

  console.log(`⚠️  ${films.length} filme(s) sem tradução para ${locale}:`)
  films.forEach(film => {
    console.log(`  - ID: ${film.id}, Título: "${film.title}"`)
  })
  
  console.log(`\n📝 Para adicionar traduções, edite o arquivo /messages/${locale}.json`)
  console.log(`   Adicione as chaves: filmTitles.${films[0]?.id}, filmSynopsis.${films[0]?.id}, filmGenres.${films[0]?.id}`)
}

// Função para detectar mudanças no catálogo
export const detectCatalogChanges = async (): Promise<{
  newFilms: Film[]
  totalFilms: number
}> => {
  try {
    const { data: films, error } = await supabase
      .from('films')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !films) {
      return { newFilms: [], totalFilms: 0 }
    }

    // Por simplicidade, consideramos os 5 mais recentes como "novos"
    const recentFilms = films.slice(0, 5).map(film => ({
      id: film.id,
      title: film.title,
      title_pt: film.title_pt || film.title,
      title_es: film.title_es || film.title,
      title_zh: film.title_zh || film.title,
      synopsis: film.synopsis,
      synopsis_pt: film.synopsis_pt || film.synopsis || '',
      synopsis_es: film.synopsis_es || film.synopsis || '',
      synopsis_zh: film.synopsis_zh || film.synopsis || '',
      description: film.description || film.synopsis,
      genre: film.genre,
      duration: film.duration,
      releaseYear: film.release_year,
      rating: film.rating,
      price: film.price,
      posterUrl: film.poster_url,
      img_1: film.img_1 || '',
      img_2: film.img_2 || '',
      img_3: film.img_3 || '',
      trailerUrl: film.trailer_url,
      videoUrl: film.movie_url,
      launch: film.launch || false,
      main: film.main || false,
      created_at: film.created_at
    }))

    return {
      newFilms: recentFilms,
      totalFilms: films.length
    }
  } catch (error) {
    console.error('Erro ao detectar mudanças no catálogo:', error)
    return { newFilms: [], totalFilms: 0 }
  }
}
