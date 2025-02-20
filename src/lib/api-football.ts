const API_URL = 'https://v3.football.api-sports.io'
const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY

interface ApiResponse<T> {
  response: T
  errors: string[]
  results: number
}

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': API_KEY || ''
    }
  })

  if (!response.ok) {
    throw new Error('API request failed')
  }

  const data: ApiResponse<T> = await response.json()
  
  if (data.errors.length > 0) {
    throw new Error(data.errors.join(', '))
  }

  return data.response
}

export interface Player {
  player: {
    id: number
    name: string
    firstname: string
    lastname: string
    age: number
    nationality: string
    height: string
    weight: string
    injured: boolean
    photo: string
  }
  statistics: [{
    team: {
      id: number
      name: string
      logo: string
    }
    league: {
      id: number
      name: string
      country: string
      logo: string
    }
    games: {
      appearences: number
      lineups: number
      minutes: number
      position: string
    }
    shots: {
      total: number
      on: number
    }
    goals: {
      total: number
      assists: number
    }
    passes: {
      total: number
      accuracy: number
    }
  }]
}

export interface TeamStats {
  league: {
    id: number
    name: string
    country: string
    season: number
  }
  team: {
    id: number
    name: string
    logo: string
  }
  fixtures: {
    played: {
      home: number
      away: number
      total: number
    }
    wins: {
      home: number
      away: number
      total: number
    }
    draws: {
      home: number
      away: number
      total: number
    }
    loses: {
      home: number
      away: number
      total: number
    }
  }
  goals: {
    for: {
      total: {
        home: number
        away: number
        total: number
      }
    }
    against: {
      total: {
        home: number
        away: number
        total: number
      }
    }
  }
  clean_sheet: {
    home: number
    away: number
    total: number
  }
  failed_to_score: {
    home: number
    away: number
    total: number
  }
}

export const apiFootball = {
  async getTeamPlayers(teamId: number, season: number) {
    return fetchFromAPI<Player[]>(`/players?team=${teamId}&season=${season}`)
  },

  async getTeamStatistics(teamId: number, leagueId: number, season: number) {
    return fetchFromAPI<TeamStats>(`/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`)
  },

  async getPlayerStatistics(playerId: number, season: number) {
    return fetchFromAPI<Player>(`/players?id=${playerId}&season=${season}`)
  }
}

export async function fetchPlayerStatistics(playerId: number) {
  try {
    // ... code inside try block ...
  } catch (error) {
    console.error('Error fetching player statistics:', error)
    return null
  }
} 