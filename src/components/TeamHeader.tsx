'use client'

import { useState, useEffect } from 'react'
import { footballApi, TeamStats } from '@/lib/football-api'

interface TeamHeaderProps {
  teamId: number
}

export function TeamHeader({ teamId }: TeamHeaderProps) {
  const [team, setTeam] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeam() {
      try {
        setLoading(true)
        const data = await footballApi.getTeam(teamId)
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

  if (loading) return <div className="h-24 flex items-center justify-center">Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!team) return null

  return (
    <div className="flex items-center gap-4">
      <img 
        src={team.crest} 
        alt={team.name}
        className="w-16 h-16"
      />
      <div>
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <div className="text-muted-foreground">
          {team.venue} · Founded {team.founded}
        </div>
      </div>
    </div>
  )
} 