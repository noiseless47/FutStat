'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { SharedImage } from '@/components/shared-image'
import { Activity } from 'lucide-react'

interface Match {
  id: number
  tournament: {
    uniqueTournament: {
      id: number
      name: string
    }
    name: string
  }
  status: {
    description: string
    type: string
  }
  homeTeam: {
    id: number
    name: string
    shortName: string
  }
  awayTeam: {
    id: number
    name: string
    shortName: string
  }
  homeScore: {
    current: number
    display: number
  }
  awayScore: {
    current: number
    display: number
  }
}

export function SofascoreLiveMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          'https://api.sofascore.com/api/v1/sport/football/events/live',
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        const data = await response.json()
        const validMatches = (data.events || []).filter((match: any) => 
          match && 
          match.id && 
          match.homeTeam?.id && 
          match.awayTeam?.id && 
          match.tournament?.uniqueTournament?.id
        )
        setMatches(validMatches)
      } catch (error) {
        console.error('Error loading matches:', error)
        setError('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
    const interval = setInterval(loadMatches, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading matches...</div>
  if (error) return <div>{error}</div>
  if (!matches.length) return <div>No live matches</div>

  return (
    <Card className="mt-8">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500" />
          <h2 className="font-semibold">Live Matches</h2>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="divide-y">
          {matches.map(match => (
            <div 
              key={match.id} 
              className="p-4 hover:bg-accent/50 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <SharedImage 
                    type="league" 
                    id={match.tournament.uniqueTournament.id} 
                    className="w-4 h-4" 
                    alt={match.tournament.name} 
                  />
                  <span className="text-sm text-muted-foreground">{match.tournament.name}</span>
                </div>
                <div className="text-sm font-medium text-red-500">
                  {match.status.description}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <SharedImage 
                    type="team" 
                    id={match.homeTeam.id} 
                    className="w-5 h-5" 
                    alt={match.homeTeam.name} 
                  />
                  <span>{match.homeTeam.shortName}</span>
                </div>
                <div className="font-medium mx-4">
                  {match.homeScore.display} - {match.awayScore.display}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <SharedImage 
                    type="team" 
                    id={match.awayTeam.id} 
                    className="w-5 h-5" 
                    alt={match.awayTeam.name} 
                  />
                  <span>{match.awayTeam.shortName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 