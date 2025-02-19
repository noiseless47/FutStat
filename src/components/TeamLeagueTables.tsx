'use client'

import { SharedImage } from '@/components/ui/shared-image';
import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { fetchLeagueStandings, type LeagueStandings } from '@/lib/sofascore-api'

interface TeamLeagueTablesProps {
  teamId: number
}

interface TeamData {
  primaryUniqueTournament: {
    id: number
    name: string
  }
  pregameForm?: {
    avgRating: string
    position: number
    value: string
    form: string[]
  }
  teamColors: {
    primary: string
    secondary: string
  }
}

interface StandingTeam {
  id: number
  position: number
  points: number
  // ... other existing fields
  rating?: string // Add rating field
}

export function TeamLeagueTables({ teamId }: TeamLeagueTablesProps) {
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [standings, setStandings] = useState<LeagueStandings | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch team data and standings
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // First get team data
        const teamResponse = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        const { team } = await teamResponse.json()
        setTeamData(team)

        // Then get standings for team's primary tournament
        if (team.primaryUniqueTournament) {
          const data = await fetchLeagueStandings(team.primaryUniqueTournament.id)
          setStandings(data)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [teamId])

  if (!standings || !teamData) return null

  return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SharedImage type="team" id={teamData.primaryUniqueTournament.id} className="w-6 h-6" alt="" />
            <h2 className="font-semibold">{teamData.primaryUniqueTournament.name}</h2>
          </div>
          {teamData.pregameForm?.avgRating && (
            <div className="text-sm text-muted-foreground">
              Rating: <span className="font-medium">{teamData.pregameForm.avgRating}</span>
            </div>
          )}
        </div>
        {teamData.pregameForm && (
          <div className="flex items-center gap-2">
            {teamData.pregameForm.form.map((result, index) => (
              <div 
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                  result === 'W' ? 'bg-green-500' :
                  result === 'D' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase bg-muted">
            <tr>
              <th className="px-2 py-2 text-left w-8">#</th>
              <th className="px-2 py-2 text-left">Team</th>
              <th className="px-2 py-2 text-center w-8">P</th>
              <th className="px-2 py-2 text-center w-8">W</th>
              <th className="px-2 py-2 text-center w-8">D</th>
              <th className="px-2 py-2 text-center w-8">L</th>
              <th className="px-2 py-2 text-center w-10">GF</th>
              <th className="px-2 py-2 text-center w-10">GA</th>
              <th className="px-2 py-2 text-center w-10">GD</th>
              <th className="px-2 py-2 text-center w-10">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.standings.map((team) => (
              <tr 
                key={team.id} 
                className={`border-b hover:bg-accent/50 ${
                  team.id === teamId ? 'bg-accent' : ''
                }`}
              >
                <td className="px-2 py-2 text-left">{team.position}</td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    <img 
                      src={team.crest} 
                      alt={team.name} 
                      className="w-4 h-4"
                    />
                    <span className="truncate">{team.shortName}</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-center">{team.played}</td>
                <td className="px-2 py-2 text-center">{team.won}</td>
                <td className="px-2 py-2 text-center">{team.drawn}</td>
                <td className="px-2 py-2 text-center">{team.lost}</td>
                <td className="px-2 py-2 text-center">{team.goalsFor}</td>
                <td className="px-2 py-2 text-center">{team.goalsAgainst}</td>
                <td className="px-2 py-2 text-center">
                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                </td>
                <td className="px-2 py-2 text-center font-bold">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
} 