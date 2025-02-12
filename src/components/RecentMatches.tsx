'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { footballApi, Match } from '@/lib/football-api'
import { format } from 'date-fns'

interface RecentMatchesProps {
  teamId: number
}

export function RecentMatches({ teamId }: RecentMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)
        const data = await footballApi.getTeamMatches(teamId)
        setMatches(data.matches)
      } catch (error) {
        console.error('Error fetching matches:', error)
        setError('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [teamId])

  const formatDate = (utcDate: string) => {
    const date = new Date(utcDate)
    return date.toLocaleDateString('default', { 
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '/')
  }

  const getWinnerStyles = (match: Match, isHome: boolean) => {
    if (match.status !== 'FINISHED') return ''
    
    const homeScore = match.score.fullTime.home ?? 0
    const awayScore = match.score.fullTime.away ?? 0
    
    if (homeScore === awayScore) return 'text-gray-400'
    if (isHome) {
      return homeScore > awayScore ? 'font-bold text-black' : 'text-gray-400'
    }
    return awayScore > homeScore ? 'font-bold text-black' : 'text-gray-400'
  }

  if (loading) return <div className="p-4 text-center">Loading matches...</div>
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Matches</h2>
      <Card>
        <div className="divide-y">
          {matches.map((match) => (
            <div key={match.id} className="p-4">
              <div className="flex flex-col space-y-2">
                {/* Competition header */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <img 
                    src={match.competition.emblem} 
                    alt={match.competition.name}
                    className="w-4 h-4"
                  />
                  <span>{match.competition.name}</span>
                </div>

                {/* Match details */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col items-center w-24">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(match.utcDate)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      {match.status === 'FINISHED' && (
                        <span>FT</span>
                      )}
                      {match.status === 'FINISHED' ? '' : format(new Date(match.utcDate), 'HH:mm')}
                    </div>
                  </div>

                  <div className="flex-1 px-4">
                    <div className="flex items-center gap-2">
                      <img 
                        src={match.homeTeam.crest} 
                        alt={match.homeTeam.name}
                        className="w-5 h-5"
                      />
                      <span className={getWinnerStyles(match, true)}>
                        {match.homeTeam.shortName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img 
                        src={match.awayTeam.crest} 
                        alt={match.awayTeam.name}
                        className="w-5 h-5"
                      />
                      <span className={getWinnerStyles(match, false)}>
                        {match.awayTeam.shortName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <span className={`font-bold ${getWinnerStyles(match, true)}`}>
                        {match.score.fullTime.home ?? '-'}
                      </span>
                      <span className={`font-bold ${getWinnerStyles(match, false)}`}>
                        {match.score.fullTime.away ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 