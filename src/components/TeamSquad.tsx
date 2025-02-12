'use client'

import { useState, useEffect } from 'react'
import { footballApi, Player } from '@/lib/football-api'

interface TeamSquadProps {
  teamId: number
}

// Add jersey number mapping
const JERSEY_NUMBERS: Record<string, number> = {
  // Goalkeepers
  'Wojciech Szczęsny': 98,
  'Marc-André ter Stegen': 92,
  'Iñaki Peña': 86,
  'Ander Astralaga': 41,
  'Diego Kochen': 73,
  'Áron Yaakobishvili': 4,

  // Midfielders
  'Noah Darvich': 18,
  'Pedri': 22,
  'Fermín López': 21,
  'Guille Fernández': 16,
  'Dani Olmo': 26,
  'Marc Casado': 21,
  'Pablo Gavira': 20,
  'Frenkie de Jong': 27,
  'Pablo Torre': 21,
  'Marc Bernal': 17,

  // Forwards
  'Toni Fernández': 16,
  'Pau Victor Delgado': 23,
  'Ansu Fati': 22,
  'Raphinha': 28,
  'Ferrán Torres': 24,
  'Robert Lewandowski': 36,
  'Lamine Yamal': 17,

  // Defenders
  'Andrés Cuenca': 17,
  'Álvaro Cortés': 19,
  'Álex Balde': 21,
  'Eric García': 24,
  'Iñigo Martínez': 33,
  'Ronald Araújo': 25,
  'Jules Koundé': 26,
  'Andreas Christensen': 28,
  'Sergi Domínguez': 19,
  'Gerard Martín': 22,
  'Héctor Fort': 18,
  'Pau Cubarsi': 18
}

export function TeamSquad({ teamId }: TeamSquadProps) {
  const [squad, setSquad] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSquad() {
      try {
        setLoading(true)
        const data = await footballApi.getTeam(teamId)
        setSquad(data.squad)
      } catch (error) {
        console.error('Error fetching squad:', error)
        setError('Failed to load squad')
      } finally {
        setLoading(false)
      }
    }

    fetchSquad()
  }, [teamId])

  if (loading) return <div className="p-4 text-center">Loading squad...</div>
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>

  const normalizePosition = (position: string) => {
    const pos = position.toLowerCase()
    
    // Goalkeeper variations
    if (pos.includes('keeper') || pos.includes('gk')) return 'Goalkeeper'
    
    // Defender variations
    if (pos.includes('defend') || pos.includes('back') || 
        pos.includes('cb') || pos.includes('lb') || 
        pos.includes('rb') || pos.includes('defence')) return 'Defender'
    
    // Midfielder variations
    if (pos.includes('midfield') || pos.includes('mid') || 
        pos.includes('cdm') || pos.includes('cam') || 
        pos.includes('cm') || pos.includes('dm') || 
        pos.includes('am')) return 'Midfielder'
    
    // Attacker variations
    if (pos.includes('attack') || pos.includes('forward') || 
        pos.includes('striker') || pos.includes('wing') || 
        pos.includes('cf') || pos.includes('st') || 
        pos.includes('lw') || pos.includes('rw') || 
        pos.includes('offence')) return 'Attacker'
    
    return position
  }

  const getPositionDisplay = (position: string) => {
    switch (position) {
      case 'Goalkeeper':
        return { title: 'Goalkeeper', color: 'text-yellow-600' }
      case 'Defender':
        return { title: 'Defence', color: 'text-green-600' }
      case 'Midfielder':
        return { title: 'Midfield', color: 'text-blue-600' }
      case 'Attacker':
        return { title: 'Forward', color: 'text-red-600' }
      default:
        return { title: position, color: 'text-gray-600' }
    }
  }

  // Group players by normalized position
  const groupedPlayers = squad.reduce((acc, player) => {
    const normalizedPosition = normalizePosition(player.position)
    if (!acc[normalizedPosition]) {
      acc[normalizedPosition] = []
    }
    acc[normalizedPosition].push(player)
    return acc
  }, {} as Record<string, Player[]>)

  const positionOrder = ['Attacker', 'Midfielder', 'Defender', 'Goalkeeper']

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Players</h2>
      <div className="space-y-8">
        {positionOrder.map(position => {
          if (!groupedPlayers[position]) return null
          const { title, color } = getPositionDisplay(position)
          
          return (
            <div key={position} className="space-y-2">
              <h3 className={color}>{title}</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8">
                {groupedPlayers[position].map(player => (
                  <div key={player.id} className="flex items-center py-2">
                    <div className="w-8 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {JERSEY_NUMBERS[player.name] || '-'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {player.nationality}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 ml-2">
                      {calculateAge(player.dateOfBirth)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function calculateAge(dateOfBirth: string): number {
  return Math.floor(
    (new Date().getTime() - new Date(dateOfBirth).getTime()) / 
    (365.25 * 24 * 60 * 60 * 1000)
  )
}