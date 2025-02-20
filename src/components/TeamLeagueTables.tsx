'use client'

import { SharedImage } from '@/components/shared-image';
import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { fetchLeagueStandings } from '@/lib/sofascore-api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TeamLeagueTablesProps {
  teamId: number
}

interface TeamData {
  primaryUniqueTournament: {
    id: number
    name: string
  }
  pregameForm?: {
    avgRating: string
    position: number
    value: string
    form: string[]
  }
  teamColors: {
    primary: string
    secondary: string
  }
}

interface StandingTeam {
  id: number
  position: number
  points: number
  // ... other existing fields
  rating?: string // Add rating field
}

interface UniqueTournament {
  name: string
  slug: string
  primaryColorHex: string
  secondaryColorHex: string
  id: number
  category: {
    name: string
    flag: string
  }
}

interface Season {
  name: string
  year: string
  id: number
}

interface TournamentWithSeasons {
  tournament: UniqueTournament
  seasons: Season[]
}

interface StandingRow {
  position: number
  team: {
    id: number
    name: string
  }
  matches: number
  wins: number
  draws: number
  losses: number
  scoresFor: number
  scoresAgainst: number
  points: number
}

interface LeagueStandingsData {
  standings: {
    name?: string  // Group name
    rows: StandingRow[]
  }[]
}

interface CupMatch {
  id: number
  homeTeam: {
    id: number
    name: string
    score?: number
  }
  awayTeam: {
    id: number
    name: string
    score?: number
  }
}

interface CupRound {
  name: string
  matches: CupMatch[]
}

interface CupTreeResponse {
  cupTrees: [{
    rounds: {
      order: number
      type: number
      description: string
      blocks: {
        blockId: number
        finished: boolean
        matchesInRound: number
        order: number
        participants: {
          team: {
            id: number
            name: string
            shortName: string
          }
          winner: boolean
          order: number
        }[]
        events: number[]
        result?: string
        homeTeamScore?: string
        awayTeamScore?: string
      }[]
    }[]
  }]
}

