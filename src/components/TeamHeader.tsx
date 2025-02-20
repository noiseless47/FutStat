'use client'

import { SharedImage } from '@/components/shared-image';
import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Trophy, MapPin, Users, Calendar, Circle } from 'lucide-react'
import { TeamForm } from '@/components/TeamForm'

interface TeamHeaderProps {
  teamId: number;
}

interface TeamData {
  name: string
  country: {
    name: string
    alpha2: string
  }
  teamColors?: {
    primary: string
    secondary: string
  }
  venue: {
    name: string
    city: {
      name: string
    }
    capacity: number
  }
  manager: {
    name: string
    country: {
      name: string
      alpha2: string
    }
  }
  primaryUniqueTournament: {
    id: number
    name: string
  }
  foundationDateTimestamp: number
  pregameForm?: {
    avgRating: string
    position: number
    value: string
    form: string[]
  }
}

interface Tournament {
  id: number
  name: string
  slug: string
  priority: number
  hasEventPlayerStatistics: boolean
  hasEventPlayerHeatMap: boolean
  hasEventPlayerStatisticsLite: boolean
}

const getCountryFlagUrl = (alpha2: string) => {
  return `https://flagcdn.com/${alpha2.toLowerCase()}.svg`
}

export function TeamHeader({ teamId }: TeamHeaderProps) {
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch team data
        const teamResponse = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        const teamData = await teamResponse.json()
        setTeamData(teamData.team)

        // Fetch tournaments
        const tournamentsResponse = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}/unique-tournaments`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        const tournamentsData = await tournamentsResponse.json()
        setTournaments(tournamentsData.uniqueTournaments)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [teamId])

  if (!teamData) return null

  return (
    <div>
      <div 
        className="relative p-6 overflow-hidden rounded-lg bg-card"
        style={{
          backgroundImage: `linear-gradient(to right, ${teamData.teamColors?.primary || '#f0f0f0'}40, ${teamData.teamColors?.secondary || '#f0f0f0'}40)`
        }}
      >
        <div className="flex">
          {/* Logo and Name/Country Section */}
          <div className="flex items-center gap-4 w-[300px]">
            <SharedImage 
              type="team" 
              id={teamId} 
              className="w-28 h-28"
              alt={teamData.name}
            />
            <div>
              <h1 className="text-4xl font-bold">{teamData.name}</h1>
              <div className="flex items-center gap-1 mt-1">
                {teamData.country?.alpha2 && (
                  <img 
                    src={getCountryFlagUrl(teamData.country.alpha2)} 
                    alt={teamData.country.name} 
                    className="w-4 h-3" 
                  />
                )}
                <span className="text-sm text-muted-foreground">
                  {teamData.country?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Info Columns Container */}
          <div className="flex gap-12 ml-auto">
            {/* Middle Info Section */}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Stadium
              </div>
              <div className="mb-4">
                <div>{teamData.venue.name}</div>
                <div className="text-sm text-muted-foreground">
                  {teamData.venue.city.name} · {teamData.venue.capacity.toLocaleString()} capacity
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="w-4 h-4" />
                Tournaments
              </div>
              <div className="flex flex-col gap-2 mt-1">
                {tournaments.map(tournament => (
                  <div key={tournament.id} className="flex items-center gap-2">
                    <SharedImage 
                      type="league" 
                      id={tournament.id}
                      className="w-5 h-5"
                      alt={tournament.name}
                    />
                    <span>{tournament.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Info Section */}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                Manager
              </div>
              <div className="mb-4">
                <div>{teamData.manager.name}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {teamData.manager.country?.alpha2 && (
                    <img 
                      src={getCountryFlagUrl(teamData.manager.country.alpha2)} 
                      alt={teamData.manager.country.name} 
                      className="w-3 h-3" 
                    />
                  )}
                  {teamData.manager.country?.name}
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Founded
              </div>
              <div>
                {new Date(teamData.foundationDateTimestamp * 1000).getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 