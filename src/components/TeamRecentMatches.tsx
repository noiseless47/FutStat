'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { footballApi, Match } from '@/lib/football-api'
import { format } from 'date-fns'

interface TeamRecentMatchesProps {
  teamId: number
}

export function TeamRecentMatches({ teamId }: TeamRecentMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)
        const data = await footballApi.getTeamMatches(teamId)
        if (!data.matches) {
          throw new Error('No matches data received')
        }
        setMatches(data.matches)
      } catch (error: any) {
        console.error('Error fetching matches:', error)
        setError(error.message || 'Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [teamId])

  if (loading) return <div className="p-4 text-center">Loading matches...</div>
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>
  if (matches.length === 0) return <div className="p-4 text-center">No matches found</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Matches</h2>
      <div className="space-y-2">
        {matches.map((match) => (
          <Card key={match.id} className="hover:bg-gray-50 transition-colors">
            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={match.competition.emblem} 
                    alt={match.competition.name}
                    className="w-5 h-5"
                  />
                  <span>{match.competition.name}</span>
                </div>
                <span>{format(new Date(match.utcDate), 'MMM d, HH:mm')}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <img 
                    src={match.homeTeam.crest} 
                    alt={match.homeTeam.name}
                    className="w-6 h-6"
                  />
                  <span className="font-medium">{match.homeTeam.shortName}</span>
                </div>
                
                <div className="px-4 font-bold">
                  {match.status === 'FINISHED' && (
                    <span>
                      {match.score.fullTime.home} - {match.score.fullTime.away}
                    </span>
                  )}
                  {match.status === 'SCHEDULED' && (
                    <span className="text-muted-foreground font-normal">vs</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="font-medium">{match.awayTeam.shortName}</span>
                  <img 
                    src={match.awayTeam.crest} 
                    alt={match.awayTeam.name}
                    className="w-6 h-6"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 