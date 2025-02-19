'use client'

;
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


interface Match {
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

export function LiveScores() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)
        setError(null)
        // Premier League ID: 2021
        const data = await footballApi.getMatches(2021)
        setMatches(data.matches.filter(match => match.status === 'LIVE'))
      } catch (error) {
        console.error('Error fetching matches:', error)
        setError('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
    const interval = setInterval(fetchMatches, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (matches.length === 0) return <div>No live matches at the moment</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Live Matches</h1>
      <div className="grid grid-cols-1 gap-4">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {match.competition.name} - {match.stage}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img 
                    src={match.homeTeam.crest} 
                    alt={match.homeTeam.name} 
                    className="w-8 h-8"
                  />
                  <span>{match.homeTeam.shortName}</span>
                </div>
                <div className="text-xl font-bold">
                  {match.score.fullTime.home ?? 0} - {match.score.fullTime.away ?? 0}
                </div>
                <div className="flex items-center space-x-2">
                  <span>{match.awayTeam.shortName}</span>
                  <img 
                    src={match.awayTeam.crest} 
                    alt={match.awayTeam.name} 
                    className="w-8 h-8"
                  />
                </div>
              </div>
              {match.score.halfTime.home !== null && (
                <div className="text-sm text-muted-foreground text-center mt-2">
                  HT: {match.score.halfTime.home} - {match.score.halfTime.away}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 