import { NextResponse } from 'next/server'

interface Competition {
  id: number
  name: string
  code?: string
  area?: {
    name: string
    code: string
    flag?: string
  }
  type?: string
  emblem?: string
}

interface Team {
  id: number
  name: string
  shortName?: string
  tla?: string
  crest?: string
  area?: {
    name: string
  }
}

interface CompetitionsResponse {
  competitions: Competition[]
}

interface TeamsResponse {
  teams: Team[]
}

const API_URL = process.env.FOOTBALL_API_URL
const API_KEY = process.env.FOOTBALL_API_KEY

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const headers = {
      'X-Auth-Token': API_KEY as string
    }

    // Get all teams from top 5 leagues
    const leagues = [2021, 2014, 2019, 2002, 2015] // Premier League, La Liga, Serie A, Bundesliga, Ligue 1
    const teamsPromises = leagues.map(leagueId => 
      fetch(`${API_URL}/competitions/${leagueId}/teams`, { headers })
        .then(res => res.json())
    )

    const teamsResponses = await Promise.all(teamsPromises)
    
    // Fetch competitions data
    const competitionsResponse = await fetch(
      'https://api.football-data.org/v4/competitions',
      {
        headers: {
          'X-Auth-Token': process.env.NEXT_PUBLIC_FOOTBALL_DATA_KEY || '',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!competitionsResponse.ok) {
      throw new Error('Failed to fetch competitions')
    }

    const competitionsData: CompetitionsResponse = await competitionsResponse.json()

    // Filter and format results
    const allTeams = teamsResponses.flatMap(response => response.teams || [])
    const filteredTeams = allTeams
      .filter((team: Team) => 
        team.name.toLowerCase().includes(query) || 
        team.shortName?.toLowerCase().includes(query) ||
        team.tla?.toLowerCase().includes(query)
      )
      .slice(0, 5)

    // Filter and format competitions
    const filteredCompetitions = competitionsData.competitions
      .filter((comp: Competition) =>
        comp.name.toLowerCase().includes(query) ||
        comp.code?.toLowerCase().includes(query)
      )
      .slice(0, 3) // Limit to top 3 matches
      .map(comp => ({
        id: comp.id,
        name: comp.name,
        code: comp.code,
        country: comp.area?.name,
        flag: comp.area?.flag,
        type: comp.type,
        emblem: comp.emblem
      }))

    // Combine and format results
    const results = [
      ...filteredTeams.map((team: Team) => ({
        id: team.id,
        name: team.shortName || team.name,
        type: 'team',
        image: team.crest,
        area: team.area?.name
      })),
      ...filteredCompetitions
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
} 