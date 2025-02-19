import { NextResponse } from 'next/server'

const API_URL = 'https://api.football-data.org/v4'
const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_KEY

if (!API_KEY) {
  console.error('Football Data API key is not configured')
}

const CACHE: { [key: string]: { data: unknown, timestamp: number } } = {}
const CACHE_DURATION = 60 * 1000 // 1 minute cache

async function fetchFromFootballAPI(endpoint: string) {
  // Check cache first
  if (CACHE[endpoint] && Date.now() - CACHE[endpoint].timestamp < CACHE_DURATION) {
    return CACHE[endpoint].data
  }

  try {
    console.log('Fetching from:', `${API_URL}${endpoint}`)
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'X-Auth-Token': API_KEY || '',
      },
      next: { revalidate: 60 } // Cache for 1 minute
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Football API Error:', errorText)
      throw new Error(`Football API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    // Cache the response
    CACHE[endpoint] = {
      data,
      timestamp: Date.now()
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' }, 
        { status: 400 }
      )
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      )
    }

    const data = await fetchFromFootballAPI(path)
    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch data', 
        message: error.message,
        path: new URL(request.url).searchParams.get('path')
      }, 
      { status: 500 }
    )
  }
} 