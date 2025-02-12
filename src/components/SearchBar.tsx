'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { IoSearchOutline } from "react-icons/io5"
import { footballApi } from '@/lib/football-api'
import { Search } from "lucide-react"

// Popular teams for instant suggestions
const POPULAR_TEAMS = [
  { id: 81, name: 'Barcelona', shortName: 'Barça', image: 'https://crests.football-data.org/81.svg', area: 'Spain', league: 'La Liga' },
  { id: 86, name: 'Real Madrid', shortName: 'Real', image: 'https://crests.football-data.org/86.svg', area: 'Spain', league: 'La Liga' },
  { id: 5, name: 'Bayern Munich', shortName: 'Bayern', image: 'https://crests.football-data.org/5.svg', area: 'Germany', league: 'Bundesliga' },
  { id: 65, name: 'Manchester City', shortName: 'Man City', image: 'https://crests.football-data.org/65.svg', area: 'England', league: 'Premier League' },
  { id: 66, name: 'Manchester United', shortName: 'Man United', image: 'https://crests.football-data.org/66.svg', area: 'England', league: 'Premier League' },
  { id: 57, name: 'Arsenal', shortName: 'Arsenal', image: 'https://crests.football-data.org/57.svg', area: 'England', league: 'Premier League' },
  { id: 64, name: 'Liverpool', shortName: 'Liverpool', image: 'https://crests.football-data.org/64.svg', area: 'England', league: 'Premier League' },
  { id: 61, name: 'Chelsea', shortName: 'Chelsea', image: 'https://crests.football-data.org/61.svg', area: 'England', league: 'Premier League' },
  { id: 73, name: 'Tottenham', shortName: 'Spurs', image: 'https://crests.football-data.org/73.svg', area: 'England', league: 'Premier League' },
  { id: 98, name: 'AC Milan', shortName: 'Milan', image: 'https://crests.football-data.org/98.svg', area: 'Italy', league: 'Serie A' },
  { id: 108, name: 'Inter Milan', shortName: 'Inter', image: 'https://crests.football-data.org/108.svg', area: 'Italy', league: 'Serie A' },
  { id: 109, name: 'Juventus', shortName: 'Juve', image: 'https://crests.football-data.org/109.svg', area: 'Italy', league: 'Serie A' },
  { id: 85, name: 'Paris Saint-Germain', shortName: 'PSG', image: 'https://crests.football-data.org/85.svg', area: 'France', league: 'Ligue 1' },
]

// Add popular players for instant suggestions
const POPULAR_PLAYERS = [
  { id: 3232, name: 'Lionel Messi', shortName: 'Messi', image: 'https://media.api-sports.io/football/players/3232.png', team: 'Inter Miami', area: 'USA' },
  { id: 874, name: 'Cristiano Ronaldo', shortName: 'CR7', image: 'https://media.api-sports.io/football/players/874.png', team: 'Al Nassr', area: 'Saudi Arabia' },
  { id: 1100, name: 'Erling Haaland', shortName: 'Haaland', image: 'https://media.api-sports.io/football/players/1100.png', team: 'Manchester City', area: 'England' },
  { id: 276, name: 'Kylian Mbappé', shortName: 'Mbappé', image: 'https://media.api-sports.io/football/players/276.png', team: 'PSG', area: 'France' },
  { id: 642, name: 'Mohamed Salah', shortName: 'Salah', image: 'https://media.api-sports.io/football/players/642.png', team: 'Liverpool', area: 'England' },
  { id: 521, name: 'Kevin De Bruyne', shortName: 'De Bruyne', image: 'https://media.api-sports.io/football/players/521.png', team: 'Manchester City', area: 'England' },
  { id: 742, name: 'Harry Kane', shortName: 'Kane', image: 'https://media.api-sports.io/football/players/742.png', team: 'Bayern Munich', area: 'Germany' },
  // Add more popular players...
]

