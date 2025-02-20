'use client'

import { useEffect, useState, use } from 'react'
import { fetchPlayerDetails, fetchPlayerAttributes, fetchPlayerStatistics, fetchPlayerRecentMatches, fetchPlayerTournaments } from '@/lib/sofascore-api'
import { type Player } from '@/lib/types'
import { Card } from "@/components/ui/card"
import { format } from 'date-fns'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchDetailsModal } from "@/components/ui/match-details-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const getColorForValue = (value: number) => {
  if (value >= 80) return '#3b82f6' // Blue
  if (value >= 70) return '#22c55e' // Green
  if (value >= 65) return '#eab308' // Yellow
  if (value >= 60) return '#f97316' // Orange
  return '#ef4444' // Red
}

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [player, setPlayer] = useState<Player | null>(null)
  const [attributes, setAttributes] = useState<any>(null)
  const [statistics, setStatistics] = useState<any>(null)
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTournament, setSelectedTournament] = useState<any>(null)
  const [selectedSeason, setSelectedSeason] = useState<any>(null)
  const [seasons, setSeasons] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [playerData, attributesData, tournamentsData, matchesData] = await Promise.all([
          fetchPlayerDetails(parseInt(resolvedParams.id)),
          fetchPlayerAttributes(parseInt(resolvedParams.id)),
          fetchPlayerTournaments(parseInt(resolvedParams.id)),
          fetchPlayerRecentMatches(parseInt(resolvedParams.id))
        ])
        
        console.log('Player data:', playerData)
        console.log('Attributes data:', attributesData)
        console.log('Tournaments data:', tournamentsData)
        console.log('Matches data:', matchesData)

        if (!tournamentsData) {
          console.warn('No tournaments data available for player')
        }

        // Fetch statistics for each match
        const matchesWithStats = await Promise.all(
          matchesData?.map(async (match: any) => {
            try {
              const statsResponse = await fetch(
                `https://api.sofascore.com/api/v1/event/${match.id}/player/${resolvedParams.id}/statistics`,
                {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                  }
                }
              )
              const statsData = await statsResponse.json()
              return {
                ...match,
                playerStatistics: statsData.statistics
              }
            } catch (error) {
              console.error('Error fetching match statistics:', error)
              return match
            }
          }) || []
        )

        console.log('Matches with stats:', matchesWithStats)
        setRecentMatches(matchesWithStats || [])

        setPlayer(playerData)
        setAttributes(attributesData)
        setTournaments(tournamentsData || [])

        // Set default tournament (primary league)
        const primaryTournament = tournamentsData?.find((t: any) => 
          t.id === playerData?.team?.primaryUniqueTournament?.id
        )
        if (primaryTournament) {
          setSelectedTournament(primaryTournament)
          
          try {
            const seasonResponse = await fetch(
              `https://api.sofascore.com/api/v1/unique-tournament/${primaryTournament.id}/seasons`,
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
              }
            )
            const seasonData = await seasonResponse.json()
            
            // Get all seasons with stats
            const seasonsWithStats = await Promise.all(
              seasonData.seasons.map(async (season: any) => {
                try {
                  const statsResponse = await fetch(
                    `https://api.sofascore.com/api/v1/player/${resolvedParams.id}/unique-tournament/${primaryTournament.id}/season/${season.id}/statistics/overall`,
                    {
                      headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                      }
                    }
                  )
                  const statsData = await statsResponse.json()
                  return statsData.statistics ? season : null
                } catch {
                  return null
                }
              })
            )

            const validSeasons = seasonsWithStats.filter(season => season !== null)
            setSeasons(validSeasons)

            // Find current season or most recent one
            const currentSeason = validSeasons.find(s => s.status === 'ACTIVE') || validSeasons[0]
            if (currentSeason) {
              setSelectedSeason(currentSeason)
              
              // Fetch stats for selected season
              const statsResponse = await fetch(
                `https://api.sofascore.com/api/v1/player/${resolvedParams.id}/unique-tournament/${primaryTournament.id}/season/${currentSeason.id}/statistics/overall`,
                {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                  }
                }
              )
              const statsData = await statsResponse.json()
              setStatistics(statsData.statistics)
            }
          } catch (error) {
            console.error('Error loading initial season data:', error)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [resolvedParams.id])

  // Add this effect to handle tournament/season changes
  useEffect(() => {
    const loadStatsForSelection = async () => {
      if (!selectedTournament || !selectedSeason) return;

      try {
        console.log('Loading stats for:', {
          tournament: selectedTournament,
          season: selectedSeason,
          playerId: resolvedParams.id
        });

        const statsResponse = await fetch(
          `https://api.sofascore.com/api/v1/player/${resolvedParams.id}/unique-tournament/${selectedTournament.id}/season/${selectedSeason.id}/statistics/overall`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        );

        if (!statsResponse.ok) {
          console.error('Failed to fetch stats:', await statsResponse.text());
          return;
        }

        const statsData = await statsResponse.json();
        console.log('New stats data:', statsData);
        setStatistics(statsData.statistics);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStatsForSelection();
  }, [selectedTournament, selectedSeason, resolvedParams.id]);

  if (loading) return <div>Loading...</div>
  if (!player) return <div>Player not found</div>

  // Calculate age from timestamp
  const age = Math.floor((Date.now() - player.dateOfBirthTimestamp * 1000) / (365.25 * 24 * 60 * 60 * 1000))

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-3 gap-6">
        {/* Player Details - 4/5 width */}
        <div className="col-span-2">
          <Card className="p-6 space-y-6">
            {/* Player Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <img 
                  src={`https://api.sofascore.com/api/v1/player/${player.id}/image`}
                  alt={player.name}
                  className="w-32 h-32 rounded-full"
                />
                <div>
                  <h1 className="text-3xl font-bold">{player.name}</h1>
                  {player.team && (
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://api.sofascore.com/api/v1/team/${player.team.id}/image`}
                          alt={player.team.name}
                          className="w-5 h-5"
                        />
                        <span>{player.team.name}</span>
                      </div>
                      {player.country && (
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://flagcdn.com/${player.country.alpha2.toLowerCase()}.svg`}
                            alt={player.country.name}
                            className="w-5 h-5 rounded-sm"
                          />
                          <span>{player.country.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {player.proposedMarketValue && (
                <div className="text-2xl font-bold text-amber-500">
                  €{(player.proposedMarketValue / 1000000).toFixed(2)}M
                </div>
              )}
            </div>

            {/* Player Info Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Position</div>
                <div className="text-lg mt-1">{player.position}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Age</div>
                <div className="text-lg mt-1">{age} yrs</div>
                <div className="text-xs text-muted-foreground">{format(new Date(player.dateOfBirthTimestamp * 1000), 'PP')}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Height</div>
                <div className="text-lg mt-1">{player.height} cm</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Jersey</div>
                <div className="text-lg mt-1">{player.jerseyNumber}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Foot</div>
                <div className="text-lg mt-1">{player.preferredFoot}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Contract Until</div>
                <div className="text-lg mt-1">{format(new Date(player.contractUntilTimestamp * 1000), 'MMM yyyy')}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Player Attributes - 2/5 width */}
        <div className="col-span-1">
          {attributes && attributes.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Player Attributes</h2>
              <div className="h-[245px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="60%" outerRadius="80%" data={[
                    {
                      name: 'ATT',
                      value: attributes[0].attacking,
                    },
                    {
                      name: 'TEC',
                      value: attributes[0].technical,
                    },
                    {
                      name: 'TAC',
                      value: attributes[0].tactical,
                    },
                    {
                      name: 'DEF',
                      value: attributes[0].defending,
                    },
                    {
                      name: 'CRE',
                      value: attributes[0].creativity,
                    },
                  ]}>
                    <PolarGrid 
                      gridType="polygon"
                      radialLines={false}
                      stroke="hsl(var(--border))"
                    />
                    <PolarAngleAxis 
                      dataKey="name" 
                      tick={({ payload, x, y, textAnchor }) => {
                        const attributeMap: Record<string, string> = {
                          'ATT': 'attacking',
                          'TEC': 'technical',
                          'TAC': 'tactical',
                          'DEF': 'defending',
                          'CRE': 'creativity'
                        }
                        
                        const value = attributes[0][attributeMap[payload.value]]
                        const color = getColorForValue(value)
                        return (
                          <g>
                            <text
                              x={x}
                              y={y}
                              dy={-16}
                              textAnchor={textAnchor}
                              fill={color}
                              className="text-sm font-bold"
                            >
                              {value}
                            </text>
                            <text
                              x={x}
                              y={y}
                              textAnchor={textAnchor}
                              className="text-sm font-medium fill-muted-foreground"
                            >
                              {payload.value}
                            </text>
                          </g>
                        )
                      }}
                    />
                    <Radar
                      name="Player"
                      dataKey="value"
                      stroke={getColorForValue(Math.max(
                        attributes[0].attacking,
                        attributes[0].technical,
                        attributes[0].tactical,
                        attributes[0].defending,
                        attributes[0].creativity
                      ))}
                      strokeWidth={2}
                      fill={getColorForValue(Math.max(
                        attributes[0].attacking,
                        attributes[0].technical,
                        attributes[0].tactical,
                        attributes[0].defending,
                        attributes[0].creativity
                      ))}
                      fillOpacity={0.15}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Statistics Section */}
      {(
        <div className="mt-6 grid grid-cols-3 gap-6">
          {/* Season Statistics - 2/3 width */}
          <div className="col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Season Statistics
                  {selectedTournament && selectedSeason && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {selectedTournament.name} • {selectedSeason.name}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedTournament?.id?.toString()}
                    onValueChange={async (value) => {
                      console.log('Selected tournament:', value);
                      const tournament = tournaments.find(t => t.id.toString() === value);
                      setSelectedTournament(tournament);

                      // Load seasons for this tournament
                      try {
                        const seasonResponse = await fetch(
                          `https://api.sofascore.com/api/v1/unique-tournament/${value}/seasons`,
                          {
                            headers: {
                              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                            }
                          }
                        );
                        const seasonData = await seasonResponse.json();
                        
                        // Filter seasons by checking if player has statistics
                        const seasonsWithStats = await Promise.all(
                          seasonData.seasons.map(async (season: any) => {
                            try {
                              const statsResponse = await fetch(
                                `https://api.sofascore.com/api/v1/player/${resolvedParams.id}/unique-tournament/${value}/season/${season.id}/statistics/overall`,
                                {
                                  headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                                  }
                                }
                              );
                              const statsData = await statsResponse.json();
                              return statsData.statistics ? season : null;
                            } catch {
                              return null;
                            }
                          })
                        );

                        // Filter out null values (seasons without stats)
                        const validSeasons = seasonsWithStats.filter(season => season !== null);
                        console.log('Seasons with stats:', validSeasons);
                        setSeasons(validSeasons);
                        
                        // Set current season if available
                        const currentSeason = validSeasons.find((s: any) => s.status === 'ACTIVE');
                        if (currentSeason) {
                          setSelectedSeason(currentSeason);
                        } else if (validSeasons.length > 0) {
                          // If no active season, select the most recent one
                          setSelectedSeason(validSeasons[0]);
                        }
                      } catch (error) {
                        console.error('Error loading seasons:', error);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select tournament" />
                    </SelectTrigger>
                    <SelectContent>
                      {tournaments.map((tournament: any) => (
                        <SelectItem 
                          key={tournament.id} 
                          value={tournament.id.toString()}
                        >
                          {tournament.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedSeason?.id?.toString()}
                    onValueChange={(value) => {
                      const season = seasons.find(s => s.id.toString() === value)
                      setSelectedSeason(season)
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons
                        .sort((a, b) => b.year.localeCompare(a.year))
                        .slice(0, 5)
                        .map((season: any) => (
                          <SelectItem 
                            key={season.id} 
                            value={season.id.toString()}
                          >
                            {season.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {statistics ? (
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="overview">Matches</TabsTrigger>
                    <TabsTrigger value="attack">Attack</TabsTrigger>
                    <TabsTrigger value="passing">Passing</TabsTrigger>
                    <TabsTrigger value="defense">Defense</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <div className="text-2xl font-bold">{statistics.appearances}</div>
                        <div className="text-sm text-muted-foreground">Total played</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.matchesStarted}</div>
                        <div className="text-sm text-muted-foreground">Started</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{(statistics.minutesPlayed / statistics.appearances).toFixed(0)}'</div>
                        <div className="text-sm text-muted-foreground">Minutes per game</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.minutesPlayed}'</div>
                        <div className="text-sm text-muted-foreground">Total minutes played</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <div className="text-2xl font-bold">{statistics.yellowCards || 0}</div>
                        <div className="text-sm text-muted-foreground">Yellow cards</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.redCards || 0}</div>
                        <div className="text-sm text-muted-foreground">Red cards</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.totwAppearances || 0}</div>
                        <div className="text-sm text-muted-foreground">TOTW Appearances</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.rating?.toFixed(2) || '-'}</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="attack" className="space-y-6">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <div className="text-2xl font-bold">{statistics.goals}</div>
                        <div className="text-sm text-muted-foreground">Goals</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.assists}</div>
                        <div className="text-sm text-muted-foreground">Assists</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{(statistics.goalConversionPercentage || 0).toFixed(2)}%</div>
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{(statistics.minutesPerGoal || 0).toFixed(0)}'</div>
                        <div className="text-sm text-muted-foreground">Mins per Goal</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.totalShots}</div>
                        <div className="text-sm text-muted-foreground">Total Shots</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.shotsOnTarget}</div>
                        <div className="text-sm text-muted-foreground">On Target</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{((statistics.shotsOnTarget / statistics.totalShots) * 100).toFixed(2)}%</div>
                        <div className="text-sm text-muted-foreground">Shot Accuracy</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.bigChancesMissed || 0}</div>
                        <div className="text-sm text-muted-foreground">Big Chances Missed</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="passing" className="space-y-6">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <div className="text-2xl font-bold">{statistics.totalPasses}</div>
                        <div className="text-sm text-muted-foreground">Total Passes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{(statistics.accuratePassesPercentage || 0).toFixed(2)}%</div>
                        <div className="text-sm text-muted-foreground">Pass Accuracy</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.keyPasses}</div>
                        <div className="text-sm text-muted-foreground">Key Passes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.touches}</div>
                        <div className="text-sm text-muted-foreground">Touches</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.accurateCrosses}</div>
                        <div className="text-sm text-muted-foreground">Accurate Crosses</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{(statistics.accurateLongBalls || 0)}</div>
                        <div className="text-sm text-muted-foreground">Accurate Long Balls</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.bigChancesCreated || 0}</div>
                        <div className="text-sm text-muted-foreground">Big Chances Created</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.assists || 0}</div>
                        <div className="text-sm text-muted-foreground">Assists</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="defense" className="space-y-6">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <div className="text-2xl font-bold">{statistics.tacklesWon} ({(statistics.tacklesWonPercentage || 0).toFixed(2)}%)</div>
                        <div className="text-sm text-muted-foreground">Tackles Won</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.interceptions}</div>
                        <div className="text-sm text-muted-foreground">Interceptions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.clearances}</div>
                        <div className="text-sm text-muted-foreground">Clearances</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{(statistics.clearances/statistics.appearances || 0).toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Clearances per Game</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.aerialDuelsWon} ({(statistics.aerialDuelsWonPercentage || 0).toFixed(2)}%)</div>
                        <div className="text-sm text-muted-foreground">Aerials Won</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{(statistics.tackles/statistics.appearances || 0).toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Tackles per Game</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{(statistics.interceptions/statistics.appearances || 0).toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Interceptions per Game</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{statistics.groundDuelsWon} ({(statistics.groundDuelsWonPercentage || 0).toFixed(2)}%)</div>
                        <div className="text-sm text-muted-foreground">Ground Duels Won</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedTournament && selectedSeason ? 
                    "No statistics available for this season" :
                    "Select a tournament and season to view statistics"
                  }
                </div>
              )}
            </Card>
          </div>

          {/* Recent Matches - 1/3 width */}
          <div className="col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
              <div className="space-y-3">
                {recentMatches
                  .sort((a, b) => b.startTimestamp - a.startTimestamp)
                  .slice(0, 10)
                  .map((match: any) => {
                    const stats = match.playerStatistics;
                    
                    return (
                      <div 
                        key={match.id} 
                        className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedMatch(match)}
                      >
                        {/* Left side - Match score */}
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <img 
                            src={`https://api.sofascore.com/api/v1/team/${match.homeTeam.id}/image`}
                            alt={match.homeTeam.name}
                            className="w-5 h-5"
                          />
                          <span className={`w-6 text-right ${match.homeTeam.id === player?.team?.id ? "font-semibold" : ""}`}>
                            {match.homeScore.current}
                          </span>
                          <span>-</span>
                          <span className={`w-6 ${match.awayTeam.id === player?.team?.id ? "font-semibold" : ""}`}>
                            {match.awayScore.current}
                          </span>
                          <img 
                            src={`https://api.sofascore.com/api/v1/team/${match.awayTeam.id}/image`}
                            alt={match.awayTeam.name}
                            className="w-5 h-5"
                          />
                        </div>

                        {/* Right side - Stats and date */}
                        <div className="flex items-center gap-2">
                          {/* Stats badges */}
                          <div className="flex items-center gap-1 min-w-[100px] justify-end">
                            {stats && (
                              <>
                                {stats.goals > 0 && (
                                  <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                    {stats.goals}⚽
                                  </span>
                                )}
                                {stats.goalAssist > 0 && (
                                  <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                    {stats.goalAssist}🅰️
                                  </span>
                                )}
                                {stats.yellowCards > 0 && (
                                  <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                    {stats.yellowCards}🟨
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          {/* Rating */}
                          {stats?.rating && (
                            <div className={`min-w-[40px] text-center text-sm font-semibold px-1.5 py-0.5 rounded ${
                              stats.rating >= 8 ? 'bg-blue-100 text-blue-700' :
                              stats.rating >= 7 ? 'bg-green-100 text-green-700' :
                              stats.rating >= 6 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {stats.rating.toFixed(1)}
                            </div>
                          )}

                          {/* Date */}
                          <div className="text-sm text-muted-foreground min-w-[60px] text-right">
                            {format(new Date(match.startTimestamp * 1000), 'MMM d')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {selectedMatch && (
        <MatchDetailsModal
          matchId={selectedMatch.id}
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          player={{
            statistics: selectedMatch.playerStatistics
          }}
        />
      )}
    </div>
  )
} 