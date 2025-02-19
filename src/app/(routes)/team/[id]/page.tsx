'use client'

import { use } from 'react'
import { TeamHeader } from "@/components/TeamHeader"
import { TeamLeagueTables } from "@/components/TeamLeagueTables"
import { Recentes } from "@/components/RecentMatches"
import { TeamSquad } from "@/components/TeamSquad"

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  // Unused: const teamId = parseInt(resolvedParams.id)

  return (
    <div className="container py-6 space-y-6">
      <TeamHeader teamId={teamId} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TeamLeagueTables teamId={teamId} />
        </div>
        <div>
          <RecentMatches teamId={teamId} />
        </div>
      </div>

      <TeamSquad teamId={teamId} />
    </div>
  )
} 