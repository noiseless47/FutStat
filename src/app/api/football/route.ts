import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const path = url.searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`https://api.sofascore.com/api/v1/${path}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Error fetching data:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch data',
        message: error?.message || 'Unknown error occurred',
        path: new URL(request.url).searchParams.get('path')
      },
      { status: 500 }
    )
  }
}