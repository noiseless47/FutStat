'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { SharedImage } from "@/components/shared-image"
import { format } from 'date-fns'
import { MatchDetailsModal } from "@/components/ui/match-details-modal"

interface RecentMatchesProps {
  teamId: number
}

interface Match {
  id: number
  startTimestamp: number
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
  }
  awayScore: {
    current: number
  }
  tournament: {
    uniqueTournament: {
      id: number
      name: string
    }
    category: {
      name: string
    }
  }
  roundInfo?: {
    round: number
    name?: string
  }
  status: {
    type: string
  }
}

export function RecentMatches({ teamId }: RecentMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true)
        // Get upcoming matches
        const upcomingResponse = await fetch(
          `https://api.sofascore.com/api/v1/team/${teamId}/events/next/0`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        const upcomingData = await upcomingResponse.json()
        console.log('Upcoming matches:', upcomingData)

        // Get past matches
        const pastResponse = await fetch(
          `https://api.sofascore.com/api/v1/team/${teamId}/events/last/0`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        const pastData = await pastResponse.json()
        console.log('Past matches:', pastData)

        // Combine and set matches - keep upcoming matches in ascending order first, then take first 2, then reverse them
        const upcomingMatches = (upcomingData.events || [])
          .sort((a: Match, b: Match) => a.startTimestamp - b.startTimestamp)
          .slice(0, 2)
          .reverse()
        const pastMatches = (pastData.events || []).reverse().slice(0, 8)
        setMatches([...upcomingMatches, ...pastMatches])
      } catch (error) {
        console.error('Error loading matches:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
  }, [teamId])

  if (loading) return <div>Loading matches...</div>
  if (!matches.length) return <div>No matches found</div>

  const upcomingMatches = matches.filter(match => match.status.type !== 'finished').slice(0, 2)
  const completedMatches = matches.filter(match => match.status.type === 'finished').slice(0, 8)

  const handleMatchClick = (matchId: number) => {
    setSelectedMatchId(matchId)
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Matches</h2>
      </div>

      <div className="space-y-4 p-4">
        {/* Upcoming Matches Section */}
        {upcomingMatches.length > 0 && (
          <div>
            <div className="text-sm text-muted-foreground mb-2">Upcoming</div>
            <div className="divide-y">
              {upcomingMatches.map(match => (
                <div 
                  key={match.id} 
                  className="py-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleMatchClick(match.id)}
                >
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <SharedImage 
                      type="league" 
                      id={match.tournament.uniqueTournament.id} 
                      className="w-4 h-4" 
                      alt={match.tournament.uniqueTournament.name}
                    />
                    <span>{match.tournament.uniqueTournament.name}</span>
                    {match.roundInfo && (
                      <>
                        <span className="mx-1">·</span>
                        <span>
                          {match.roundInfo.name || `Round ${match.roundInfo.round}`}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-right">{match.homeTeam.shortName}</span>
                    <SharedImage 
                      type="team" 
                      id={match.homeTeam.id} 
                      className="w-10 h-10" 
                      alt={match.homeTeam.name}
                    />
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(match.startTimestamp * 1000), 'MMM d')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(match.startTimestamp * 1000), 'HH:mm')}
                      </div>
                    </div>
                    <SharedImage 
                      type="team" 
                      id={match.awayTeam.id} 
                      className="w-10 h-10" 
                      alt={match.awayTeam.name}
                    />
                    <span className="w-24 text-left">{match.awayTeam.shortName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Matches */}
        <div>
          <div className="text-sm text-muted-foreground mb-2">Completed</div>
          <div className="divide-y">
            {completedMatches.map(match => {
              const homeWon = match.homeScore.current > match.awayScore.current;
              const awayWon = match.awayScore.current > match.homeScore.current;
              
              return (
                <div 
                  key={match.id} 
                  className="py-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleMatchClick(match.id)}
                >
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <SharedImage 
                      type="league" 
                      id={match.tournament.uniqueTournament.id} 
                      className="w-4 h-4" 
                      alt={match.tournament.uniqueTournament.name}
                    />
                    <span>{match.tournament.uniqueTournament.name}</span>
                    {match.roundInfo && (
                      <>
                        <span className="mx-1">·</span>
                        <span>
                          {match.roundInfo.name || `Round ${match.roundInfo.round}`}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`w-24 text-right ${homeWon ? 'font-bold' : ''}`}>
                      {match.homeTeam.shortName}
                    </span>
                    <SharedImage 
                      type="team" 
                      id={match.homeTeam.id} 
                      className="w-10 h-10" 
                      alt={match.homeTeam.name}
                    />
                    <div className="flex flex-col items-center">
                      <div className="text-base">
                        <span className={homeWon ? 'font-bold' : ''}>
                          {match.homeScore.current}
                        </span>
                        {' - '}
                        <span className={awayWon ? 'font-bold' : ''}>
                          {match.awayScore.current}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">FT</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(match.startTimestamp * 1000), 'MMM d')}
                      </div>
                    </div>
                    <SharedImage 
                      type="team" 
                      id={match.awayTeam.id} 
                      className="w-10 h-10" 
                      alt={match.awayTeam.name}
                    />
                    <span className={`w-24 text-left ${awayWon ? 'font-bold' : ''}`}>
                      {match.awayTeam.shortName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedMatchId && (
        <MatchDetailsModal
          matchId={selectedMatchId}
          isOpen={!!selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </Card>
  )
} 