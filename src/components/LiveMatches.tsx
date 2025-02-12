'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { footballApi, Match } from '@/lib/football-api'
import { format } from 'date-fns'
import { Activity } from 'lucide-react'

export function LiveMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)
        setError(null)
        const data = await footballApi.getMatches(2021)
        const liveMatches = data.matches.filter(match => match.status === 'LIVE')
        setMatches(liveMatches)
      } catch (error) {
        console.error('Error fetching matches:', error)
        setError('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
    const interval = setInterval(fetchMatches, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (matches.length === 0) return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <h2 className="font-semibold">Live Matches</h2>
        </div>
        <span className="text-sm text-muted-foreground">Premier League</span>
      </div>
      <CardContent className="p-4">
        No live matches at the moment
      </CardContent>
    </Card>
  )

  return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500" />
          <h2 className="font-semibold">Live Matches</h2>
        </div>
        <span className="text-sm text-muted-foreground">Premier League</span>
      </div>
      <CardContent className="p-0">
        {matches.map((match) => (
          <div 
            key={match.id} 
            className="p-4 border-b last:border-0 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <img 
                  src={match.homeTeam.crest} 
                  alt={match.homeTeam.name} 
                  className="w-6 h-6"
                />
                <span className="font-medium">{match.homeTeam.shortName}</span>
              </div>
              <div className="font-bold">
                {match.score.fullTime.home ?? 0} - {match.score.fullTime.away ?? 0}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{match.awayTeam.shortName}</span>
                <img 
                  src={match.awayTeam.crest} 
                  alt={match.awayTeam.name} 
                  className="w-6 h-6"
                />
              </div>
            </div>
            {match.score.halfTime.home !== null && (
              <div className="text-sm text-muted-foreground text-center">
                HT: {match.score.halfTime.home} - {match.score.halfTime.away}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 