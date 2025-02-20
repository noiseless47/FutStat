'use client'

import { SharedImage } from '@/components/shared-image';
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"

interface TeamSquadProps {
  teamId: number
}

interface Player {
  name: string
  shortName: string
  position: string
  jerseyNumber?: string
  height?: number
  preferredFoot?: string
  id: number
  country?: {
    name: string
    alpha2: string
  }
}

interface SquadResponse {
  players: {
    player: Player
  }[]
}

const POSITION_ORDER = {
  'F': 1,   // Forward
  'M': 2,   // Midfielder
  'D': 3,   // Defender
  'G': 4    // Goalkeeper
}

const POSITION_NAMES = {
  'F': 'Forwards',
  'M': 'Midfielders',
  'D': 'Defenders',
  'G': 'Goalkeepers'
}

const getCountryFlagUrl = (alpha2?: string) => {
  if (!alpha2) return ''
  return `https://flagcdn.com/${alpha2.toLowerCase()}.svg`
}

export function TeamSquad({ teamId }: TeamSquadProps) {
  const [squad, setSquad] = useState<SquadResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSquad = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}/players`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        const data = await response.json()
        setSquad(data)
      } catch (error) {
        console.error('Error loading squad:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSquad()
  }, [teamId])

  if (loading || !squad?.players) return null

  // Group players by position
  const groupedPlayers = squad.players.reduce((groups, { player }) => {
    const position = player.position
    if (!groups[position]) {
      groups[position] = []
    }
    groups[position].push(player)
    return groups
  }, {} as Record<string, Player[]>)

  // Sort positions according to POSITION_ORDER
  const sortedPositions = Object.keys(groupedPlayers).sort(
    (a, b) => (POSITION_ORDER[a.charAt(0) as keyof typeof POSITION_ORDER] || 99) - 
              (POSITION_ORDER[b.charAt(0) as keyof typeof POSITION_ORDER] || 99)
  )

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Squad</h2>
      
      <div className="space-y-8">
        {sortedPositions.map(position => {
          const title = POSITION_NAMES[position.charAt(0) as keyof typeof POSITION_NAMES] || 'Other'
          return (
            <div key={position}>
              <h3 className="font-medium text-lg mb-4">{title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedPlayers[position].map((player) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
                    <SharedImage type="player" id={player.id} className="w-12 h-12 rounded-full" alt="" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{player.shortName}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {player.jerseyNumber && (
                          <span>#{player.jerseyNumber}</span>
                        )}
                        {player.height && (
                          <span>{player.height}cm</span>
                        )}
                        {player.preferredFoot && (
                          <span className="capitalize">{player.preferredFoot}</span>
                        )}
                      </div>
                    </div>
                    {player.country?.alpha2 && (
                      <img 
                        src={getCountryFlagUrl(player.country.alpha2)}
                        alt={player.country.name}
                        className="w-5 h-5 object-cover rounded-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
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