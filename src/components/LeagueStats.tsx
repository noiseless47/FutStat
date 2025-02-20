'use client'

import { SharedImage } from '@/components/shared-image'
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeagueStatsProps {
  leagueId: number
  seasonId: number
}

interface PlayerStat {
  statistics: {
    rating: number
    goals?: number
    assists?: number
    yellowCards?: number
    redCards?: number
    appearances: number
  }
  player: {
    name: string
    id: number
    team: {
      name: string
      id: number
    }
  }
}

interface TeamStat {
  team: {
    name: string
    id: number
  }
  statistics: {
    avgRating: number
  }
}

interface TopPlayers {
  goals: PlayerStat[]
  assists: PlayerStat[]
  rating: PlayerStat[]
  yellowCards: PlayerStat[]
  redCards: PlayerStat[]
}

export function LeagueStats({ leagueId, seasonId }: LeagueStatsProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TopPlayers>({
    goals: [],
    assists: [],
    rating: [],
    yellowCards: [],
    redCards: []
  })
  const [teamStats, setTeamStats] = useState<TeamStat[]>([])
  const [selectedStat, setSelectedStat] = useState("goals")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const [playerResponse, teamResponse] = await Promise.all([
          fetch(
            `https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${seasonId}/top-players/overall`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            }
          ),
          fetch(
            `https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${seasonId}/top-teams/overall`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            }
          )
        ])

        const [playerData, teamData] = await Promise.all([
          playerResponse.json(),
          teamResponse.json()
        ])

        if (playerData.topPlayers) {
          setStats({
            goals: playerData.topPlayers.goals || [],
            assists: playerData.topPlayers.assists || [],
            rating: playerData.topPlayers.rating || [],
            yellowCards: playerData.topPlayers.yellowCards || [],
            redCards: playerData.topPlayers.redCards || []
          })
        }

        if (teamData.topTeams?.avgRating) {
          setTeamStats(teamData.topTeams.avgRating)
        }
      } catch (error) {
        console.error('Error loading stats:', error)
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [leagueId, seasonId])

  if (loading) return <div>Loading stats...</div>
  if (error) return <div>{error}</div>

  return (
    <Card className="p-6">
      <Tabs defaultValue="players">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="players">Player Stats</TabsTrigger>
          <TabsTrigger value="teams">Team Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="mt-4">
          <div className="space-y-6">
            <Select value={selectedStat} onValueChange={setSelectedStat}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select stat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goals">Goals</SelectItem>
                <SelectItem value="assists">Assists</SelectItem>
                <SelectItem value="yellow-cards">Yellow Cards</SelectItem>
                <SelectItem value="red-cards">Red Cards</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-4">
              {selectedStat === "goals" && stats.goals?.slice(0, 10).map((stat, index) => (
                <div key={`${stat.player?.id}-${index}`} className="flex items-center gap-4">
                  <span className="w-6 text-muted-foreground">{index + 1}</span>
                  <SharedImage type="player" id={stat.player?.id} className="w-8 h-8 rounded-full" alt="" />
                  <div className="flex-1">
                    <div className="font-medium">{stat.player?.name}</div>
                    <div className="text-sm text-muted-foreground">{stat.player?.team?.name}</div>
                  </div>
                  <div className="font-bold">{stat.statistics?.goals}</div>
                </div>
              ))}

              {selectedStat === "assists" && stats.assists?.slice(0, 10).map((stat, index) => (
                <div key={`${stat.player?.id}-${index}`} className="flex items-center gap-4">
                  <span className="w-6 text-muted-foreground">{index + 1}</span>
                  <SharedImage type="player" id={stat.player?.id} className="w-8 h-8 rounded-full" alt="" />
                  <div className="flex-1">
                    <div className="font-medium">{stat.player?.name}</div>
                    <div className="text-sm text-muted-foreground">{stat.player?.team?.name}</div>
                  </div>
                  <div className="font-bold">{stat.statistics?.assists}</div>
                </div>
              ))}

              {selectedStat === "yellow-cards" && stats.yellowCards?.slice(0, 10).map((stat, index) => (
                <div key={`${stat.player?.id}-${index}`} className="flex items-center gap-4">
                  <span className="w-6 text-muted-foreground">{index + 1}</span>
                  <SharedImage type="player" id={stat.player?.id} className="w-8 h-8 rounded-full" alt="" />
                  <div className="flex-1">
                    <div className="font-medium">{stat.player?.name}</div>
                    <div className="text-sm text-muted-foreground">{stat.player?.team?.name}</div>
                  </div>
                  <div className="font-bold text-yellow-500">{stat.statistics?.yellowCards}</div>
                </div>
              ))}

              {selectedStat === "red-cards" && stats.redCards?.slice(0, 10).map((stat, index) => (
                <div key={`${stat.player?.id}-${index}`} className="flex items-center gap-4">
                  <span className="w-6 text-muted-foreground">{index + 1}</span>
                  <SharedImage type="player" id={stat.player?.id} className="w-8 h-8 rounded-full" alt="" />
                  <div className="flex-1">
                    <div className="font-medium">{stat.player?.name}</div>
                    <div className="text-sm text-muted-foreground">{stat.player?.team?.name}</div>
                  </div>
                  <div className="font-bold text-red-500">{stat.statistics?.redCards}</div>
                </div>
              ))}

              {selectedStat === "rating" && stats.rating?.slice(0, 10).map((stat, index) => (
                <div key={`${stat.player?.id}-${index}`} className="flex items-center gap-4">
                  <span className="w-6 text-muted-foreground">{index + 1}</span>
                  <SharedImage type="player" id={stat.player?.id} className="w-8 h-8 rounded-full" alt="" />
                  <div className="flex-1">
                    <div className="font-medium">{stat.player?.name}</div>
                    <div className="text-sm text-muted-foreground">{stat.player?.team?.name}</div>
                  </div>
                  <div className="font-bold">{stat.statistics?.rating.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="mt-4">
          <div className="space-y-4">
            {Array.isArray(teamStats) && teamStats.map((stat, index) => (
              <div key={`${stat.team?.id}-${index}`} className="flex items-center gap-4">
                <span className="w-6 text-muted-foreground">{index + 1}</span>
                <SharedImage type="team" id={stat.team?.id} className="w-8 h-8" alt="" />
                <div className="flex-1 flex items-center justify-between">
                  <div className="font-medium">{stat.team?.name}</div>
                  <div className="font-bold">{stat.statistics.avgRating.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
} 