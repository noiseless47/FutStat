import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { SharedImage } from "@/components/shared-image"
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CircularProgress } from "@/components/ui/circular-progress"
import { useTeamColors } from '@/hooks/use-team-colors'

interface MatchDetails {
  id: number
  startTimestamp: number
  status: {
    type: string
    description: string
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
    period1: number
    period2: number
  }
  awayScore: {
    current: number
    period1: number
    period2: number
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
  venue: {
    name: string
    city: {
      name: string
    }
  }
  referee?: {
    name: string
    country: {
      name: string
    }
  }
}

interface Incident {
  id: number
  time: number
  addedTime?: number
  isHome: boolean
  player: {
    id: number
    name: string
    shortName: string
  }
  assist?: {
    id: number
    name: string
    shortName: string
  }
  incidentType: 'goal' | 'card' | 'substitution' | 'var'
  incidentClass: 'yellow' | 'red' | 'yellowRed' | 'substitution' | 'goal' | 'penaltyGoal' | 'ownGoal' | 'varDecision'
  from?: 'penalty' | 'freekick' | 'ownGoal'
  text?: string
  reason?: string
}

interface StatisticItem {
  name: string
  home: string
  away: string
  comparePercentage?: {
    home: number
    away: number
  }
}

interface MatchStatistics {
  statistics: StatisticItem[]
}

interface StatGroup {
  groupName: string
  statisticsItems: {
    name: string
    home: string
    away: string
    compareCode: number
    homeValue: number
    awayValue: number
    homeTotal?: number
    awayTotal?: number
    renderType: number
    key: string
  }[]
}

interface StatisticsResponse {
  statistics: {
    period: string
    groups: StatGroup[]
  }[]
}

interface TeamStats {
  rating: number
  mvp: {
    name: string
    rating: number
    id: number
  }
  topPlayers: {
    name: string
    rating: number
    id: number
  }[]
  possession: number
  shotsOnTarget: number
  totalShots: number
  corners: number
  fouls: number
}

interface MatchDetailsModalProps {
  matchId: number
  isOpen: boolean
  onClose: () => void
  player?: any
}

export function MatchDetailsModal({ matchId, isOpen, onClose, player }: MatchDetailsModalProps) {
  const [details, setDetails] = useState<MatchDetails | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null)
  const [bestPlayers, setBestPlayers] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const homeColors = useTeamColors(details?.homeTeam?.id || 0)
  const awayColors = useTeamColors(details?.awayTeam?.id || 0)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // For upcoming matches, only fetch basic details
        const detailsResponse = await fetch(`https://api.sofascore.com/api/v1/event/${matchId}`, {
          headers: { 'User-Agent': '...' }
        })
        const detailsData = await detailsResponse.json()
        setDetails(detailsData.event)

