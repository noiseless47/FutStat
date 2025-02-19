'use client'



import { SearchBar } from '@/components/SearchBar'
import { SofascoreLivees } from '@/components/SofascoreLiveMatches'
import { LeagueStandings } from '@/components/LeagueStandings'

export default function HomePage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <SearchBar />
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Standings section - now narrower */}
        <div className="col-span-4">
          <LeagueStandings />
        </div>

        {/* Live matches section */}
        <div className="col-span-5">
          <SofascoreLiveMatches />
        </div>

        {/* Space for additional content */}
        <div className="col-span-3">
          {/* Add new components here */}
        </div>
      </div>
    </div>
  )
}
