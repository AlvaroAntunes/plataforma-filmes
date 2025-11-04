import { NextResponse } from "next/server";

export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  region: string;
}

// Cache em memória para evitar chamadas desnecessárias
let countriesCache: Country[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Países prioritários (mais usados)
const PRIORITY_COUNTRIES = ['BR', 'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'PT', 'MX', 'AR'];

async function fetchCountriesFromAPI(): Promise<Country[]> {
  try {
    const response = await fetch(
      'https://restcountries.com/v3.1/all?fields=name,cca2,currencies,flag,region',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Eros-Unlimited-Site/1.0'
        },
        next: { revalidate: 86400 } // Cache por 24 horas
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    const countries: Country[] = data
      .filter((country: any) => 
        country.cca2 && 
        country.name?.common && 
        country.currencies &&
        Object.keys(country.currencies).length > 0
      )
      .map((country: any) => {
        const currencyCode = Object.keys(country.currencies)[0];
        const currencyData = country.currencies[currencyCode];
        
        return {
          code: country.cca2,
          name: country.name.common,
          currency: currencyCode,
          currencySymbol: currencyData?.symbol || currencyCode,
          flag: country.flag || '',
          region: country.region || 'Unknown'
        } as Country;
      })
      .sort((a: Country, b: Country) => {
        // Ordem alfabética pura pelo nome do país
        return a.name.localeCompare(b.name, 'pt-BR', { 
          sensitivity: 'base',
          numeric: true 
        });
      });

    return countries;

  } catch (error) {
    console.error('Erro ao buscar países da API:', error);
    
    // Fallback: lista estática dos países principais (em ordem alfabética)
    return [
      { code: 'AR', name: 'Argentina', currency: 'ARS', currencySymbol: '$', flag: '�🇷', region: 'Americas' },
      { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$', flag: '��', region: 'Oceania' },
      { code: 'BR', name: 'Brasil', currency: 'BRL', currencySymbol: 'R$', flag: '��', region: 'Americas' },
      { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'C$', flag: '��', region: 'Americas' },
      { code: 'ES', name: 'Spain', currency: 'EUR', currencySymbol: '€', flag: '��', region: 'Europe' },
      { code: 'FR', name: 'France', currency: 'EUR', currencySymbol: '€', flag: '��', region: 'Europe' },
      { code: 'DE', name: 'Germany', currency: 'EUR', currencySymbol: '€', flag: '��', region: 'Europe' },
      { code: 'IT', name: 'Italy', currency: 'EUR', currencySymbol: '€', flag: '🇮🇹', region: 'Europe' },
      { code: 'MX', name: 'Mexico', currency: 'MXN', currencySymbol: '$', flag: '��', region: 'Americas' },
      { code: 'NL', name: 'Netherlands', currency: 'EUR', currencySymbol: '€', flag: '🇳🇱', region: 'Europe' },
      { code: 'PT', name: 'Portugal', currency: 'EUR', currencySymbol: '€', flag: '🇵🇹', region: 'Europe' },
      { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', flag: '��', region: 'Europe' },
      { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', flag: '��', region: 'Americas' },
    ];
  }
}

export async function GET() {
  try {
    // Verificar cache
    const now = Date.now();
    if (countriesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        countries: countriesCache,
        cached: true,
        cacheAge: Math.round((now - cacheTimestamp) / 1000 / 60) // em minutos
      });
    }

    // Buscar dados frescos
    const countries = await fetchCountriesFromAPI();
    
    // Atualizar cache
    countriesCache = countries;
    cacheTimestamp = now;

    return NextResponse.json({
      success: true,
      countries,
      cached: false,
      total: countries.length
    });

  } catch (error: any) {
    console.error('Erro na API de países:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao buscar países',
        message: error.message
      },
      { status: 500 }
    );
  }
}