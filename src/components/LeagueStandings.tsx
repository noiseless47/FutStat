'use client'

import { SharedImage } from '@/components/shared-image';
import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchLeagueStandings, type LeagueStandings, type StandingTeam } from '@/lib/sofascore-api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from 'next/navigation'

const LEAGUES = [
  { id: 17, name: 'Premier League', value: 'pl' },
  { id: 8, name: 'La Liga', value: 'laliga' },
  { id: 35, name: 'Bundesliga', value: 'bundesliga' },
  { id: 23, name: 'Serie A', value: 'seriea' },
  { id: 34, name: 'Ligue 1', value: 'ligue1' },
  { id: 7, name: 'Champions League', value: 'ucl' },
];

export function LeagueStandings() {
  const router = useRouter();
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0].value)
  const [standings, setStandings] = useState<{ [key: string]: LeagueStandings }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const league = LEAGUES.find(l => l.value === activeLeague);
        if (!league) return;

        if (!standings[activeLeague]) {
          const data = await fetchLeagueStandings(league.id);
          setStandings(prev => ({ ...prev, [activeLeague]: data }));
        }
      } catch (error) {
        console.error('Error fetching standings:', error);
        setError('Failed to load standings');
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [activeLeague]);

  const handleTeamClick = (teamId: number) => {
    router.push(`/team/${teamId}`);
  };

  return (
    <Card className="col-span-4">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Popular Standings</h2>
        <Select value={activeLeague} onValueChange={setActiveLeague}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select league" />
          </SelectTrigger>
          <SelectContent>
            {LEAGUES.map(league => (
              <SelectItem key={league.value} value={league.value}>
                <div className="flex items-center gap-2">
                  <SharedImage 
                    type="league" 
                    id={league.id} 
                    className="w-4 h-4" 
                    alt={league.name}
                  />
                  {league.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase bg-muted">
            <tr>
              <th className="px-2 py-2 text-left w-8">#</th>
              <th className="px-2 py-2 text-left">Team</th>
              <th className="px-2 py-2 text-center w-8">P</th>
              <th className="px-2 py-2 text-center w-8">W</th>
              <th className="px-2 py-2 text-center w-8">D</th>
              <th className="px-2 py-2 text-center w-8">L</th>
              <th className="px-2 py-2 text-center w-10">GF</th>
              <th className="px-2 py-2 text-center w-10">GA</th>
              <th className="px-2 py-2 text-center w-10">GD</th>
              <th className="px-2 py-2 text-center w-10">Pts</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-4">Loading standings...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} className="text-center py-4 text-red-500">{error}</td>
              </tr>
            ) : standings[activeLeague]?.standings.map((team) => (
              <tr key={team.id} className="border-b hover:bg-accent/50">
                <td className="px-2 py-2 text-left">{team.position}</td>
                <td className="px-2 py-2">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-primary"
                    onClick={() => handleTeamClick(team.id)}
                  >
                    <img 
                      src={team.crest} 
                      alt={team.name} 
                      className="w-4 h-4"
                    />
                    <span className="truncate">{team.shortName}</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-center">{team.played}</td>
                <td className="px-2 py-2 text-center">{team.won}</td>
                <td className="px-2 py-2 text-center">{team.drawn}</td>
                <td className="px-2 py-2 text-center">{team.lost}</td>
                <td className="px-2 py-2 text-center">{team.goalsFor || '-'}</td>
                <td className="px-2 py-2 text-center">{team.goalsAgainst || '-'}</td>
                <td className="px-2 py-2 text-center">
                  {team.goalDifference !== undefined ? 
                    (team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference) 
                    : '-'}
                </td>
                <td className="px-2 py-2 text-center font-bold">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
} 