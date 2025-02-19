'use client'

import { SharedImage } from '@/components/ui/shared-image';
import { useEffect, useState, use } from 'react'
import { fetchLeagueStandings, type LeagueStandings } from '@/lib/sofascore-api'
import { LeagueStats } from "@/components/LeagueStats"
import { Trophy } from 'lucide-react'
import { LeagueFixtures } from "@/components/LeagueFixtures"

interface LeagueDetails {
  name: string
  titleHolder: {
    name: string
    crest: string
    id: number
  }
  titleHolderTitles: number
  mostTitles: number
  mostTitlesTeams: Array<{
    name: string
    id: number
  }>
  primaryColorHex: string
  secondaryColorHex: string
  category: {
    name: string
    flag: string
  }
}

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [league, setLeague] = useState<LeagueStandings | null>(null)
  const [details, setDetails] = useState<LeagueDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [standingsData, detailsResponse] = await Promise.all([
          fetchLeagueStandings(parseInt(resolvedParams.id)),
          fetch(`https://api.sofascore.com/api/v1/unique-tournament/${resolvedParams.id}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }).then(res => res.json())
        ])

        setLeague(standingsData)
        setDetails(detailsResponse.uniqueTournament)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [resolvedParams.id])

  if (loading) return <div>Loading...</div>
  if (!league || !details) return <div>League not found</div>

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* League Header */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={league.crest} 
            alt={league.name} 
            className="w-20 h-20"
          />
          <span className="text-xl font-semibold">{details.name}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <SharedImage 
              type="country" 
              id={details.category.flag} 
              className="w-4 h-4 rounded-sm" 
              alt={details.category.name} 
            />
            <span>{details.category.name}</span>
          </div>
        </div>
      </div>

      {/* League Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-accent/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-2">Current Champion</div>
          <div className="flex items-center gap-3">
            <SharedImage type="team" id={details.titleHolder.id} className="w-8 h-8" alt="" />
            <div>
              <div className="font-medium">{details.titleHolder.name}</div>
              <div className="text-sm text-muted-foreground">
                {details.titleHolderTitles} titles
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-2">Most Titles</div>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="font-medium">{details.mostTitlesTeams[0].name}</div>
              <div className="text-sm text-muted-foreground">
                {details.mostTitles} titles
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standings and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Standings */}
        <div className="lg:col-span-2">
          {/* Standings Table */}
          <div className="border rounded-lg mb-6">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_repeat(8,minmax(40px,auto))] px-4 py-3 text-sm text-muted-foreground border-b font-medium">
              <div className="w-10">Pos</div>
              <div>Team</div>
              <div className="text-center">MP</div>
              <div className="text-center">W</div>
              <div className="text-center">D</div>
              <div className="text-center">L</div>
              <div className="text-center">GF</div>
              <div className="text-center">GA</div>
              <div className="text-center">GD</div>
              <div className="text-center">Pts</div>
            </div>

            {/* Table Body */}
            {league.standings.map((team) => (
              <div 
                key={team.id}
                className="grid grid-cols-[auto_1fr_repeat(8,minmax(40px,auto))] px-4 py-3 hover:bg-accent/50 text-sm items-center"
              >
                <div className="w-10 font-medium">{team.position}</div>
                <div className="flex items-center gap-2">
                  <img 
                    src={team.crest} 
                    alt={team.name}
                    className="w-5 h-5"
                  />
                  <span>{team.name}</span>
                </div>
                <div className="text-center">{team.played}</div>
                <div className="text-center">{team.won}</div>
                <div className="text-center">{team.drawn}</div>
                <div className="text-center">{team.lost}</div>
                <div className="text-center">{team.goalsFor}</div>
                <div className="text-center">{team.goalsAgainst}</div>
                <div className="text-center">{team.goalDifference}</div>
                <div className="text-center font-bold">{team.points}</div>
              </div>
            ))}
          </div>

          {/* Fixtures */}
          <LeagueFixtures 
            leagueId={league.id} 
            seasonId={league.seasonId} 
          />
        </div>

        {/* Right Column - Stats */}
        <div>
          <LeagueStats 
            leagueId={league.id} 
            seasonId={league.seasonId} 
          />
        </div>
      </div>
    </div>
  )
} 