'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SharedImage } from '@/components/shared-image'
import { Activity } from 'lucide-react'
import { fetchMatches, type SofaScoreMatch, getMatchTime } from '@/lib/sofascore-api'

// Top leagues IDs
const TOP_LEAGUES = {
  premierLeague: 17,
  laLiga: 8,
  bundesliga: 35,
  serieA: 23,
  ligue1: 34,
  championsLeague: 7,
  europaLeague: 679,
  conferenceLeague: 17015
};

function formatDateTime(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return {
    date: date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  };
}

function formatRoundInfo(match: SofaScoreMatch) {
  if (!match.tournament.round) return '';
  
  // Handle different round formats
  if (match.tournament.round.round) {
    return `Round ${match.tournament.round.round}`;
  } else if (match.tournament.round.name) {
    return match.tournament.round.name;
  }
  return '';
}

function getWinnerStyle(match: SofaScoreMatch, isHome: boolean) {
  if (match.status.type !== 'finished') return '';
  
  const homeScore = match.homeScore.display;
  const awayScore = match.awayScore.display;
  
  if (homeScore === awayScore) return '';
  if (isHome && homeScore > awayScore) return 'font-bold';
  if (!isHome && awayScore > homeScore) return 'font-bold';
  return '';
}

// Add new function to handle score display
function ScoreDisplay({ match }: { match: SofaScoreMatch }) {
  const homeWon = match.homeScore.display > match.awayScore.display;
  const awayWon = match.awayScore.display > match.homeScore.display;

  return (
    <div className="font-medium dark:text-white">
      <span className={homeWon ? 'font-bold' : ''}>
        {match.homeScore.display}
      </span>
      {' - '}
      <span className={awayWon ? 'font-bold' : ''}>
        {match.awayScore.display}
      </span>
    </div>
  );
}

export function MatchesList() {
  const [matches, setMatches] = useState<SofaScoreMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true)
        const data = await fetchMatches()
        
        const sortedMatches = data.sort((a, b) => {
          // First priority: Live matches
          if (a.status.type === 'inprogress' && b.status.type !== 'inprogress') return -1;
          if (b.status.type === 'inprogress' && a.status.type !== 'inprogress') return 1;

          // Second priority: Top leagues
          const aIsTopLeague = Object.values(TOP_LEAGUES).includes(a.tournament.uniqueTournament.id);
          const bIsTopLeague = Object.values(TOP_LEAGUES).includes(b.tournament.uniqueTournament.id);
          if (aIsTopLeague && !bIsTopLeague) return -1;
          if (!aIsTopLeague && bIsTopLeague) return 1;

          // Third priority: Match time
          return (a.time?.timestamp || 0) - (b.time?.timestamp || 0);
        });

        setMatches(sortedMatches)
      } catch (error) {
        console.error('Error loading matches:', error)
        setError('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
    const interval = setInterval(loadMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  // Filter matches based on status
  const filteredMatches = matches.filter(match => {
    switch (activeTab) {
      case 'live':
        return match.status.type === 'inprogress';
      case 'completed':
        return match.status.type === 'finished';
      case 'scheduled':
        return match.status.type !== 'inprogress' && match.status.type !== 'finished';
      default:
        return true;
    }
  });

  // Group filtered matches by tournament
  const groupedMatches = filteredMatches.reduce((groups, match) => {
    const tournamentId = match.tournament.uniqueTournament.id;
    if (!groups[tournamentId]) {
      groups[tournamentId] = [];
    }
    groups[tournamentId].push(match);
    return groups;
  }, {} as Record<number, SofaScoreMatch[]>);

  if (loading) return <div>Loading matches...</div>
  if (error) return <div>{error}</div>

  return (
    <Card className="dark:bg-gray-900">
      <div className="p-4 border-b dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-red-500" />
          <h2 className="font-semibold dark:text-white">Today's Matches</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 dark:bg-gray-800">
            <TabsTrigger value="all" className="dark:data-[state=active]:bg-gray-700">All</TabsTrigger>
            <TabsTrigger value="live" className="dark:data-[state=active]:bg-gray-700">Live</TabsTrigger>
            <TabsTrigger value="completed" className="dark:data-[state=active]:bg-gray-700">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="divide-y dark:divide-gray-800">
        {!filteredMatches.length ? (
          <div className="p-4 text-center text-muted-foreground dark:text-gray-400">
            No {activeTab} matches
          </div>
        ) : (
          Object.entries(groupedMatches).map(([tournamentId, tournamentMatches]) => (
            <div key={tournamentId} className="space-y-2">
              <div className="bg-accent/50 px-4 py-3 flex items-center justify-between dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <SharedImage 
                    type="league" 
                    id={Number(tournamentId)}
                    className="w-8 h-8"
                    alt={tournamentMatches[0].tournament.name} 
                  />
                  <div>
                    <span className="text-sm font-medium dark:text-white">
                      {tournamentMatches[0].tournament.name}
                    </span>
                    {tournamentMatches[0].tournament.category?.name && (
                      <div className="text-xs text-muted-foreground dark:text-gray-400">
                        {tournamentMatches[0].tournament.category.name}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground dark:text-gray-400">
                  {formatRoundInfo(tournamentMatches[0])}
                </span>
              </div>
              {tournamentMatches.map(match => (
                <div key={match.id} 
                  className="p-4 hover:bg-accent/50 cursor-pointer bg-white dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`text-sm dark:text-gray-200 ${getWinnerStyle(match, true)}`}>
                        {match.homeTeam.shortName}
                      </span>
                      <SharedImage 
                        type="team" 
                        id={match.homeTeam.id} 
                        className="w-10 h-10 mr-1"
                        alt={match.homeTeam.name} 
                      />
                    </div>

                    <div className="flex flex-col items-center min-w-[100px]">
                      {match.status.type === 'inprogress' ? (
                        <>
                          <div className="font-medium text-red-500">
                            {match.homeScore.display} - {match.awayScore.display}
                          </div>
                          <div className="text-xs text-red-500">
                            {getMatchTime(match)}
                          </div>
                        </>
                      ) : match.status.type === 'finished' ? (
                        <>
                          <ScoreDisplay match={match} />
                          <div className="text-xs text-muted-foreground dark:text-gray-400 mt-0.5">
                            FT
                          </div>
                          {match.time?.timestamp && (
                            <div className="text-xs text-muted-foreground dark:text-gray-400 mt-0.5">
                              {formatDateTime(match.time.timestamp).date}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-sm text-muted-foreground dark:text-gray-400">
                          {match.time?.timestamp && (
                            <>
                              <div>{formatDateTime(match.time.timestamp).date}</div>
                              <div>{formatDateTime(match.time.timestamp).time}</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <SharedImage 
                        type="team" 
                        id={match.awayTeam.id} 
                        className="w-10 h-10 ml-1"
                        alt={match.awayTeam.name} 
                      />
                      <span className={`text-sm dark:text-gray-200 ${getWinnerStyle(match, false)}`}>
                        {match.awayTeam.shortName}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </Card>
  )
} 