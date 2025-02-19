import { Card } from "@/components/ui/card"
import { SharedImage } from '@/components/ui/shared-image';
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Activity } from 'lucide-react'
import { 
  fetchMatches,
  fetchMatchStatistics,
  SofaScoreMatch,
  fetchMatchEvents,
  type MatchEvent
} from '@/lib/sofascore-api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface StatisticsItem {
  name: string;
  home: string | number;
  away: string | number;
}

interface StatisticsGroup {
  group: string;
  statisticsItems: StatisticsItem[];
}

const getMatchStatus = (match: SofaScoreMatch): string => {
  // Check match status code
  switch (match.status.code) {
    case 0:  // Not started
      return new Date(match.startTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    
    case 100: // Finished
    case 120: // Finished After Extra Time
    case 110: // Finished After Penalties
      return 'FT';

    case 6:  // 1st Half
      return `${match.time ? Math.floor((Date.now() / 1000 - match.time.currentPeriodStartTimestamp) / 60) : 0}'`;
    
    case 7:  // 2nd Half
      const minutes = match.time ? Math.floor((Date.now() / 1000 - match.time.currentPeriodStartTimestamp) / 60) + 45 : 45;
      return `${minutes}'`;
    
    case 31: // Halftime
      return 'HT';

    default:
      return match.status.description;
  }
};

const groupMatches = (matches: SofaScoreMatch[]) => {
  const now = new Date();
  
  return {
    live: matches.filter(m => 
      m.status.description !== 'Finished' && 
      m.status.description !== 'Not started'
    ),
    upcoming: matches.filter(m => 
      m.status.description === 'Not started' && 
      new Date(m.startTime) > now
    ),
    finished: matches.filter(m => 
      m.status.description === 'Finished' && 
      new Date(m.startTime) > new Date(now.getTime() - (24 * 60 * 60 * 1000))
    )
  };
};

export function SofascoreLiveMatches() {
  const [matches, setMatches] = useState<SofaScoreMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<SofaScoreMatch | null>(null)
  const [statistics, setStatistics] = useState<any>(null)
  const [events, setEvents] = useState<MatchEvent[]>([])

  useEffect(() => {
    let isSubscribed = true;

    const fetchMatchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const allMatches = await fetchMatches();
        if (isSubscribed && allMatches) {
          setMatches(allMatches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        if (isSubscribed) {
          setError('Failed to load matches');
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchMatchData();
    const interval = setInterval(fetchMatchData, 30000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const handleMatchClick = async (match: SofaScoreMatch) => {
    setSelectedMatch(match);
    try {
      const [stats, matchEvents] = await Promise.all([
        fetchMatchStatistics(match.id),
        fetchMatchEvents(match.id)
      ]);
      setStatistics(stats);
      setEvents(matchEvents);
    } catch (error) {
      console.error('Error fetching match data:', error);
    }
  };

  const { live, upcoming, finished } = groupMatches(matches);

  if (loading) return <div>Loading Sofascore matches...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (matches.length === 0) return null;

  return (
    <>
      <Card className="mt-8">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold">Recent Matches</h2>
          </div>
        </div>
        <CardContent className="p-0">
          {/* Live Matches */}
          {live.length > 0 && (
            <div>
              <h3 className="font-semibold p-4">Live Matches</h3>
              {live.map((match) => (
                <div 
                  key={match.id}
                  onClick={() => handleMatchClick(match)}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  {/* League header */}
                  <div className="p-2 border-b bg-muted/50 flex items-center gap-2">
                    <img 
                      src={match.league.crest} 
                      alt={match.league.name}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-muted-foreground">
                      {match.league.name}
                      {match.league.round && ` · Round ${match.league.round}`}
                    </span>
                  </div>

                  {/* Match content */}
                  <div className="p-4 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      {/* Time on the left */}
                      <div className="text-sm text-muted-foreground w-12">
                        {getMatchStatus(match)}
                      </div>

                      {/* Teams in the middle */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={match.homeTeam.crest} 
                            alt={match.homeTeam.name} 
                            className="w-6 h-6"
                          />
                          <span className="font-medium">{match.homeTeam.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <img 
                            src={match.awayTeam.crest} 
                            alt={match.awayTeam.name} 
                            className="w-6 h-6"
                          />
                          <span className="font-medium">{match.awayTeam.name}</span>
                        </div>
                      </div>

                      {/* Score on the right */}
                      <div className="flex flex-col items-end gap-2 w-8">
                        <span className="font-bold">{match.homeTeam.score}</span>
                        <span className="font-bold">{match.awayTeam.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Matches */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="font-semibold p-4">Upcoming Matches</h3>
              {upcoming.map((match) => (
                <div 
                  key={match.id}
                  onClick={() => handleMatchClick(match)}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  {/* League header */}
                  <div className="p-2 border-b bg-muted/50 flex items-center gap-2">
                    <img 
                      src={match.league.crest} 
                      alt={match.league.name}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-muted-foreground">
                      {match.league.name}
                      {match.league.round && ` · Round ${match.league.round}`}
                    </span>
                  </div>

                  {/* Match content */}
                  <div className="p-4 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      {/* Time on the left */}
                      <div className="text-sm text-muted-foreground w-12">
                        {getMatchStatus(match)}
                      </div>

                      {/* Teams in the middle */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={match.homeTeam.crest} 
                            alt={match.homeTeam.name} 
                            className="w-6 h-6"
                          />
                          <span className="font-medium">{match.homeTeam.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <img 
                            src={match.awayTeam.crest} 
                            alt={match.awayTeam.name} 
                            className="w-6 h-6"
                          />
                          <span className="font-medium">{match.awayTeam.name}</span>
                        </div>
                      </div>

                      {/* Score on the right */}
                      <div className="flex flex-col items-end gap-2 w-8">
                        <span className="font-bold">{match.homeTeam.score}</span>
                        <span className="font-bold">{match.awayTeam.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Finished Matches */}
          {finished.length > 0 && (
            <div>
              <h3 className="font-semibold p-4">Finished Matches</h3>
              {finished.map((match) => (
                <div 
                  key={match.id}
                  onClick={() => handleMatchClick(match)}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  {/* League header */}
                  <div className="p-2 border-b bg-muted/50 flex items-center gap-2">
                    <img 
                      src={match.league.crest} 
                      alt={match.league.name}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-muted-foreground">
                      {match.league.name}
                      {match.league.round && ` · Round ${match.league.round}`}
                    </span>
                  </div>

                  {/* Match content */}
                  <div className="p-4 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      {/* Time on the left */}
                      <div className="text-sm text-muted-foreground w-12">
                        {getMatchStatus(match)}
                      </div>

                      {/* Teams in the middle */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={match.homeTeam.crest} 
                            alt={match.homeTeam.name} 
                            className="w-6 h-6"
                          />
                          <span className="font-medium">{match.homeTeam.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <img 
                            src={match.awayTeam.crest} 
                            alt={match.awayTeam.name} 
                            className="w-6 h-6"
                          />
                          <span className="font-medium">{match.awayTeam.name}</span>
                        </div>
                      </div>

                      {/* Score on the right */}
                      <div className="flex flex-col items-end gap-2 w-8">
                        <span className="font-bold">{match.homeTeam.score}</span>
                        <span className="font-bold">{match.awayTeam.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>
              <div className="flex items-center gap-2">
                <img 
                  src={selectedMatch?.league.crest} 
                  alt="" 
                  className="w-5 h-5" 
                />
                <span>{selectedMatch?.league.name}</span>
                {selectedMatch?.league.round && (
                  <span className="text-muted-foreground text-sm">
                    · Round {selectedMatch.league.round}
                  </span>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 p-6">
            {selectedMatch && statistics && (
              <div className="space-y-6">
                <div className="sticky top-0 bg-background py-2 z-10">
                  <div className="text-center text-sm text-muted-foreground">
                    {getMatchStatus(selectedMatch)}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={selectedMatch.homeTeam.crest} alt="" className="w-8 h-8" />
                    <span className="font-medium">{selectedMatch.homeTeam.name}</span>
                  </div>
                  <div className="font-bold text-2xl">
                    {selectedMatch.homeTeam.score} - {selectedMatch.awayTeam.score}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{selectedMatch.awayTeam.name}</span>
                    <img src={selectedMatch.awayTeam.crest} alt="" className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-2 border rounded-lg p-4 bg-muted/50">
                  <h3 className="font-semibold mb-4">Match Statistics</h3>
                  {statistics?.statistics ? (
                    statistics.statistics.map((group: StatisticsGroup) => (
                      <div key={group.group} className="space-y-4">
                        <h4 className="text-sm font-medium">{group.group}</h4>
                        <div className="space-y-2">
                          {group.statisticsItems?.map((stat: StatisticsItem) => {
                            const homeValue = Number(stat.home) || 0;
                            const awayValue = Number(stat.away) || 0;
                            const total = homeValue + awayValue;
                            const homePercentage = total > 0 ? (homeValue / total) * 100 : 50;
                            
                            return (
                              <div key={stat.name} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="w-16 text-right">{stat.home}</span>
                                  <span className="text-muted-foreground text-xs uppercase">{stat.name}</span>
                                  <span className="w-16 text-left">{stat.away}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                                  <div 
                                    className="h-full bg-blue-500"
                                    style={{ width: `${homePercentage}%` }}
                                  />
                                  <div 
                                    className="h-full bg-red-500"
                                    style={{ width: `${100 - homePercentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No statistics available
                    </div>
                  )}
                </div>

                <div className="space-y-2 border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Match Events</h3>
                  <div className="space-y-2">
                    {events.map((event, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center gap-2 ${
                          event.team === 'home' ? 'justify-start' : 'flex-row-reverse'
                        }`}
                      >
                        <span className="text-sm text-muted-foreground w-8">
                          {event.time}'
                        </span>
                        
                        {event.type === 'goal' && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm">⚽</span>
                            <span className="font-medium">{event.player.name}</span>
                            {event.assistPlayer && (
                              <span className="text-sm text-muted-foreground">
                                (assist: {event.assistPlayer.name})
                              </span>
                            )}
                          </div>
                        )}

                        {event.type === 'card' && (
                          <div className="flex items-center gap-1">
                            <div 
                              className={`w-3 h-4 rounded-sm ${
                                event.cardType === 'yellow' ? 'bg-yellow-400' : 
                                event.cardType === 'yellowred' ? 'bg-gradient-to-b from-yellow-400 to-red-500' :
                                'bg-red-500'
                              }`}
                            />
                            <span className="font-medium">{event.player.name}</span>
                          </div>
                        )}

                        {event.type === 'var' && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm">📺</span>
                            <span className="font-medium">VAR Review</span>
                            {event.varDetail && (
                              <span className="text-sm text-muted-foreground">
                                ({event.varDetail})
                              </span>
                            )}
                          </div>
                        )}

                        {event.type === 'substitution' && (
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-green-500">↑ {event.subIn?.name}</span>
                            <span className="text-red-500">↓ {event.subOut?.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 