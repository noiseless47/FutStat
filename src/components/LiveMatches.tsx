'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { SharedImage } from '@/components/shared-image'
import { Activity } from 'lucide-react'
import { fetchMatches, type SofaScoreMatch, getMatchTime } from '@/lib/sofascore-api'

export function MatchesList() {
  const [matches, setMatches] = useState<SofaScoreMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true)
        const data = await fetchMatches()
        console.log('Matches data in component:', data);
        
        const sortedMatches = data.sort((a, b) => {
          // Live matches first
          if (a.status.type === 'inprogress' && b.status.type !== 'inprogress') return -1;
          if (b.status.type === 'inprogress' && a.status.type !== 'inprogress') return 1;
          // Then by timestamp
          return (a.time?.timestamp || 0) - (b.time?.timestamp || 0);
        });
        console.log('Sorted matches:', sortedMatches);
        setMatches(sortedMatches)
      } catch (error) {
        console.error('Error loading matches:', error)
        setError('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
    const interval = setInterval(loadMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading matches...</div>
  if (error) return <div>{error}</div>
  if (!matches.length) return <div>No matches today</div>

  return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500" />
          <h2 className="font-semibold">Today's Matches</h2>
        </div>
      </div>

      <div className="divide-y">
        {matches.map(match => (
          <div key={match.id} className="p-4 hover:bg-accent/50 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <SharedImage 
                  type="league" 
                  id={match.tournament.uniqueTournament.id} 
                  className="w-4 h-4" 
                  alt={match.tournament.name} 
                />
                <span className="text-sm text-muted-foreground">{match.tournament.name}</span>
              </div>
              <div className={`text-sm font-medium ${match.status.type === 'inprogress' ? 'text-red-500' : 'text-muted-foreground'}`}>
                {getMatchTime(match)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <SharedImage 
                  type="team" 
                  id={match.homeTeam.id} 
                  className="w-5 h-5" 
                  alt={match.homeTeam.name} 
                />
                <span>{match.homeTeam.shortName}</span>
              </div>
              <div className="font-medium mx-4">
                {match.homeScore.display} - {match.awayScore.display}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <SharedImage 
                  type="team" 
                  id={match.awayTeam.id} 
                  className="w-5 h-5" 
                  alt={match.awayTeam.name} 
                />
                <span>{match.awayTeam.shortName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 