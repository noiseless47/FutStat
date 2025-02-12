import { NextResponse } from 'next/server'

const API_URL = process.env.FOOTBALL_API_URL
const API_KEY = process.env.FOOTBALL_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase()

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
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
    
    // Get all competitions
    const competitionsResponse = await fetch(
      `${API_URL}/competitions`,
      { headers }
    )
    const competitionsData = await competitionsResponse.json()

    // Filter and format results
    const allTeams = teamsResponses.flatMap(response => response.teams || [])
    const filteredTeams = allTeams
      .filter(team => 
        team.name.toLowerCase().includes(query) || 
        team.shortName?.toLowerCase().includes(query) ||
        team.tla?.toLowerCase().includes(query)
      )
      .slice(0, 5) // Limit to top 5 matches

    const filteredCompetitions = competitionsData.competitions
      .filter((comp: any) => 
        comp.name.toLowerCase().includes(query) ||
        comp.code?.toLowerCase().includes(query)
      )
      .slice(0, 3) // Limit to top 3 matches

    // Combine and format results
    const results = [
      ...filteredTeams.map((team: any) => ({
        id: team.id,
        name: team.shortName || team.name,
        type: 'team',
        image: team.crest,
        area: team.area?.name
      })),
      ...filteredCompetitions.map((comp: any) => ({
        id: comp.id,
        name: comp.name,
        type: 'league',
        image: comp.emblem,
        area: comp.area?.name
      }))
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 })
  }
} 