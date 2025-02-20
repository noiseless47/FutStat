'use client'

import { SharedImage } from '@/components/shared-image'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CircularProgress } from "@/components/ui/circular-progress"
import { useTeamColors } from '@/hooks/use-team-colors'

interface LeagueFixturesProps {
  leagueId: number
  seasonId: number
  onMatchClick?: (match: any) => void
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
  round?: {
    round: number
  }
  venue?: {
    name: string
  }
  referee?: {
    name: string
  }
  tournament?: {
    uniqueTournament: {
      id: number
      name: string
    }
  }
}

interface Incident {
  id: number
  time: number
  isHome: boolean
  player: {
    name: string
  }
  playerOut?: {
    name: string
  }
  assist?: {
    name: string
  }
  incidentType: 'goal' | 'card' | 'substitution'
  incidentClass?: 'yellow' | 'red' | 'yellowRed'
}

export function LeagueFixtures({ leagueId, seasonId, onMatchClick }: LeagueFixturesProps) {
  const [fixtures, setFixtures] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRound, setCurrentRound] = useState<number | null>(null)
  const [totalRounds, setTotalRounds] = useState(38)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [matchStats, setMatchStats] = useState<any>(null)
  const [matchIncidents, setMatchIncidents] = useState<any>(null)

  const homeColors = useTeamColors(selectedMatch?.homeTeam?.id || 0)
  const awayColors = useTeamColors(selectedMatch?.awayTeam?.id || 0)

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

  const fetchMatchStats = async (matchId: number) => {
    try {
      const response = await fetch(`https://api.sofascore.com/api/v1/event/${matchId}/statistics`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      const data = await response.json()
      setMatchStats(data)
    } catch (error) {
      console.error('Error loading match statistics:', error)
    }
  }

  const fetchMatchIncidents = async (matchId: number) => {
    try {
      const response = await fetch(`https://api.sofascore.com/api/v1/event/${matchId}/incidents`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      const data = await response.json()
      setMatchIncidents(data.incidents)
    } catch (error) {
      console.error('Error loading match incidents:', error)
    }
  }

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

        <div className="space-y-2 max-h-[auto] overflow-y-auto pr-2">
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
                onClick={() => {
                  setSelectedMatch(match)
                  if (match.status.type === 'finished') {
                    fetchMatchStats(match.id)
                    fetchMatchIncidents(match.id)
                  }
                }}
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

            {/* Tabs for match info */}
            <Tabs defaultValue="info" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Match Info</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="max-h-[auto] overflow-y-auto">
                <div className="space-y-6 py-4">
                  {/* Match Events */}
                  {selectedMatch.status.type === 'finished' && matchIncidents && (
                    <div className="space-y-2 mb-6">
                      <h3 className="font-medium mb-2">Match Events</h3>
                      {matchIncidents
                        .filter((incident: any) => 
                          ['goal', 'card', 'substitution'].includes(incident.incidentType) && 
                          incident.player?.name // Only show incidents with valid player names
                        )
                        .map((incident: any) => (
                          <div 
                            key={incident.id} 
                            className={`flex items-center gap-2 ${incident.isHome ? '' : 'flex-row-reverse'}`}
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">{incident.time}'</span>
                              {incident.incidentType === 'goal' && incident.player?.name && (
                                <>
                                  <span>⚽</span>
                                  <span>{incident.player.name}</span>
                                  {incident.assist?.name && (
                                    <span className="text-muted-foreground text-xs">
                                      (assist: {incident.assist.name})
                                    </span>
                                  )}
                                </>
                              )}
                              {incident.incidentType === 'card' && incident.player?.name && (
                                <>
                                  <div 
                                    className={`w-3 h-4 ${
                                      incident.incidentClass === 'yellow' ? 'bg-yellow-500' : 
                                      incident.incidentClass === 'red' ? 'bg-red-500' : 
                                      'bg-red-500'
                                    }`}
                                  />
                                  <span>{incident.player.name}</span>
                                </>
                              )}
                              {incident.incidentType === 'substitution' && (
                                <>
                                  <span>🔄</span>
                                  {incident.player?.name && (
                                    <span className="text-green-600">{incident.player.name}</span>
                                  )}
                                  {incident.playerOut?.name && (
                                    <>
                                      <span className="text-muted-foreground mx-1">→</span>
                                      <span className="text-red-600">{incident.playerOut.name}</span>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Venue */}
                  {selectedMatch.venue?.name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Venue</span>
                      <span className="text-sm">{selectedMatch.venue.name}</span>
                    </div>
                  )}

                  {/* Referee */}
                  {selectedMatch.referee?.name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Referee</span>
                      <span className="text-sm">{selectedMatch.referee.name}</span>
                    </div>
                  )}

                  {/* Competition */}
                  {selectedMatch.tournament?.uniqueTournament && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Competition</span>
                      <div className="flex items-center gap-2">
                        <SharedImage 
                          type="league" 
                          id={selectedMatch.tournament.uniqueTournament.id} 
                          className="w-4 h-4" 
                          alt="" 
                        />
                        <span className="text-sm">{selectedMatch.tournament.uniqueTournament.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Round */}
                  {selectedMatch.round?.round && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Round</span>
                      <span className="text-sm">Matchday {selectedMatch.round.round}</span>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="stats" className="max-h-[850px] overflow-y-auto px-4">
                {selectedMatch.status.type === 'finished' && matchStats ? (
                  <div className="space-y-4 py-4">
                    {matchStats.statistics[0].groups.map((group: any) => (
                      <div key={group.groupName} className="mb-8">
                        <h3 className="text-base font-semibold mb-4">{group.groupName}</h3>
                        <div className="space-y-4">
                          {group.statisticsItems.map((stat: any) => (
                            <div key={stat.key}>
                              {stat.renderType === 2 ? (
                                <>
                                  <div className="flex items-center justify-between mb-2">
                                    <div style={{ color: homeColors.primary }} className="text-sm font-medium">
                                      {stat.homeValue}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">{stat.name}</div>
                                    <div style={{ color: awayColors.primary }} className="text-sm font-medium">
                                      {stat.awayValue}%
                                    </div>
                                  </div>
                                  <div className="flex h-2 bg-muted/30 rounded-full overflow-hidden">
                                    <div 
                                      className="transition-all duration-300"
                                      style={{ 
                                        backgroundColor: homeColors.primary,
                                        width: `${stat.homeValue}%` 
                                      }}
                                    />
                                    <div 
                                      className="transition-all duration-300"
                                      style={{ 
                                        backgroundColor: awayColors.primary,
                                        width: `${stat.awayValue}%` 
                                      }}
                                    />
                                  </div>
                                </>
                              ) : stat.renderType === 1 ? (
                                <div className="flex items-center justify-between">
                                  <div style={{ color: homeColors.primary }} className="text-base font-medium">
                                    {stat.home}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{stat.name}</div>
                                  <div style={{ color: awayColors.primary }} className="text-base font-medium">
                                    {stat.away}
                                  </div>
                                </div>
                              ) : stat.renderType === 3 && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div style={{ color: homeColors.primary }} className="text-base font-medium">
                                      {`${stat.homeValue}/${stat.homeTotal}`}
                                    </div>
                                    <CircularProgress 
                                      value={Math.round((stat.homeValue / stat.homeTotal!) * 100)} 
                                      size="lg"
                                      color={homeColors.primary}
                                    />
                                  </div>
                                  <div className="text-sm text-muted-foreground">{stat.name}</div>
                                  <div className="flex items-center gap-3 flex-row-reverse">
                                    <div style={{ color: awayColors.primary }} className="text-base font-medium">
                                      {`${stat.awayValue}/${stat.awayTotal}`}
                                    </div>
                                    <CircularProgress 
                                      value={Math.round((stat.awayValue / stat.awayTotal!) * 100)}
                                      size="lg"
                                      color={awayColors.primary}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    {selectedMatch.status.type === 'finished' 
                      ? 'No statistics available'
                      : 'Statistics will be available after the match'
                    }
                  </div>
                )}
              </TabsContent>
            </Tabs>
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