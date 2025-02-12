'use client'

import { MatchesList } from '@/components/MatchesList'
import { StandingsTable } from '@/components/StandingsTable'
import { SearchBar } from '@/components/SearchBar'

export default function HomePage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <SearchBar />
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Matches section - narrower */}
        <div className="col-span-5 space-y-6">
          <MatchesList />
        </div>

        {/* Standings section - wider */}
        <div className="col-span-7 space-y-6">
          <StandingsTable />
        </div>
      </div>
    </div>
  )
}
