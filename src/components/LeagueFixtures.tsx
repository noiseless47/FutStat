'use client'

import { SharedImage } from '@/components/ui/shared-image';
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"


import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LeagueFixturesProps {
  leagueId: number
  seasonId: number
}

interface Match {
  id: number
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
  round: {
    round: number
  }
}

export function LeagueFixtures({ leagueId, seasonId }: LeagueFixturesProps) {
  const [fixtures, setFixtures] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRound, setCurrentRound] = useState<number | null>(null)
  const [totalRounds, setTotalRounds] = useState(38)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  useEffect(() => {
    const loadCurrentRound = async () => {
      try {
        const response = await fetch(
          `https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${seasonId}/rounds`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        const data = await response.json()
        const currentRoundData = data.currentRound
        setCurrentRound(currentRoundData.round)
        setTotalRounds(data.rounds.length)
      } catch (error) {
        console.error('Error loading current round:', error)
        setCurrentRound(1) // Fallback to round 1 if error
      }
    }

    loadCurrentRound()
  }, [leagueId, seasonId])

  useEffect(() => {
    const loadFixtures = async () => {
      if (currentRound === null) return

      try {
        setLoading(true)
        const response = await fetch(
          `https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${seasonId}/events/round/${currentRound}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        const data = await response.json()
        setFixtures(data.events || [])
      } catch (error) {
        console.error('Error loading fixtures:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFixtures()
  }, [leagueId, seasonId, currentRound])

  useEffect(() => {
    if (fixtures.length > 0 && !selectedMatch) {
      const upcomingMatch = fixtures.find(match => 
        match.status.type !== 'finished'
      ) || fixtures[0]
      setSelectedMatch(upcomingMatch)
    }
  }, [fixtures])

  // Unused: const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1)

  if (loading || currentRound === null) return <div>Loading fixtures...</div>

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Fixtures List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Fixtures</h2>
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentRound(prev => prev ? Math.max(1, prev - 1) : 1)}
            disabled={currentRound <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">Round {currentRound}</h3>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentRound(prev => prev ? Math.min(38, prev + 1) : 1)}
            disabled={currentRound >= 38}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {fixtures.map((match) => {
            const isPast = match.status.type === 'finished'
            const isLive = match.status.type === 'inprogress'
            const isSelected = selectedMatch?.id === match.id
            
            return (
              <div 
                key={match.id} 
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedMatch(match)}
              >
                <div className="text-sm text-muted-foreground text-center mb-2">
                  {format(match.startTimestamp * 1000, 'EEE, d MMM')}
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm">{match.homeTeam.shortName}</span>
                    <SharedImage type="team" id={match.homeTeam.id} className="w-8 h-8" alt="" />
                  </div>
                  <div className="text-center">
                    {isPast ? (
                      <div className="text-center">
                        <div className="font-medium">{match.homeScore?.current} - {match.awayScore?.current}</div>
                        <div className="text-xs text-muted-foreground">FT</div>
                      </div>
                    ) : isLive ? (
                      <span className="text-red-500">LIVE</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {format(match.startTimestamp * 1000, 'HH:mm')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <SharedImage type="team" id={match.awayTeam.id} className="w-8 h-8" alt="" />
                    <span className="text-sm">{match.awayTeam.shortName}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Match Details */}
      <Card className="p-6">
        {selectedMatch ? (
          <div>
            <div className="text-center mb-6">
              <div className="text-sm text-muted-foreground">
                {format(selectedMatch.startTimestamp * 1000, 'EEEE, d MMMM yyyy')}
              </div>
              <div className="flex items-center justify-center gap-8 mt-4">
                <div className="text-center">
                  <SharedImage type="team" id={selectedMatch.homeTeam.id} className="w-24 h-24 mx-auto mb-2" alt="" />
                  <div className="font-medium">{selectedMatch.homeTeam.name}</div>
                </div>
                <div className="text-3xl font-bold">
                  {selectedMatch.status.type === 'finished' ? (
                    `${selectedMatch.homeScore?.current} - ${selectedMatch.awayScore?.current}`
                  ) : (
                    <span className="text-xl text-muted-foreground">
                      {format(selectedMatch.startTimestamp * 1000, 'HH:mm')}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <SharedImage type="team" id={selectedMatch.awayTeam.id} className="w-24 h-24 mx-auto mb-2" alt="" />
                  <div className="font-medium">{selectedMatch.awayTeam.name}</div>
                </div>
              </div>
            </div>
            {/* Add more match details here like stats, lineups etc */}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Select a match to view details
          </div>
        )}
      </Card>
    </div>
  )
} 