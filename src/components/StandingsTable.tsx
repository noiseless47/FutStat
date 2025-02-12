'use client'

import { useEffect, useState } from 'react'
import { footballApi, Standing } from '@/lib/football-api'
import { DataTable } from './DataTable'

// Define available competitions
const COMPETITIONS = [
  { id: 2021, name: 'Premier League' },
  { id: 2014, name: 'La Liga' },
  { id: 2002, name: 'Bundesliga' },
  { id: 2019, name: 'Serie A' },
  { id: 2015, name: 'Ligue 1' },
  { id: 2001, name: 'Champions League' },
]

// Define qualification zones for different competitions
const QUALIFICATION_ZONES = {
  // Premier League
  2021: {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5],
    conferenceLeague: [6],
    relegation: [18, 19, 20]
  },
  // La Liga
  2014: {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5],
    conferenceLeague: [6],
    relegation: [18, 19, 20]
  },
  // Bundesliga
  2002: {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5],
    conferenceLeague: [6],
    relegation: [16, 17], // 16 is playoff
    directRelegation: [17, 18]
  },
  // Serie A
  2019: {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5],
    conferenceLeague: [6],
    relegation: [18, 19, 20]
  },
  // Ligue 1
  2015: {
    championsLeague: [1, 2, 3],
    championsLeaguePlayoff: [4],
    europaLeague: [5],
    relegation: [16, 17, 18] // 16 is playoff
  },
  2001: { // Champions League zones
    knockout: [1, 2], // Top 2 advance from groups
    europaLeague: [3], // 3rd goes to Europa League
    eliminated: [4]    // 4th is eliminated
  }
}

interface Props {
  standings: Standing[]
  competitionId?: string
  showLeagueSelector?: boolean
}

export function StandingsTable({ 
  standings: initialStandings = [],
  competitionId = '2021',
  showLeagueSelector = true 
}: Props) {
  const [standings, setStandings] = useState<Standing[]>(initialStandings)
  const [selectedCompetition, setSelectedCompetition] = useState(competitionId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!showLeagueSelector) return
    
    async function fetchStandings() {
      try {
        setLoading(true)
        setError(null)
        setStandings([]) // Clear existing standings before fetching new ones
        const data = await footballApi.getStandings(parseInt(selectedCompetition))
        setStandings(data)
      } catch (error) {
        console.error('Error fetching standings:', error)
        setError('Failed to load standings')
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [selectedCompetition, showLeagueSelector])

  const handleCompetitionChange = (value: string) => {
    setSelectedCompetition(value)
  }

  if (error) return <div className="text-red-500">{error}</div>

  const tableData = standings.map(team => ({
    id: team.team.id,
    position: team.position,
    name: team.team.name,
    shortName: team.team.shortName,
    crest: team.team.crest,
    stats: {
      played: team.playedGames,
      won: team.won,
      drawn: team.draw,
      lost: team.lost,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalDifference,
      points: team.points
    }
  }))

  return (
    <DataTable 
      data={tableData}
      title="League Standings"
      showPosition={true}
      competitionId={selectedCompetition}
      showLeagueSelector={showLeagueSelector}
      onCompetitionChange={handleCompetitionChange}
      competitions={COMPETITIONS}
      selectedCompetition={selectedCompetition}
      loading={loading}
    />
  )
} 