        // Only fetch additional data for finished matches
        if (detailsData.event.status.type === 'finished') {
          const [statsResponse, incidentsResponse, bestPlayersResponse] = await Promise.all([
            fetch(`https://api.sofascore.com/api/v1/event/${matchId}/statistics`, {
              headers: { 'User-Agent': '...' }
            }),
            fetch(`https://api.sofascore.com/api/v1/event/${matchId}/incidents`, {
              headers: { 'User-Agent': '...' }
            }),
            fetch(`https://api.sofascore.com/api/v1/event/${matchId}/best-players/summary`, {
              headers: { 'User-Agent': '...' }
            })
          ])

          const [statsData, incidentsData, bestPlayersData] = await Promise.all([
            statsResponse.json(),
            incidentsResponse.json(),
            bestPlayersResponse.json()
          ])

          setStatistics(statsData)
          setIncidents(incidentsData.incidents)
          setBestPlayers(bestPlayersData)
        }
      } catch (error) {
        console.error('Error loading match data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && matchId) {
      loadData()
    }
  }, [matchId, isOpen])

  if (!details || loading) return null

  // Add null checks for required properties
  if (!details.tournament?.uniqueTournament?.name || 
      !details.homeTeam?.name || 
      !details.awayTeam?.name ||
      !details.venue?.name ||
      !details.venue?.city?.name) {
    return null
  }

  const isFinished = details.status.type === 'finished'
  const isUpcoming = details.status.type === 'notstarted'
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Fixed header section */}
        <div className="flex-none">
          <DialogTitle className="sr-only">
            {`${details.homeTeam.name} vs ${details.awayTeam.name}`}
          </DialogTitle>

          {/* Tournament & Round */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <SharedImage 
              type="league" 
              id={details.tournament.uniqueTournament.id} 
              className="w-5 h-5" 
              alt={details.tournament.uniqueTournament.name} 
            />
            <span>{details.tournament.uniqueTournament.name}</span>
            {details.roundInfo?.name && (
              <>
                <span>·</span>
                <span>{details.roundInfo.name || `Round ${details.roundInfo.round}`}</span>
              </>
            )}
          </div>

          {/* Teams and Score/Time */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-between w-full px-12">
              <div className="flex flex-col items-center gap-3">
                <SharedImage 
                  type="team" 
                  id={details.homeTeam.id} 
                  className="w-24 h-24" 
                  alt={details.homeTeam.name} 
                />
                <span className="text-base">{details.homeTeam.name}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold mb-1">
                  {isFinished ? (
                    `${details.homeScore?.current ?? 0} - ${details.awayScore?.current ?? 0}`
                  ) : (
                    format(new Date(details.startTimestamp * 1000), 'HH:mm')
                  )}
                </div>
                {isFinished && <div className="text-sm text-muted-foreground">FT</div>}
                {isUpcoming && (
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(details.startTimestamp * 1000), 'MMM d, yyyy')}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-3">
                <SharedImage 
                  type="team" 
                  id={details.awayTeam.id} 
                  className="w-24 h-24" 
                  alt={details.awayTeam.name} 
                />
                <span className="text-base">{details.awayTeam.name}</span>
              </div>
            </div>
          </div>
            </div>

        {/* Scrollable content section */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isFinished ? (
            <Tabs defaultValue={player?.statistics ? "player" : "team"} className="w-full">
              <TabsList className={`w-full grid ${player?.statistics ? 'grid-cols-4' : 'grid-cols-3'} mb-4`}>
                {player?.statistics && <TabsTrigger value="player" className="text-sm">Player Stats</TabsTrigger>}
                <TabsTrigger value="team" className="text-sm">Team Stats</TabsTrigger>
                <TabsTrigger value="events" className="text-sm">Events</TabsTrigger>
                <TabsTrigger value="stats" className="text-sm">Match Stats</TabsTrigger>
              </TabsList>

              {player?.statistics && (
                <TabsContent value="player" className="px-4">
                  <div className="space-y-6 py-4">
                    {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-accent/50 dark:bg-accent/20 rounded-lg">
                        <div className={`text-xl font-bold ${
                          player.statistics.rating >= 8 ? 'text-blue-600 dark:text-blue-400' :
                          player.statistics.rating >= 7 ? 'text-green-600 dark:text-green-400' :
                          player.statistics.rating >= 6 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {player.statistics.rating?.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
                      <div className="text-center p-3 bg-accent/50 dark:bg-accent/20 rounded-lg">
                        <div className="text-xl font-bold text-green-600">{player.statistics.goals || 0}</div>
                        <div className="text-sm text-muted-foreground">Goals</div>
                      </div>
                      <div className="text-center p-3 bg-accent/50 dark:bg-accent/20 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{player.statistics.goalAssist || 0}</div>
                        <div className="text-sm text-muted-foreground">Assists</div>
                      </div>
                      <div className="text-center p-3 bg-accent/50 dark:bg-accent/20 rounded-lg">
                        <div className="text-xl font-bold">{player.statistics.minutesPlayed}'</div>
                        <div className="text-sm text-muted-foreground">Minutes</div>
                      </div>
                      <div className="text-center p-3 bg-accent/50 dark:bg-accent/20 rounded-lg">
                        <div className="text-xl font-bold">{player.statistics.touches}</div>
                        <div className="text-sm text-muted-foreground">Touches</div>
                      </div>
                      <div className="text-center p-3 bg-accent/50 dark:bg-accent/20 rounded-lg">
                        <div className="text-xl font-bold">{player.statistics.totalPass}</div>
                        <div className="text-sm text-muted-foreground">Passes</div>
                      </div>
                    </div>

                    {/* Attack */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Attack</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Shots</span>
                          <span className="text-sm font-medium">
                            {(player.statistics.onTargetScoringAttempt || 0) + (player.statistics.shotOffTarget || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">On Target</span>
                          <span className="text-sm font-medium">{player.statistics.onTargetScoringAttempt}</span>
                        </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Expected Goals</span>
                          <span className="text-sm font-medium">{player.statistics.expectedGoals?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Expected Assists</span>
                          <span className="text-sm font-medium">{player.statistics.expectedAssists?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Big Chances Created</span>
                          <span className="text-sm font-medium">{player.statistics.bigChanceCreated}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Big Chances Missed</span>
                          <span className="text-sm font-medium">{player.statistics.bigChanceMissed}</span>
                  </div>
                </div>
              </div>

                    {/* Passing */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Passing</h3>
                      <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                          <span className="text-sm">Total Passes</span>
                          <span className="text-sm font-medium">{player.statistics.totalPass}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Accurate Passes</span>
                          <span className="text-sm font-medium">
                            {player.statistics.accuratePass} ({Math.round((player.statistics.accuratePass / player.statistics.totalPass) * 100)}%)
                          </span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Key Passes</span>
                          <span className="text-sm font-medium">{player.statistics.keyPass}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Crosses</span>
                          <span className="text-sm font-medium">
                            {player.statistics.accurateCross}/{player.statistics.totalCross}
                          </span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Long Balls</span>
                          <span className="text-sm font-medium">
                            {player.statistics.accurateLongBalls}/{player.statistics.totalLongBalls}
                          </span>
                  </div>
                </div>
              </div>

                    {/* Duels */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Duels</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Ground Duels Won</span>
                          <span className="text-sm font-medium">{player.statistics.duelWon}</span>
                        </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Ground Duels Lost</span>
                          <span className="text-sm font-medium">{player.statistics.duelLost}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Aerial Duels Won</span>
                          <span className="text-sm font-medium">{player.statistics.aerialWon}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Aerial Duels Lost</span>
                          <span className="text-sm font-medium">{player.statistics.aerialLost}</span>
                        </div>
                      </div>
                    </div>

                    {/* Defense */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Defense</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Interceptions</span>
                          <span className="text-sm font-medium">{player.statistics.interceptionWon}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Tackles</span>
                          <span className="text-sm font-medium">{player.statistics.challengeWon}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Fouls</span>
                          <span className="text-sm font-medium">{player.statistics.fouls}</span>
                  </div>
                  <div className="flex justify-between">
                          <span className="text-sm">Possession Lost</span>
                          <span className="text-sm font-medium">{player.statistics.possessionLostCtrl}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="team" className="px-4">
                <div className="space-y-6 py-4">
                  {/* Player of the Match */}
                  {bestPlayers?.playerOfTheMatch && (
                    <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 mb-8">
                      <div className="text-sm text-muted-foreground mb-2">Player of the Match</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-xl">👑</span>
                          </div>
                          <div>
                            <div className="font-medium">{bestPlayers.playerOfTheMatch.player.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {bestPlayers.playerOfTheMatch.player.position} · #{bestPlayers.playerOfTheMatch.player.jerseyNumber}
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {bestPlayers.playerOfTheMatch.value}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-8">
                    {/* Home Team */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SharedImage 
                            type="team" 
                            id={details.homeTeam.id} 
                            className="w-8 h-8" 
                            alt="" 
                          />
                          <span className="font-medium">{details.homeTeam.name}</span>
                        </div>
                      </div>

                      {/* Best Players */}
                      <div className="space-y-3">
                        {bestPlayers?.bestHomeTeamPlayers?.map((player: any) => (
                          <div key={player.player.id} className="bg-accent/50 dark:bg-accent/20 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium">
                                  {player.player.name}
                                  <span className="text-muted-foreground ml-2">
                                    {player.player.position} · #{player.player.jerseyNumber}
                                  </span>
                                </div>
                              </div>
                              <div className={`px-2 py-1 rounded text-sm font-medium ${
                                parseFloat(player.value) >= 8 
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                                  : parseFloat(player.value) >= 7 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                              }`}>
                                {player.value}
                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SharedImage 
                            type="team" 
                            id={details.awayTeam.id} 
                            className="w-8 h-8" 
                            alt="" 
                          />
                          <span className="font-medium">{details.awayTeam.name}</span>
              </div>
            </div>

                      {/* Best Players */}
                      <div className="space-y-3">
                        {bestPlayers?.bestAwayTeamPlayers?.map((player: any) => (
                          <div key={player.player.id} className="bg-accent/50 dark:bg-accent/20 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium">
                                  {player.player.name}
                                  <span className="text-muted-foreground ml-2">
                                    {player.player.position} · #{player.player.jerseyNumber}
                                  </span>
                                </div>
                              </div>
                              <div className={`px-2 py-1 rounded text-sm font-medium ${
                                parseFloat(player.value) >= 8 
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                                  : parseFloat(player.value) >= 7 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                              }`}>
                                {player.value}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="events">
                {/* Incidents Section */}
                {isFinished && incidents?.length > 0 && (
                  <div className="border-b py-4">
                    <div className="space-y-2">
                      {incidents
                        .filter(incident => 
                          ['goal', 'card', 'var'].includes(incident.incidentType) && 
                          incident.player?.name // Only include incidents with valid player names
                        )
                        .map(incident => (
                          <div 
                            key={incident.id} 
                            className={`flex items-center gap-2 px-4 ${incident.isHome ? '' : 'flex-row-reverse'}`}
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">
                                {incident.time}
                                {incident.addedTime ? `+${incident.addedTime}` : ''}'
                              </span>
                              {incident.incidentType === 'goal' && incident.player?.name && (
                                <>
                                  <span>⚽</span>
                                  <span>{incident.player.name}</span>
                                  {incident.from === 'penalty' && (
                                    <span className="text-muted-foreground text-xs">(P)</span>
                                  )}
                                  {incident.from === 'ownGoal' && (
                                    <span className="text-muted-foreground text-xs">(OG)</span>
                                  )}
                                  {incident.assist?.name && !incident.from && (
                                    <span className="text-muted-foreground text-xs ml-1">
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
                                  {incident.reason && (
                                    <span className="text-muted-foreground text-xs ml-1">
                                      ({incident.reason})
                                    </span>
                                  )}
                                </>
                              )}
                              {incident.incidentType === 'var' && incident.text && (
                                <>
                                  <span>📺</span>
                                  <span>{incident.text}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Match Details */}
                <div className="space-y-3 text-sm py-4 px-4">
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">Date</span>
                    <span>{format(new Date(details.startTimestamp * 1000), 'MMM d, yyyy')}</span>
                </div>

                  {/* Venue */}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">Venue</span>
                    <span>{details.venue.name}</span>
                </div>

                  {/* City */}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">City</span>
                    <span>{details.venue.city.name}</span>
                </div>

                  {/* Only show referee for finished matches */}
                  {isFinished && details.referee && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-20">Referee</span>
                      <span>
                        {details.referee.name}
                        <span className="text-muted-foreground ml-1">
                          ({details.referee.country.name})
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="stats" className="px-4">
                {statistics?.statistics[0].groups.map((group) => (
                  <div key={group.groupName} className="mb-8">
                    <h3 className="text-base font-semibold mb-4">{group.groupName}</h3>
                    <div className="space-y-4">
                      {group.statisticsItems.map((stat) => (
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
                              <div className="flex h-2 bg-muted/30 dark:bg-muted/10 rounded-full overflow-hidden">
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
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-3 text-sm py-4 px-4">
              {/* Venue */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-20">Venue</span>
                <span>{details.venue.name}</span>
              </div>

              {/* City */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-20">City</span>
                <span>{details.venue.city.name}</span>
              </div>
            </div>
          )}
          </div>
      </DialogContent>
    </Dialog>
  )
} 