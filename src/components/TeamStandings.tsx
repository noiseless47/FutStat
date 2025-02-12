'use client'

import { useState, useEffect } from 'react'
import { footballApi, Standing, TeamStats } from '@/lib/football-api'
import { DataTable } from './DataTable'

interface TeamStandingsProps {
  teamId: number
}

// Define priority order for competitions
const COMPETITION_ORDER = [
  'Bundesliga',
  'UEFA Champions League',
  'DFB-Pokal',
  'FIFA Club World Cup'
]

export function TeamStandings({ teamId }: TeamStandingsProps) {
  const [standings, setStandings] = useState<Standing[]>([])
  const [team, setTeam] = useState<TeamStats | null>(null)
  const [selectedCompetition, setSelectedCompetition] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const teamData = await footballApi.getTeam(teamId)
        setTeam(teamData)

        // Sort competitions based on priority order
        const sortedCompetitions = [...teamData.runningCompetitions].sort((a, b) => {
          const indexA = COMPETITION_ORDER.indexOf(a.name)
          const indexB = COMPETITION_ORDER.indexOf(b.name)
          return indexA - indexB
        })

        // Get the first competition as default
        const firstCompetition = sortedCompetitions[0]
        if (firstCompetition) {
          setSelectedCompetition(firstCompetition.id.toString())
          const standingsData = await footballApi.getStandings(firstCompetition.id)
          setStandings(standingsData)
        }
      } catch (error) {
        console.error('Error fetching standings:', error)
        setError('Failed to load standings')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  const handleCompetitionChange = async (competitionId: string) => {
    try {
      setLoading(true)
      setSelectedCompetition(competitionId)
      const standingsData = await footballApi.getStandings(parseInt(competitionId))
      setStandings(standingsData)
    } catch (error) {
      console.error('Error fetching standings:', error)
      setError('Failed to load standings')
    } finally {
      setLoading(false)
    }
  }

  if (error) return <div className="text-red-500">{error}</div>

  // Format data for DataTable
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
      title="League Position"
      showPosition={true}
      competitionId={selectedCompetition}
      showLeagueSelector={true}
      onCompetitionChange={handleCompetitionChange}
      competitions={team?.runningCompetitions
        .sort((a, b) => {
          const indexA = COMPETITION_ORDER.indexOf(a.name)
          const indexB = COMPETITION_ORDER.indexOf(b.name)
          return indexA - indexB
        })
        .map(comp => ({
          id: comp.id,
          name: comp.name
        })) || []}
      selectedCompetition={selectedCompetition}
      loading={loading}
    />
  )
} 