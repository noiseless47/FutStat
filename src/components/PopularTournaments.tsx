'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { SharedImage } from '@/components/shared-image'
import { useRouter } from 'next/navigation'

interface Tournament {
  id: number
  name: string
  slug: string
  priority: number
  category: {
    name: string
    flag: string
  }
}

export function PopularTournaments() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          'https://api.sofascore.com/api/v1/config/default-unique-tournaments/IN/football',
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        const data = await response.json()
        setTournaments(data.uniqueTournaments)
      } catch (error) {
        console.error('Error loading tournaments:', error)
        setError('Failed to load tournaments')
      } finally {
        setLoading(false)
      }
    }

    loadTournaments()
  }, [])

  const handleTournamentClick = (tournamentId: number) => {
    router.push(`/league/${tournamentId}`)
  }

  if (loading) return <div>Loading tournaments...</div>
  if (error) return <div>{error}</div>

  return (
    <Card>
      <div className="p-4 border-b">
        <h2 className="font-semibold">Popular Tournaments</h2>
      </div>
      <div className="divide-y">
        {tournaments.map((tournament) => (
          <div 
            key={tournament.id}
            className="p-4 hover:bg-accent/50 cursor-pointer flex items-center gap-3"
            onClick={() => handleTournamentClick(tournament.id)}
          >
            <SharedImage 
              type="league" 
              id={tournament.id}
              className="w-6 h-6"
              alt={tournament.name} 
            />
            <div>
              <div className="text-sm font-medium">{tournament.name}</div>
              <div className="text-xs text-muted-foreground">{tournament.category.name}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 