export function TeamLeagueTables({ teamId }: TeamLeagueTablesProps) {
  const [tournaments, setTournaments] = useState<TournamentWithSeasons[]>([])
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTournamentsAndSeasons = async () => {
      try {
        setLoading(true)
        // Fetch tournaments
        const tournamentsResponse = await fetch(
          `https://api.sofascore.com/api/v1/team/${teamId}/unique-tournaments`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        )
        const tournamentsData = await tournamentsResponse.json()

        // Fetch seasons for each tournament
        const tournamentsWithSeasons = await Promise.all(
          tournamentsData.uniqueTournaments.map(async (tournament: UniqueTournament) => {
            const seasonsResponse = await fetch(
              `https://api.sofascore.com/api/v1/unique-tournament/${tournament.id}/seasons`,
              { headers: { 'User-Agent': 'Mozilla/5.0' } }
            )
            const seasonsData = await seasonsResponse.json()
            return {
              tournament,
              seasons: seasonsData.seasons
            }
          })
        )

        setTournaments(tournamentsWithSeasons)
        // Set default selections
        if (tournamentsWithSeasons.length > 0) {
          setSelectedTournament(tournamentsWithSeasons[0].tournament.id)
          setSelectedSeason(tournamentsWithSeasons[0].seasons[0].id)
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTournamentsAndSeasons()
  }, [teamId])

  const selectedTournamentData = tournaments.find(t => t.tournament.id === selectedTournament)

  return (
    <Card className="p-4">
      <div className="space-y-6">
        {/* Tournament and Season Selection */}
        <div className="flex gap-4">
          <Select
            value={selectedTournament?.toString()}
            onValueChange={(value) => {
              const tournamentId = parseInt(value)
              setSelectedTournament(tournamentId)
              const seasons = tournaments.find(t => t.tournament.id === tournamentId)?.seasons
              if (seasons?.length) {
                setSelectedSeason(seasons[0].id)
              }
            }}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select Tournament">
                {selectedTournamentData && (
                  <div className="flex items-center gap-2">
                    <SharedImage
                      type="league"
                      id={selectedTournamentData.tournament.id}
                      className="w-5 h-5"
                      alt={selectedTournamentData.tournament.name}
                    />
                    <span>{selectedTournamentData.tournament.name}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tournaments.map(({ tournament }) => (
                <SelectItem 
                  key={tournament.id} 
                  value={tournament.id.toString()}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <SharedImage
                      type="league"
                      id={tournament.id}
                      className="w-5 h-5"
                      alt={tournament.name}
                    />
                    <span>{tournament.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTournamentData && (
            <Select
              value={selectedSeason?.toString()}
              onValueChange={(value) => setSelectedSeason(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Season" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                <div className="overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-accent scrollbar-track-muted">
                  {selectedTournamentData.seasons.map((season) => (
                    <SelectItem 
                      key={season.id} 
                      value={season.id.toString()}
                    >
                      {season.year}
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* League Table */}
        {selectedTournament && selectedSeason && (
          <LeagueTable
            tournamentId={selectedTournament}
            seasonId={selectedSeason}
            teamId={teamId}
          />
        )}
      </div>
    </Card>
  )
}

function LeagueTable({ tournamentId, seasonId, teamId }: { tournamentId: number; seasonId: number; teamId: number }) {
  const [standings, setStandings] = useState<LeagueStandingsData | null>(null)
  const [hasKnockouts, setHasKnockouts] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Check if knockouts exist
  useEffect(() => {
    const checkKnockouts = async () => {
      try {
        const response = await fetch(
          `https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/cuptrees`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          }
        )
        const data = await response.json()
        setHasKnockouts(!!data?.cupTrees?.[0]?.rounds?.length)
      } catch (error) {
        console.error('Error checking knockouts:', error)
        setHasKnockouts(false)
      }
    }

    checkKnockouts()
  }, [tournamentId, seasonId])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(false)
        const standingsResponse = await fetch(
          `https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/standings/total`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        
        if (!standingsResponse.ok) {
          // If no standings available, might be a cup competition
          return setError(true)
        }
        
        const data = await standingsResponse.json()
        
        if (!data.standings?.[0]?.rows?.length) {
          return setError(true)
        }
        
        setStandings(data)
      } catch (error) {
        console.error('Error loading standings:', error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tournamentId, seasonId])

  if (loading) return <div className="p-4 text-center">Loading...</div>
  if (error && !hasKnockouts) return (
    <div className="p-8 text-center text-muted-foreground">
      No standings available for this tournament
    </div>
  )
  if (!standings && !hasKnockouts) return (
    <div className="p-8 text-center text-muted-foreground">
      No data available for this tournament
    </div>
  )

  // If there's only standings or only knockouts, show without tabs
  if (!hasKnockouts) {
    return <StandingsTable standings={standings} teamId={teamId} />
  }
  if (error && hasKnockouts) {
    return <CupTree tournamentId={tournamentId} seasonId={seasonId} teamId={teamId} />
  }

  // Show both tabs if both are available
  return (
    <Tabs defaultValue="table" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="knockouts">Knockouts</TabsTrigger>
      </TabsList>
      <TabsContent value="table">
        <StandingsTable standings={standings} teamId={teamId} />
      </TabsContent>
      <TabsContent value="knockouts">
        <CupTree tournamentId={tournamentId} seasonId={seasonId} teamId={teamId} />
      </TabsContent>
    </Tabs>
  )
}

// Extract standings table to separate component
function StandingsTable({ standings, teamId }: { 
  standings: LeagueStandingsData | null, 
  teamId: number 
}) {
  if (!standings) return null

  return (
    <div className="space-y-8">
      {standings.standings.map((group, index) => (
        <div key={index} className="space-y-2">
          {group.name && (
            <h3 className="font-medium text-sm">{group.name}</h3>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Team</th>
                  <th className="p-2">MP</th>
                  <th className="p-2">W</th>
                  <th className="p-2">D</th>
                  <th className="p-2">L</th>
                  <th className="p-2">GF</th>
                  <th className="p-2">GA</th>
                  <th className="p-2">GD</th>
                  <th className="p-2">Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr 
                    key={row.team.id} 
                    className={`text-sm ${row.team.id === teamId ? 'bg-accent' : ''} hover:bg-muted/50`}
                  >
                    <td className="p-2">{row.position}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <SharedImage 
                          type="team" 
                          id={row.team.id} 
                          className="w-5 h-5" 
                          alt={row.team.name} 
                        />
                        <span>{row.team.name}</span>
                      </div>
                    </td>
                    <td className="text-center p-2">{row.matches}</td>
                    <td className="text-center p-2">{row.wins}</td>
                    <td className="text-center p-2">{row.draws}</td>
                    <td className="text-center p-2">{row.losses}</td>
                    <td className="text-center p-2">{row.scoresFor}</td>
                    <td className="text-center p-2">{row.scoresAgainst}</td>
                    <td className="text-center p-2">
                      {row.scoresFor - row.scoresAgainst > 0 
                        ? `+${row.scoresFor - row.scoresAgainst}` 
                        : row.scoresFor - row.scoresAgainst
                      }
                    </td>
                    <td className="text-center p-2 font-medium">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

function CupTree({ tournamentId, seasonId, teamId }: { tournamentId: number; seasonId: number; teamId: number }) {
  const [cupTree, setCupTree] = useState<CupTreeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(false)
        const response = await fetch(
          `https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/cuptrees`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('No cup tree available')
        }
        
        const data = await response.json()
        if (!data?.cupTrees?.[0]?.rounds) {
          throw new Error('Invalid cup tree data structure')
        }
        
        setCupTree(data)
      } catch (error) {
        console.error('Error loading cup tree:', error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tournamentId, seasonId])

  if (loading) return <div className="p-4 text-center">Loading knockout stages...</div>
  if (error || !cupTree?.cupTrees[0]?.rounds) return (
    <div className="p-8 text-center text-muted-foreground">
      No knockout stages available
    </div>
  )

  const renderMatchBlock = (block: any) => {
    const homeTeam = block.participants[0]?.team
    const awayTeam = block.participants[1]?.team

    // Function to get team abbreviation
    const getTeamAbbr = (team: any) => {
      if (!team) return 'TBD'
      // Common abbreviations
      const abbrs: { [key: string]: string } = {
        'Barcelona': 'BAR',
        'Real Madrid': 'RMA',
        'Atlético Madrid': 'ATM',
        'Athletic Club': 'ATH',
        'Valencia': 'VAL',
        'Sevilla': 'SEV',
        'Real Sociedad': 'RSO',
        'Villarreal': 'VIL',
        'Real Betis': 'BET',
        'Osasuna': 'OSA',
        // Add more as needed
      }
      return team.nameCode || abbrs[team.name] || team.shortName?.slice(0, 3).toUpperCase() || team.name.slice(0, 3).toUpperCase()
    }

    return (
      <div 
        key={block.blockId} 
        className="bg-accent/50 rounded-lg p-3 w-full max-w-[280px] mx-auto"
      >
        <div className="flex justify-between items-center gap-4">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center text-center">
            {homeTeam ? (
              <>
                <SharedImage 
                  type="team" 
                  id={homeTeam.id} 
                  className="w-8 h-8 mb-1" 
                  alt={homeTeam.name} 
                />
                <span className="text-xs font-medium">{getTeamAbbr(homeTeam)}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1" title={homeTeam.name}>
                  {homeTeam.name}
                </span>
                <span className={`text-sm font-medium mt-1 ${
                  block.participants[0]?.winner ? 'text-green-600 dark:text-green-400' : ''
                }`}>
                  {block.homeTeamScore || '0'}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">TBD</span>
            )}
          </div>

          {/* VS */}
          <div className="text-xs text-muted-foreground">vs</div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center text-center">
            {awayTeam ? (
              <>
                <SharedImage 
                  type="team" 
                  id={awayTeam.id} 
                  className="w-8 h-8 mb-1" 
                  alt={awayTeam.name} 
                />
                <span className="text-xs font-medium">{getTeamAbbr(awayTeam)}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1" title={awayTeam.name}>
                  {awayTeam.name}
                </span>
                <span className={`text-sm font-medium mt-1 ${
                  block.participants[1]?.winner ? 'text-green-600 dark:text-green-400' : ''
                }`}>
                  {block.awayTeamScore || '0'}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">TBD</span>
            )}
          </div>
        </div>

        {/* Match Date */}
        {block.events?.[0] && (
          <div className="text-center mt-2 border-t border-border pt-2">
            <span className="text-xs text-muted-foreground">
              {new Date(block.events[0] * 1000).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
        )}
      </div>
    )
  }

  // Find the first round where the team appears
  const teamFirstAppearanceRound = cupTree.cupTrees[0].rounds.find(round =>
    round.blocks.some(block =>
      block.participants.some(participant => participant.team.id === teamId)
    )
  )

  if (!teamFirstAppearanceRound) return (
    <div className="p-8 text-center text-muted-foreground">
      Not participated
    </div>
  )

  // Filter rounds to only show from team's first appearance onwards
  const relevantRounds = cupTree.cupTrees[0].rounds.filter(round => 
    round.order >= teamFirstAppearanceRound.order
  )

  return (
    <div className="space-y-8">
      {relevantRounds.map((round) => {
        const blocks = round.blocks.sort((a, b) => a.order - b.order)
        
        // Calculate number of columns based on round type
        const columns = Math.min(4, blocks.length) // Max 4 columns
        const columnClass = {
          1: 'grid-cols-1',  // Final
          2: 'grid-cols-2',  // Semi-finals
          4: 'grid-cols-4',  // Quarter-finals
          8: 'grid-cols-4',  // Round of 16
          16: 'grid-cols-4'  // Round of 32
        }[blocks.length] || 'grid-cols-4'

        return (
          <div key={round.order}>
            <h3 className="font-medium text-sm mb-4">{round.description}</h3>
            <div className={`grid ${columnClass} gap-4`}>
              {blocks.map(block => renderMatchBlock(block))}
            </div>
          </div>
        )
      })}
    </div>
  )
} 