// Major leagues for instant suggestions
const MAJOR_LEAGUES = [
  { id: 2021, name: 'Premier League', code: 'PL', image: 'https://crests.football-data.org/PL.png', area: 'England' },
  { id: 2014, name: 'La Liga', code: 'PD', image: 'https://crests.football-data.org/PD.png', area: 'Spain' },
  { id: 2019, name: 'Serie A', code: 'SA', image: 'https://crests.football-data.org/SA.png', area: 'Italy' },
  { id: 2002, name: 'Bundesliga', code: 'BL1', image: 'https://crests.football-data.org/BL1.png', area: 'Germany' },
  { id: 2015, name: 'Ligue 1', code: 'FL1', image: 'https://crests.football-data.org/FL1.png', area: 'France' },
  { id: 2001, name: 'Champions League', code: 'CL', image: 'https://crests.football-data.org/CL.png', area: 'Europe' },
]

interface SearchResult {
  id: number
  name: string
  type: 'team' | 'player' | 'league'
  image?: string
  area?: string
  league?: string
  team?: string // For players
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allTeams, setAllTeams] = useState<any[]>([])
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // Load all teams when component mounts
  useEffect(() => {
    const loadAllTeams = async () => {
      try {
        const teamsPromises = MAJOR_LEAGUES.map(league => 
          footballApi.getTeams(league.id)
            .then(response => response.teams.map(team => ({
              ...team,
              league: league.name,
              leagueArea: league.area
            })))
        )
        
        const allTeamsResponses = await Promise.all(teamsPromises)
        const teams = allTeamsResponses.flat()
        setAllTeams(teams)
      } catch (error) {
        console.error('Failed to load teams:', error)
      }
    }

    loadAllTeams()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchItems = async () => {
      if (!query) {
        setResults([])
        setIsOpen(false)
        return
      }

      const lowerQuery = query.toLowerCase()

      // First show instant results from popular teams, players, and leagues
      const instantResults = [
        ...POPULAR_TEAMS.filter(team => 
          team.name.toLowerCase().includes(lowerQuery) || 
          team.shortName.toLowerCase().includes(lowerQuery)
        ).map(team => ({
          id: team.id,
          name: team.shortName,
          type: 'team' as const,
          image: team.image,
          area: team.area,
          league: team.league
        })),
        ...POPULAR_PLAYERS.filter(player => 
          player.name.toLowerCase().includes(lowerQuery) || 
          player.shortName.toLowerCase().includes(lowerQuery)
        ).map(player => ({
          id: player.id,
          name: player.name,
          type: 'player' as const,
          image: player.image,
          area: player.area,
          team: player.team
        })),
        ...MAJOR_LEAGUES.filter(league => 
          league.name.toLowerCase().includes(lowerQuery) || 
          league.code.toLowerCase().includes(lowerQuery)
        ).map(league => ({
          id: league.id,
          name: league.name,
          type: 'league' as const,
          image: league.image,
          area: league.area
        }))
      ]

      if (instantResults.length > 0) {
        setResults(instantResults)
        setIsOpen(true)
        return
      }

      // If no instant results, search via API
      if (query.length >= 2) {
        setLoading(true)
        try {
          const apiResults = await footballApi.searchAll(query)
          setResults(apiResults)
          setIsOpen(apiResults.length > 0)
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    const debounceTimer = setTimeout(searchItems, 100)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'team':
        router.push(`/team/${result.id}`)
        break
      case 'player':
        router.push(`/player/${result.id}`)
        break
      case 'league':
        router.push(`/league/${result.id}`)
        break
    }
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search teams, players, leagues..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-1.5 text-sm rounded-full 
            bg-gray-100 dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            border border-transparent
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
            transition-colors"
        />
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 py-1 z-50 max-h-[60vh] overflow-y-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
            >
              {result.image && (
                <img 
                  src={result.image} 
                  alt={result.name}
                  className="w-5 h-5 object-contain"
                />
              )}
              <div>
                <div className="font-medium">{result.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {result.type === 'team' && `${result.league} • ${result.area}`}
                  {result.type === 'player' && `${result.team} • ${result.area}`}
                  {result.type === 'league' && result.area}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && loading && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 p-3 text-center text-sm text-gray-500 dark:text-gray-400">
          Searching...
        </div>
      )}

      {isOpen && !loading && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 p-3 text-center text-sm text-gray-500 dark:text-gray-400">
          No results found
        </div>
      )}
    </div>
  )
} 