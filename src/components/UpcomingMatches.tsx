'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { footballApi, Match } from '@/lib/football-api'
import { format, isToday, isTomorrow } from 'date-fns'
import { CalendarDays } from 'lucide-react'

export function UpcomingMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)
        setError(null)
        const data = await footballApi.getMatches(2021)
        const upcomingMatches = data.matches
          .filter(match => new Date(match.utcDate) >= new Date())
          .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
          .slice(0, 5)
        
        setMatches(upcomingMatches)
      } catch (error) {
        console.error('Error fetching matches:', error)
        setError('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  function formatMatchDate(date: string) {
    const matchDate = new Date(date)
    if (isToday(matchDate)) {
      return 'Today'
    }
    if (isTomorrow(matchDate)) {
      return 'Tomorrow'
    }
    return format(matchDate, 'MMM d')
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (matches.length === 0) return <div>No upcoming matches</div>

  return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          <h2 className="font-semibold">Upcoming Matches</h2>
        </div>
        <span className="text-sm text-muted-foreground">Premier League</span>
      </div>
      <CardContent className="p-0">
        {matches.map((match) => (
          <div 
            key={match.id} 
            className="p-4 border-b last:border-0 hover:bg-accent/50 transition-colors"
          >
            <div className="text-sm text-muted-foreground mb-2">
              {formatMatchDate(match.utcDate)} - {format(new Date(match.utcDate), 'HH:mm')}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={match.homeTeam.crest} 
                  alt={match.homeTeam.name} 
                  className="w-6 h-6"
                />
                <span className="font-medium">{match.homeTeam.shortName}</span>
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
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 