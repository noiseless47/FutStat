'use client'

import { useEffect, useState } from 'react'
import { footballApi } from '@/lib/football-api'
import { StandingsTable } from '@/components/StandingsTable'
import { MatchesList } from '@/components/MatchesList'
import Image from 'next/image'

// Define league IDs for reference
const LEAGUE_IDS = {
  PREMIER_LEAGUE: 2021,
  LA_LIGA: 2014,
  BUNDESLIGA: 2002,
  SERIE_A: 2019,
  LIGUE_1: 2015,
  CHAMPIONS_LEAGUE: 2001,
}

// Update the page component props interface
interface PageProps {
  params: {
    id: string;
  };
}

export default function LeaguePage({ params }: PageProps) {
  const { id } = params;
  const [league, setLeague] = useState<any>(null)
  const [standings, setStandings] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLeagueData = async () => {
      try {
        const leagueId = parseInt(id)
        const [leagueData, standingsData, matchesData] = await Promise.all([
          footballApi.getLeague(leagueId),
          footballApi.getStandings(leagueId),
          footballApi.getMatches(leagueId)
        ])

        setLeague(leagueData)
        setStandings(standingsData)
        // Filter matches to only show matches from this league
        const leagueMatches = matchesData.matches.filter(
          (match: any) => match.competition.id === leagueId
        )
        setMatches(leagueMatches)
      } catch (error) {
        console.error('Failed to load league data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLeagueData()
  }, [id])

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  if (!league) {
    return <div className="container py-8">League not found</div>
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        {league.emblem && (
          <Image
            src={league.emblem}
            alt={league.name}
            width={64}
            height={64}
            className="object-contain"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{league.name}</h1>
          <p className="text-gray-500">{league.area.name}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Standings</h2>
          {/* Pass only the standings for this league */}
          <StandingsTable 
            standings={standings}
            competitionId={id} 
            showLeagueSelector={false}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Matches</h2>
          {/* Pass only the matches for this league */}
          <MatchesList 
            matches={matches}
            title="Recent & Upcoming Matches"
          />
        </div>
      </div>
    </div>
  )
} 