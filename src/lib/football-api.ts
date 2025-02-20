const API_BASE = '/api/football'

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}?path=${encodeURIComponent(endpoint)}`)

  if (!response.ok) {
    console.error('API Error:', await response.text())
    throw new Error('API request failed')
  }

  const data = await response.json()
  console.log('API Response:', data) // For debugging
  return data
}

// Add this type at the top with other interfaces
type PreferredFoot = 'Left' | 'Right';

export interface Player {
  id: number
  name: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  position: string
  shirtNumber?: number
  currentTeam: {
    id: number
    name: string
    shortName: string
    crest: string
    area: {
      id: number
      name: string
      code: string
      flag: string
    }
  }
  stats?: {
    appearances: number
    goals: number
    assists: number
    cleanSheets?: number
    minutesPlayed: number
    yellowCards: number
    redCards: number
  }
  marketValue?: string
  contract?: {
    start: string
    until: string
  }
  preferredFoot?: PreferredFoot
  attributes?: {
    pace?: number
    shooting?: number
    passing?: number
    dribbling?: number
    defending?: number
    physical?: number
  }
  trophies?: {
    name: string
    season: string
    club: string
  }[]
}

export interface TeamStats {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  address: string
  website: string
  founded: number
  clubColors: string
  venue: string
  lastUpdated: string
  area: {
    id: number
    name: string
    code: string
    flag: string
  }
  squad: Player[]
  coach: {
    id: number
    firstName: string
    lastName: string
    name: string
    dateOfBirth: string
    nationality: string
  }
  runningCompetitions: {
    id: number
    name: string
    code: string
    type: string
    emblem: string
  }[]
}

export interface Standing {
  position: number
  team: {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
  }
  playedGames: number
  form: string | null
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export interface Match {
  id: number
  utcDate: string
  status: string
  stage: string
  score: {
    fullTime: {
      home: number | null
      away: number | null
    }
    halfTime: {
      home: number | null
      away: number | null
    }
  }
  homeTeam: {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
  }
  awayTeam: {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
  }
  competition: {
    id: number
    name: string
    emblem: string
  }
}

export interface TeamSuggestion {
  id: number
  name: string
  shortName: string
  tla?: string
  crest: string
  area: {
    name: string
    flag: string
    leagueName?: string
  }
  squad?: Player[]
}

export interface LeagueSuggestion {
  id: number
  name: string
  code: string
  emblem: string
  area: {
    name: string
    flag: string
  }
}

// Cache for teams and leagues
let teamsCache: TeamSuggestion[] = []
let leaguesCache: LeagueSuggestion[] = []

const MAJOR_LEAGUES = [
  { id: 2021, name: 'Premier League', code: 'PL', area: 'England' },
  { id: 2014, name: 'La Liga', code: 'PD', area: 'Spain' },
  { id: 2019, name: 'Serie A', code: 'SA', area: 'Italy' },
  { id: 2002, name: 'Bundesliga', code: 'BL1', area: 'Germany' },
  { id: 2015, name: 'Ligue 1', code: 'FL1', area: 'France' },
  { id: 2001, name: 'Champions League', code: 'CL', area: 'Europe' }
]

export const footballApi = {
  async getTeam(teamId: number) {
    return fetchFromAPI<TeamStats>(`/teams/${teamId}`)
  },

  async getStandings(competitionId: number) {
    try {
      const response = await fetchFromAPI<any>(`/competitions/${competitionId}/standings`)
      // Make sure we're returning the correct standings array
      return response.standings[0]?.table || []
    } catch (error) {
      console.error('Failed to fetch standings:', error)
      return []
    }
  },

  async getMatches(competitionId: number) {
    // Get matches for a wider range to ensure we get upcoming matches
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const dateFrom = today.toISOString().split('T')[0]
    const dateTo = nextMonth.toISOString().split('T')[0]
    
    return fetchFromAPI<{ matches: Match[] }>(
      `/competitions/${competitionId}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`
    )
  },

  async getTeams(competitionId: number) {
    return fetchFromAPI<{ teams: TeamSuggestion[] }>(`/competitions/${competitionId}/teams`)
  },

  async getLeagues() {
    return fetchFromAPI<{ competitions: LeagueSuggestion[] }>('/competitions')
  },

  async getPlayer(playerId: number): Promise<Player | null> {
    try {
      const allTeams = await this.getAllTeams()
      
      for (const team of allTeams) {
        const teamData = await this.getTeam(team.id)
        const player = teamData.squad?.find(p => p.id === playerId)
        if (player) {
          // Fetch additional player stats from another endpoint or mock data
          const playerStats = await this.getPlayerStats(playerId, team.id)
          
          return {
            ...player,
            currentTeam: {
              id: teamData.id,
              name: teamData.name,
              shortName: teamData.shortName,
              crest: teamData.crest,
              area: teamData.area
            },
            stats: playerStats.stats,
            marketValue: playerStats.marketValue,
            contract: playerStats.contract,
            attributes: playerStats.attributes,
            trophies: playerStats.trophies
          }
        }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch player:', error)
      return null
    }
  },

  async getPlayerStats(playerId: number, teamId: number) {
    // In a real app, this would fetch from an API
    // For now, return mock data
    return {
      stats: {
        appearances: Math.floor(Math.random() * 30) + 10,
        goals: Math.floor(Math.random() * 15),
        assists: Math.floor(Math.random() * 10),
        minutesPlayed: Math.floor(Math.random() * 2000) + 500,
        yellowCards: Math.floor(Math.random() * 5),
        redCards: Math.floor(Math.random() * 2),
      },
      marketValue: '€' + (Math.floor(Math.random() * 50) + 10) + 'M',
      contract: {
        start: '2023-07-01',
        until: '2027-06-30'
      },
      preferredFoot: Math.random() > 0.5 ? 'Left' : 'Right',
      attributes: {
        pace: Math.floor(Math.random() * 30) + 70,
        shooting: Math.floor(Math.random() * 30) + 70,
        passing: Math.floor(Math.random() * 30) + 70,
        dribbling: Math.floor(Math.random() * 30) + 70,
        defending: Math.floor(Math.random() * 30) + 70,
        physical: Math.floor(Math.random() * 30) + 70,
      },
      trophies: [
        { name: 'League Title', season: '2022/23', club: 'Previous Club' },
        { name: 'Cup Winner', season: '2021/22', club: 'Previous Club' },
      ]
    }
  },

  async getLeague(leagueId: number) {
    return fetchFromAPI<LeagueSuggestion>(`/competitions/${leagueId}`)
  },

  async getTeamMatches(teamId: number) {
    // Get matches for last month and next month
    const today = new Date()
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const dateFrom = lastMonth.toISOString().split('T')[0]
    const dateTo = nextMonth.toISOString().split('T')[0]
    
    return fetchFromAPI<{ matches: Match[] }>(
      `/teams/${teamId}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`
    )
  },

  async getAllTeams() {
    // Return cached teams if available
    if (teamsCache.length > 0) {
      return teamsCache
    }

    try {
      // Fetch teams from all major leagues in parallel
      const teamsPromises = MAJOR_LEAGUES.map(league =>
        fetchFromAPI<{ teams: TeamSuggestion[] }>(`/competitions/${league.id}/teams`)
          .then(data => data.teams.map(team => ({
            ...team,
            league: league.name,
            area: {
              ...team.area,
              leagueName: league.name
            }
          })))
      )

      const allTeamsResponses = await Promise.all(teamsPromises)
      teamsCache = allTeamsResponses.flat()
      return teamsCache
    } catch (error) {
      console.error('Failed to fetch teams:', error)
      return []
    }
  },

  async searchTeams(query: string): Promise<TeamSuggestion[]> {
    const allTeams = await this.getAllTeams()
    const lowerQuery = query.toLowerCase()

    return allTeams.filter(team =>
      team.name.toLowerCase().includes(lowerQuery) ||
      (team.shortName?.toLowerCase() || '').includes(lowerQuery) ||
      (team.tla?.toLowerCase() || '').includes(lowerQuery)
    )
  },

  async searchPlayers(query: string): Promise<any[]> {
    if (query.length < 2) return []
    
    try {
      const allTeams = await this.getAllTeams()
      const playersMap = new Map()

      allTeams
        .filter(team => Array.isArray(team.squad) && team.squad.length > 0)
        .forEach(team => {
          team.squad?.forEach(player => {
            if (
              (player.name.toLowerCase().includes(query.toLowerCase()) ||
              player.firstName?.toLowerCase().includes(query.toLowerCase()) ||
              player.lastName?.toLowerCase().includes(query.toLowerCase())) &&
              !playersMap.has(player.id)
            ) {
              playersMap.set(player.id, {
                id: player.id,
                name: player.name,
                type: 'player',
                image: team.crest,
                area: player.nationality,
                team: team.shortName || team.name
              })
            }
          })
        })

      return Array.from(playersMap.values()).slice(0, 5)
    } catch (error) {
      console.error('Player search error:', error)
      return []
    }
  },

  async searchAll(query: string): Promise<any[]> {
    const [teams, players, leagues] = await Promise.all([
      this.searchTeams(query),
      this.searchPlayers(query),
      this.getLeagues()
    ])

    const lowerQuery = query.toLowerCase()
    const filteredLeagues = leagues.competitions.filter(league =>
      league.name.toLowerCase().includes(lowerQuery) ||
      league.code?.toLowerCase().includes(lowerQuery)
    )

    return [
      ...teams.map(team => ({
        id: team.id,
        name: team.shortName || team.name,
        type: 'team',
        image: team.crest,
        area: team.area.name,
        league: team.area.leagueName
      })),
      ...players,
      ...filteredLeagues.map(league => ({
        id: league.id,
        name: league.name,
        type: 'league',
        image: league.emblem,
        area: league.area.name
      }))
    ]
  }
} 