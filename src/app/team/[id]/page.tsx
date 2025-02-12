'use client'

import { TeamHeader } from "@/components/TeamHeader"
import { TeamSquad } from "@/components/TeamSquad"
import { TeamStandings } from "@/components/TeamStandings"
import { RecentMatches as TeamMatches } from "@/components/RecentMatches"

export default function TeamPage({ params }: { params: { id: string } }) {
  const teamId = parseInt(params.id)

  return (
    <main className="container py-6 space-y-6">
      <TeamHeader teamId={teamId} />
      
      <div className="grid grid-cols-12 gap-6">
        {/* Make standings wider */}
        <div className="col-span-8">
          <TeamStandings teamId={teamId} />
        </div>
        
        {/* Make recent matches narrower */}
        <div className="col-span-4">
          <TeamMatches teamId={teamId} />
        </div>
      </div>

      <TeamSquad teamId={teamId} />
    </main>
  )
} 