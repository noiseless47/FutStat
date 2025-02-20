'use client'

import { SearchBar } from '@/components/SearchBar'
import { MatchesList } from '@/components/MatchesList'
import { LeagueStandings } from '@/components/LeagueStandings'
import { PopularTournaments } from '@/components/PopularTournaments'

export default function HomePage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <SearchBar />
      </div>
      
      <div className="grid grid-cols-10 gap-6">
        {/* Popular Tournaments - 1/5 width */}
        <div className="col-span-2">
          <PopularTournaments />
        </div>

        {/* Matches - 2/5 width */}
        <div className="col-span-4">
          <MatchesList />
        </div>

        {/* Standings - 2/5 width */}
        <div className="col-span-4">
          <LeagueStandings />
        </div>
      </div>
    </div>
  )
}
