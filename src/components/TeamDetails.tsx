'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamStats, Player } from '@/lib/football-api'
import { fetchTeamData } from '@/lib/sofascore-api'

interface TeamDetailsProps {
  teamId: number
}

export function TeamDetails({ teamId }: TeamDetailsProps) {
  const [team, setTeam] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeam() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchTeamData(teamId)
        setTeam(data)
      } catch (error) {
        console.error('Error fetching team:', error)
        setError('Failed to load team')
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [teamId])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!team) return <div>Team not found</div>

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Team Header */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            <img
              src={team.crest}
              alt={team.name}
              className="w-20 h-20 rounded-full bg-white p-2"
            />
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={team.area.flag}
                  alt={team.area.name}
                  className="w-6 h-4 rounded"
                />
                <span>{team.area.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="squad" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="squad">Squad</TabsTrigger>
            <TabsTrigger value="info">Team Info</TabsTrigger>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
          </TabsList>

          <TabsContent value="squad">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.squad.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Team Information</h2>
                <div className="space-y-2 text-sm">
                  <div>Founded: {team.founded}</div>
                  <div>Stadium: {team.venue}</div>
                  <div>Colors: {team.clubColors}</div>
                  <div>Website: <a href={team.website} className="text-blue-500 hover:underline">{team.website}</a></div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Coach</h2>
                <div className="space-y-2 text-sm">
                  <div className="font-medium">{team.coach.name}</div>
                  <div>Nationality: {team.coach.nationality}</div>
                  <div>Age: {calculateAge(team.coach.dateOfBirth)} years</div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="competitions">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Current Competitions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {team.runningCompetitions.map((competition) => (
                  <div 
                    key={competition.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <img 
                      src={competition.emblem}
                      alt={competition.name}
                      className="w-8 h-8"
                    />
                    <div>
                      <div className="font-medium">{competition.name}</div>
                      <div className="text-sm text-muted-foreground">{competition.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{player.name}</h3>
            <div className="text-sm text-muted-foreground">
              {player.position} {player.shirtNumber && `• #${player.shirtNumber}`}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {player.nationality}
          </div>
        </div>
        <div className="mt-2 text-sm space-y-1">
          <div>Age: {calculateAge(player.dateOfBirth)} years</div>
          <div>Full Name: {player.firstName} {player.lastName}</div>
        </div>
      </div>
    </Card>
  )
}

function calculateAge(dateOfBirth: string): number {
  return Math.floor(
    (new Date().getTime() - new Date(dateOfBirth).getTime()) / 
    (365.25 * 24 * 60 * 60 * 1000)
  )
} 