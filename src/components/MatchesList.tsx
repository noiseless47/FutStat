'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { footballApi, Match } from '@/lib/football-api'
import { format, isToday, isYesterday, addDays, isBefore, isAfter } from 'date-fns'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type MatchStatus = 'LIVE' | 'FINISHED' | 'SCHEDULED'

const MAJOR_LEAGUES = [
  { id: 2021, name: "Premier League" },
  { id: 2014, name: "La Liga" },
  { id: 2002, name: "Bundesliga" },
  { id: 2019, name: "Serie A" },
  { id: 2015, name: "Ligue 1" }
]

const OTHER_LEAGUES = [
  { id: 2001, name: "UEFA Champions League" },
  { id: 2146, name: "UEFA Europa League" }
]

export function MatchesList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | MatchStatus>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLeague, setSelectedLeague] = useState<number | 'all'>('all')

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)
        setError(null)

        // First fetch major leagues
        const majorLeagueMatches = await Promise.all(
          MAJOR_LEAGUES.map(league => 
            footballApi.getMatches(league.id).catch(error => {
              console.error(`Error fetching ${league.name} matches:`, error)
              return { matches: [] }
            })
          )
        )

        // Then fetch other leagues
        const otherLeagueMatches = await Promise.all(
          OTHER_LEAGUES.map(league => 
            footballApi.getMatches(league.id).catch(error => {
              console.error(`Error fetching ${league.name} matches:`, error)
              return { matches: [] }
            })
          )
        )

        const allMatches = [
          ...majorLeagueMatches.flatMap(response => response.matches),
          ...otherLeagueMatches.flatMap(response => response.matches)
        ]

        const now = new Date()
        const past24h = new Date(now.getTime() - (24 * 60 * 60 * 1000))
        const next24h = new Date(now.getTime() + (24 * 60 * 60 * 1000))

        // Map API statuses to our status types
        const statusMap: Record<string, MatchStatus> = {
          'SCHEDULED': 'SCHEDULED',
          'TIMED': 'SCHEDULED',
          'IN_PLAY': 'LIVE',
          'PAUSED': 'LIVE',
          'FINISHED': 'FINISHED',
          'COMPLETED': 'FINISHED',
          'POSTPONED': 'SCHEDULED',
          'SUSPENDED': 'SCHEDULED',
          'CANCELLED': 'SCHEDULED'
        }

        const recentMatches = allMatches
          .filter(match => {
            const matchDate = new Date(match.utcDate)
            return matchDate >= past24h && matchDate <= next24h
          })
          .map(match => ({
            ...match,
            status: statusMap[match.status] || 'SCHEDULED'
          }))

        const sortedMatches = recentMatches.sort((a, b) => {
          if (a.status === 'LIVE' && b.status !== 'LIVE') return -1
          if (a.status !== 'LIVE' && b.status === 'LIVE') return 1
          return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
        })

        setMatches(sortedMatches)
        setFilteredMatches(sortedMatches)
      } catch (error) {
        console.error('Error fetching matches:', error)
        setError('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
    const interval = setInterval(fetchMatches, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleFilterChange = (filter: 'all' | MatchStatus) => {
    setActiveFilter(filter)
    const statusFiltered = filter === 'all' 
      ? matches 
      : matches.filter(match => match.status === filter)
    
    const leagueFiltered = selectedLeague === 'all'
      ? statusFiltered
      : statusFiltered.filter(match => match.competition.id === selectedLeague)
    
    setFilteredMatches(leagueFiltered)
  }

  const handleLeagueChange = (leagueId: number | 'all') => {
    setSelectedLeague(leagueId)
    const leagueFiltered = leagueId === 'all'
      ? matches
      : matches.filter(match => match.competition.id === leagueId)
    
    const statusFiltered = activeFilter === 'all'
      ? leagueFiltered
      : leagueFiltered.filter(match => match.status === activeFilter)
    
    setFilteredMatches(statusFiltered)
  }

  function formatMatchDate(date: string) {
    const matchDate = new Date(date)
    if (isToday(matchDate)) {
      return 'Today'
    }
    if (isYesterday(matchDate)) {
      return 'Yesterday'
    }
    return format(matchDate, 'MMM d')
  }

  const getLiveCount = () => matches.filter(m => m.status === 'LIVE').length
  const getFinishedCount = () => matches.filter(m => m.status === 'FINISHED').length
  const getUpcomingCount = () => matches.filter(m => m.status === 'SCHEDULED').length

  const getWinnerStyles = (match: Match, isHome: boolean) => {
    if (match.status !== 'FINISHED') return ''
    
    const homeScore = match.score.fullTime.home ?? 0
    const awayScore = match.score.fullTime.away ?? 0
    
    if (homeScore === awayScore) return 'text-gray-400'
    if (isHome) {
      return homeScore > awayScore ? 'font-bold text-black' : 'text-gray-400'
    }
    return awayScore > homeScore ? 'font-bold text-black' : 'text-gray-400'
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  // Group matches by date
  const groupedMatches = filteredMatches.reduce((groups, match) => {
    const date = formatMatchDate(match.utcDate)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(match)
    return groups
  }, {} as Record<string, Match[]>)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Matches</h2>
      <Card>
        <div className="divide-y">
          {matches.map((match) => (
            <div key={match.id} className="p-4">
              <div className="flex flex-col space-y-2">
                {/* Competition header */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <img 
                    src={match.competition.emblem} 
                    alt={match.competition.name}
                    className="w-4 h-4"
                  />
                  <span>{match.competition.name}</span>
                </div>

                {/* Match details */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col items-center w-24">
                    <div className="text-sm text-muted-foreground">
                      {formatMatchDate(match.utcDate)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      {match.status === 'FINISHED' && (
                        <span>FT</span>
                      )}
                      {match.status === 'FINISHED' ? '' : format(new Date(match.utcDate), 'HH:mm')}
                    </div>
                  </div>

                  <div className="flex-1 px-4">
                    <div className="flex items-center gap-2">
                      <img 
                        src={match.homeTeam.crest} 
                        alt={match.homeTeam.name}
                        className="w-5 h-5"
                      />
                      <span className={getWinnerStyles(match, true)}>
                        {match.homeTeam.shortName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img 
                        src={match.awayTeam.crest} 
                        alt={match.awayTeam.name}
                        className="w-5 h-5"
                      />
                      <span className={getWinnerStyles(match, false)}>
                        {match.awayTeam.shortName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <span className={`font-bold ${getWinnerStyles(match, true)}`}>
                        {match.score.fullTime.home ?? '-'}
                      </span>
                      <span className={`font-bold ${getWinnerStyles(match, false)}`}>
                        {match.score.fullTime.away ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 