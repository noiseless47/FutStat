import { SharedImage } from '@/components/ui/shared-image';
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { format } from 'date-fns'

interface Match {
  id: number
  tournament: {
    uniqueTournament: {
      id: number
      name: string
    }
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
  homeScore?: {
    current: number
  }
  awayScore?: {
    current: number
  }
  startTimestamp: number
  status: {
    type: string
  }
}

interface RecentMatchesProps {
  teamId: number
}

export function RecentMatches({ teamId }: RecentMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get past matches
        const pastMatchesResponse = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}/events/last/0`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        const pastMatchesData = await pastMatchesResponse.json()

        // Get upcoming matches
        const upcomingMatchesResponse = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}/events/next/0`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        const upcomingMatchesData = await upcomingMatchesResponse.json()

        // Filter and sort past matches
        const pastMatches = (pastMatchesData.events || [])
          .filter((match: Match) => {
            const matchDate = new Date(match.startTimestamp * 1000)
            const isCurrentSeason = matchDate > new Date('2023-07-01')
            return isCurrentSeason && match.status.type === 'finished'
          })
          .sort((a: Match, b: Match) => b.startTimestamp - a.startTimestamp)
          .slice(0, 8) // Take only last 8 matches

        // Get upcoming 2 matches
        const upcomingMatches = (upcomingMatchesData.events || [])
          .filter((match: Match) => match.status.type === 'notstarted')
          .slice(0, 2) // Take only next 2 matches

        // Combine matches with past matches first, then upcoming
        setMatches([...pastMatches, ...upcomingMatches])

        // Sort all matches by date (most recent first)
        setMatches(matches => 
          [...matches].sort((a, b) => b.startTimestamp - a.startTimestamp)
        )

      } catch (error) {
        console.error('Error loading matches:', error)
        setError('Failed to load matches')
      } finally {
        setIsLoading(false)
      }
    }

    loadMatches()
  }, [teamId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          Loading matches...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-red-500">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (matches.length === 0) return null

  const now = Date.now() / 1000 // Current timestamp in seconds

  return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Matches</h2>
        <span className="text-sm text-muted-foreground">
          {matches.length} matches
        </span>
      </div>
      <CardContent className="p-0 divide-y">
        {matches.map((match) => {
          const isUpcoming = match.startTimestamp > now
          const isPast = match.startTimestamp < now
          
          return (
            <div key={match.id} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                <SharedImage type="league" id={${match.tournament.uniqueTournament.id}} className="w-4 h-4" alt="" />
                <span>{match.tournament.uniqueTournament.name}</span>
                <span className="ml-auto">
                  {format(new Date(match.startTimestamp * 1000), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <SharedImage type="team" id={${match.homeTeam.id}} className="w-6 h-6" alt="" />
                  <span className={`${match.homeTeam.id === teamId ? "font-medium" : ""} ${
                    isPast && (match.homeScore?.current ?? 0) > (match.awayScore?.current ?? 0) ? "text-green-600" : 
                    isPast && (match.homeScore?.current ?? 0) < (match.awayScore?.current ?? 0) ? "text-red-600" : ""
                  }`}>
                    {match.homeTeam.shortName}
                  </span>
                </div>
                <div className="px-3 font-bold">
                  {isUpcoming ? (
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(match.startTimestamp * 1000), 'HH:mm')}
                    </span>
                  ) : (
                    <span className={
                      (match.homeScore?.current ?? 0) === (match.awayScore?.current ?? 0) ? "text-yellow-600" : ""
                    }>
                      {match.homeScore?.current ?? 0} - {match.awayScore?.current ?? 0}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1 justify-end text-right">
                  <span className={`${match.awayTeam.id === teamId ? "font-medium" : ""} ${
                    isPast && (match.awayScore?.current ?? 0) > (match.homeScore?.current ?? 0) ? "text-green-600" : 
                    isPast && (match.awayScore?.current ?? 0) < (match.homeScore?.current ?? 0) ? "text-red-600" : ""
                  }`}>
                    {match.awayTeam.shortName}
                  </span>
                  <SharedImage type="team" id={${match.awayTeam.id}} className="w-6 h-6" alt="" />
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
} 