'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface League {
  id: number
  name: string
  teams: {
    id: number
    name: string
  }[]
}

const LEAGUES: League[] = [
  {
    id: 2021,
    name: "Premier League",
    teams: [
      { id: 65, name: "Manchester City" },
      { id: 64, name: "Liverpool" },
      { id: 73, name: "Tottenham" },
      { id: 66, name: "Manchester United" },
      { id: 61, name: "Chelsea" },
      { id: 57, name: "Arsenal" },
    ]
  },
  {
    id: 2014,
    name: "La Liga",
    teams: [
      { id: 86, name: "Real Madrid" },
      { id: 81, name: "Barcelona" },
      { id: 78, name: "Atletico Madrid" },
      { id: 559, name: "Sevilla" },
    ]
  },
  {
    id: 2002,
    name: "Bundesliga",
    teams: [
      { id: 5, name: "Bayern Munich" },
      { id: 4, name: "Borussia Dortmund" },
      { id: 721, name: "RB Leipzig" },
      { id: 3, name: "Bayer Leverkusen" },
    ]
  }
]

interface TeamSelectorProps {
  onLeagueChange: (leagueId: number) => void
  onTeamChange: (teamId: number) => void
}

export function TeamSelector({ onLeagueChange, onTeamChange }: TeamSelectorProps) {
  const [selectedLeague, setSelectedLeague] = useState<League>(LEAGUES[0])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex space-x-4">
          <div className="w-1/2">
            <Select
              onValueChange={(value: string) => {
                const league = LEAGUES.find(l => l.id === parseInt(value))
                if (league) {
                  setSelectedLeague(league)
                  onLeagueChange(league.id)
                }
              }}
              defaultValue={selectedLeague.id.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select League" />
              </SelectTrigger>
              <SelectContent>
                {LEAGUES.map((league) => (
                  <SelectItem key={league.id} value={league.id.toString()}>
                    {league.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-1/2">
            <Select
              onValueChange={(value: string) => onTeamChange(parseInt(value))}
              defaultValue={selectedLeague.teams[0].id.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                {selectedLeague.teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 