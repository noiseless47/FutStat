'use client'

import { useEffect, useState } from 'react'
import { footballApi } from '@/lib/football-api'
import Image from 'next/image'
import Link from 'next/link'

export default function PlayerPage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const playerData = await footballApi.getPlayer(parseInt(params.id))
        setPlayer(playerData)
      } catch (error) {
        console.error('Failed to load player data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlayerData()
  }, [params.id])

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  if (!player) {
    return <div className="container py-8">Player not found</div>
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-6">
              {player.currentTeam?.crest && (
                <Image
                  src={player.currentTeam.crest}
                  alt={player.currentTeam.name}
                  width={96}
                  height={96}
                  className="rounded-full object-contain"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold">{player.name}</h1>
                <Link 
                  href={`/team/${player.currentTeam?.id}`}
                  className="text-blue-600 hover:underline text-lg"
                >
                  {player.currentTeam?.name}
                </Link>
                {player.marketValue && (
                  <p className="text-green-600 font-semibold mt-1">
                    Market Value: {player.marketValue}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Player Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-500">Position</h3>
                  <p>{player.position}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500">Nationality</h3>
                  <p>{player.nationality}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500">Date of Birth</h3>
                  <p>{new Date(player.dateOfBirth).toLocaleDateString()}</p>
                </div>
                {player.preferredFoot && (
                  <div>
                    <h3 className="font-semibold text-gray-500">Preferred Foot</h3>
                    <p>{player.preferredFoot}</p>
                  </div>
                )}
                {player.contract && (
                  <div className="col-span-2">
                    <h3 className="font-semibold text-gray-500">Contract</h3>
                    <p>Until {new Date(player.contract.until).getFullYear()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            {player.stats && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Season Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-500">Appearances</h3>
                    <p>{player.stats.appearances}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Minutes Played</h3>
                    <p>{player.stats.minutesPlayed}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Goals</h3>
                    <p>{player.stats.goals}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Assists</h3>
                    <p>{player.stats.assists}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Yellow Cards</h3>
                    <p>{player.stats.yellowCards}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Red Cards</h3>
                    <p>{player.stats.redCards}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Attributes */}
            {player.attributes && (
              <div className="col-span-2">
                <h2 className="text-xl font-semibold mb-4">Player Attributes</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(player.attributes).map(([key, value]) => (
                    <div key={key} className="relative pt-1">
                      <h3 className="font-semibold text-gray-500 capitalize">{key}</h3>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trophies */}
            {player.trophies && player.trophies.length > 0 && (
              <div className="col-span-2">
                <h2 className="text-xl font-semibold mb-4">Trophies</h2>
                <div className="grid gap-4">
                  {player.trophies.map((trophy, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded">
                      <div className="text-xl">🏆</div>
                      <div>
                        <p className="font-semibold">{trophy.name}</p>
                        <p className="text-sm text-gray-500">
                          {trophy.season} • {trophy.club}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 