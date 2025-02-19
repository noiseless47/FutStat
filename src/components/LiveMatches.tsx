'use client'

;
import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"


import { Activity } from 'lucide-react'
import { fetches, SofaScore} from '@/lib/sofascore-api'

export function LiveMatches() {
  const [matches, setMatches] = useState<SofaScoreMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    // Update every 30 seconds
    const interval = setInterval(fetchMatchData, 30000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (matches.length === 0) return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <h2 className="font-semibold">Live Matches</h2>
        </div>
        <span className="text-sm text-muted-foreground">Premier League</span>
      </div>
      <CardContent className="p-4">
        No live matches at the moment
      </CardContent>
    </Card>
  )

  return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500" />
          <h2 className="font-semibold">Live Matches</h2>
        </div>
        <span className="text-sm text-muted-foreground">Premier League</span>
      </div>
      <CardContent className="p-0">
        {matches.map((match) => (
          <div 
            key={match.id} 
            className="p-4 border-b last:border-0 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <img 
                  src={match.homeTeam.crest} 
                  alt={match.homeTeam.name} 
                  className="w-6 h-6"
                />
                <span className="font-medium">{match.homeTeam.shortName}</span>
              </div>
              <div className="font-bold">
                {match.homeTeam.score} - {match.awayTeam.score}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{match.awayTeam.shortName}</span>
                <img 
                  src={match.awayTeam.crest} 
                  alt={match.awayTeam.name} 
                  className="w-6 h-6"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 