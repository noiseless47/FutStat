'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PositionIndicator } from './PositionIndicator'

interface TableRow {
  id: number
  position?: number
  name: string
  shortName?: string
  crest?: string
  stats: {
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    points: number
  }
}

interface Props {
  data: TableRow[]
  title: string
  showPosition?: boolean
  competitionId?: string
  showLeagueSelector?: boolean
  onCompetitionChange?: (value: string) => void
  competitions?: Array<{ id: number, name: string }>
  selectedCompetition?: string
  loading?: boolean
}

export function DataTable({ 
  data = [],
  title,
  showPosition = true,
  competitionId = '2021',
  showLeagueSelector = false,
  onCompetitionChange,
  competitions = [],
  selectedCompetition,
  loading = false
}: Props) {
  const router = useRouter()

  const handleRowClick = (id: number) => {
    router.push(`/team/${id}`)
  }

  return (
    <Card className="dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="dark:text-white">{title}</CardTitle>
        {showLeagueSelector && onCompetitionChange && (
          <Select value={selectedCompetition} onValueChange={onCompetitionChange}>
            <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:text-white">
              <SelectValue placeholder="Select league" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800">
              {competitions.map((competition) => (
                <SelectItem 
                  key={competition.id} 
                  value={competition.id.toString()}
                  className="dark:text-white dark:focus:bg-gray-700"
                >
                  {competition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-4 text-center dark:text-gray-300">Loading...</div>
        ) : data.length === 0 ? (
          <div className="p-4 text-center dark:text-gray-300">No data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700 bg-muted/50 dark:bg-gray-800">
                  {showPosition && <th className="text-center p-2 w-12 dark:text-gray-200">Pos</th>}
                  <th className="text-left p-2 dark:text-gray-200">Team</th>
                  <th className="text-center p-2 dark:text-gray-200">P</th>
                  <th className="text-center p-2 dark:text-gray-200">W</th>
                  <th className="text-center p-2 dark:text-gray-200">D</th>
                  <th className="text-center p-2 dark:text-gray-200">L</th>
                  <th className="text-center p-2 dark:text-gray-200">GF</th>
                  <th className="text-center p-2 dark:text-gray-200">GA</th>
                  <th className="text-center p-2 dark:text-gray-200">GD</th>
                  <th className="text-center p-2 dark:text-gray-200">Pts</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr 
                    key={row.id} 
                    className="border-b dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-700 transition-colors dark:text-gray-200"
                  >
                    {showPosition && (
                      <td className="p-2 text-center">
                        <div className="flex justify-center">
                          <PositionIndicator 
                            position={row.position!} 
                            competitionId={competitionId}
                          />
                        </div>
                      </td>
                    )}
                    <td 
                      className="p-2 flex items-center space-x-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => handleRowClick(row.id)}
                    >
                      {row.crest && (
                        <Image 
                          src={row.crest} 
                          alt={row.name} 
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      )}
                      <span>{row.shortName || row.name}</span>
                    </td>
                    <td className="text-center p-2">{row.stats.played}</td>
                    <td className="text-center p-2">{row.stats.won}</td>
                    <td className="text-center p-2">{row.stats.drawn}</td>
                    <td className="text-center p-2">{row.stats.lost}</td>
                    <td className="text-center p-2">{row.stats.goalsFor}</td>
                    <td className="text-center p-2">{row.stats.goalsAgainst}</td>
                    <td className="text-center p-2">{row.stats.goalDifference}</td>
                    <td className="text-center p-2 font-bold">{row.stats.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 