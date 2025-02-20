'use client'

import { SharedImage } from '@/components/shared-image';
import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"

interface TeamStandingsProps {
  teamId: number
}

interface StandingRow {
  team: {
    id: number;
    name: string;
    shortName: string;
    crest: string;
  };
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export function TeamStandings({ teamId }: TeamStandingsProps) {
  const [standings, setStandings] = useState<any>(null)
  const [seasonId, setSeasonId] = useState<number | null>(null)

  useEffect(() => {
    const loadStandings = async () => {
      try {
        // First get the current season
        const seasonResponse = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}/seasons`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        const seasonData = await seasonResponse.json()
        const currentSeason = seasonData.seasons[0]
        setSeasonId(currentSeason.id)

        // Then get standings
        const standingsResponse = await fetch(`https://api.sofascore.com/api/v1/unique-tournament/${currentSeason.uniqueTournament.id}/season/${currentSeason.id}/standings/total`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        const standingsData = await standingsResponse.json()
        setStandings(standingsData.standings[0])
      } catch (error) {
        console.error('Error loading standings:', error)
      }
    }

    loadStandings()
  }, [teamId])

  if (!standings) return null

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Standings</h2>
      </div>
      <CardContent className="p-0">
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
              {standings.rows.map((row: StandingRow) => (
                <tr 
                  key={row.team.id} 
                  className={`border-b hover:bg-accent/50 ${
                    row.team.id === teamId ? 'bg-accent' : ''
                  }`}
                >
                  <td className="px-2 py-2 text-left">{row.position}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <SharedImage type="team" id={row.team.id} className="w-4 h-4" alt="" />
                      <span>{row.team.shortName}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center">{row.played}</td>
                  <td className="px-2 py-2 text-center">{row.won}</td>
                  <td className="px-2 py-2 text-center">{row.drawn}</td>
                  <td className="px-2 py-2 text-center">{row.lost}</td>
                  <td className="px-2 py-2 text-center">{row.goalsFor}</td>
                  <td className="px-2 py-2 text-center">{row.goalsAgainst}</td>
                  <td className="px-2 py-2 text-center">{row.goalDifference}</td>
                  <td className="px-2 py-2 text-center font-bold">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 