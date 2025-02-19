'use client'

import { SharedImage } from '@/components/ui/shared-image';
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Trophy, MapPin, Users, Calendar, Circle } from 'lucide-react'

interface TeamHeaderProps {
  teamId: number
}

interface TeamData {
  name: string
  country?: {
    name: string
    alpha2: string
  }
  teamColors?: {
    primary: string
    secondary: string
  }
  venue?: {
    name: string
    city?: {
      name: string
    }
    capacity?: number
  }
  manager?: {
    name: string
    country?: {
      name: string
      alpha2: string
    }
  }
  primaryUniqueTournament?: {
    id: number
    name: string
  }
  foundationDateTimestamp?: number
  pregameForm?: {
    avgRating: string
    position: number
    value: string
    form: string[]
  }
}

const getCountryFlagUrl = (alpha2: string) => {
  return `https://flagcdn.com/${alpha2.toLowerCase()}.svg`
}

export function TeamHeader({ teamId }: TeamHeaderProps) {
  const [team, setTeam] = useState<TeamData | null>(null)

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const response = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        const data = await response.json()
        console.log('Team data:', data) // Log the full response
        setTeam(data.team)
      } catch (error) {
        console.error('Error loading team:', error)
      }
    }

    loadTeam()
  }, [teamId])

  if (!team) return null

  return (
    <div className="space-y-4">
      <Card 
        className="p-6 relative overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, 
              ${team.teamColors?.primary}30 0%, 
              ${team.teamColors?.secondary}20 100%
            ),
            linear-gradient(45deg,
              transparent 0%,
              ${team.teamColors?.primary}15 100%
            )
          `
        }}
      >
        {/* Decorative corner accent */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 -mr-48 -mt-48 opacity-10"
          style={{
            background: `
              radial-gradient(circle at top right, 
                ${team.teamColors?.primary}, 
                transparent 70%
              )
            `
          }}
        />

        {/* Decorative bottom accent */}
        <div 
          className="absolute bottom-0 left-0 w-full h-full opacity-5"
          style={{
            background: `
              linear-gradient(to top, 
                ${team.teamColors?.secondary}, 
                transparent
              )
            `
          }}
        />

        <div className="relative flex flex-col md:flex-row gap-6">
          {/* Team Logo and Basic Info */}
          <div className="flex items-start gap-6">
            <SharedImage type="team" id={teamId} className="w-24 h-24" alt="" />
            <div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold">{team.name}</h1>
                {team.country && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <img 
                      src={getCountryFlagUrl(team.country.alpha2)}
                      alt={team.country.name}
                      className="w-4 h-4 object-cover rounded-sm"
                    />
                    <span>{team.country.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stadium Info */}
            {team.venue && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Stadium</span>
                </div>
                <div className="space-y-0.5">
                  <div className="font-medium">{team.venue.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {team.venue.city?.name} · {team.venue.capacity?.toLocaleString()} capacity
                  </div>
                </div>
              </div>
            )}

            {/* Manager Info */}
            {team.manager && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Manager</span>
                </div>
                <div className="space-y-0.5">
                  <div className="font-medium">{team.manager.name}</div>
                  {team.manager.country && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <img 
                        src={getCountryFlagUrl(team.manager.country.alpha2)}
                        alt={team.manager.country.name}
                        className="w-3 h-3 object-cover rounded-sm"
                      />
                      {team.manager.country.name}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tournament Info */}
            {team.primaryUniqueTournament && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium">Current Tournament</span>
                </div>
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center gap-2">
                    <SharedImage type="team" id={team.primaryUniqueTournament.id} className="w-4 h-4" alt="" />
                    {team.primaryUniqueTournament.name}
                  </div>
                  {team.pregameForm && (
                    <div className="text-sm text-muted-foreground">
                      Position: {team.pregameForm.position} · Rating: {team.pregameForm.avgRating}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Display */}
            {team.pregameForm?.form && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Circle className="w-4 h-4" />
                  <span className="font-medium">Form</span>
                </div>
                <div className="flex gap-1.5">
                  {team.pregameForm.form.map((result: string, index: number) => (
                    <div 
                      key={index}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        result === 'W' ? 'bg-green-500' :
                        result === 'D' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Foundation Info */}
            {team.foundationDateTimestamp && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Founded</span>
                </div>
                <div className="font-medium">
                  {new Date(team.foundationDateTimestamp * 1000).getFullYear()}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Form Display Card */}
      {team.pregameForm?.form && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Form</div>
                <div className="flex gap-1.5">
                  {team.pregameForm.form.map((result: string, index: number) => (
                    <div 
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
                        result === 'W' ? 'bg-green-500' :
                        result === 'D' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Position</div>
                <div className="text-2xl font-bold">{team.pregameForm.position}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Points</div>
                <div className="text-2xl font-bold">{team.pregameForm.value}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Rating</div>
                <div className="text-2xl font-bold">{team.pregameForm.avgRating}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 