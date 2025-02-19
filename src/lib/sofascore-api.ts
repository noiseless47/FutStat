export interface SofaScoreLeague {
  id: number;
  name: string;
  shortName?: string;
  crest: string;
  round?: string;
  season?: string;
}

export interface SofaScoreMatch {
  id: number;
  status: {
    code: number;
    description: string;
  };
  time?: {
    initial: number;      // Base time in seconds
    max: number;         // Maximum time in seconds
    extra: number;       // Additional time in seconds
    injuryTime1?: number; // First half injury time
    currentPeriodStartTimestamp: number;
  };
  period?: {
    current: number;  // 1 for first half, 2 for second half
  };
  score: {
    current: {
      home: number;
      away: number;
    };
    period1?: {
      home: number;
      away: number;
    };
  };
  homeTeam: {
    name: string;
    shortName: string;
    crest: string;
    score: number;
  };
  awayTeam: {
    name: string;
    shortName: string;
    crest: string;
    score: number;
  };
  league: SofaScoreLeague;
  startTime: Date;
}

const TOP_LEAGUES = {
  premierLeague: 17,
  laLiga: 8,
  bundesliga: 35,
  serieA: 23,
  ligue1: 34,
  championsLeague: 7
};

export const fetchMatches = async (): Promise<SofaScoreMatch[]> => {
  try {
    // Get dates for 24h window
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

    // Format dates as YYYY-MM-DD
    const fromDate = yesterday.toISOString().split('T')[0];
    const toDate = tomorrow.toISOString().split('T')[0];

    // Fetch matches for each date
    const responses = await Promise.all([
      fetch(`https://api.sofascore.com/api/v1/sport/football/scheduled-events/${fromDate}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }),
      fetch(`https://api.sofascore.com/api/v1/sport/football/scheduled-events/${toDate}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
    ]);

    const [yesterdayData, tomorrowData] = await Promise.all(
      responses.map(r => r.json())
    );

    // Combine and filter matches
    const allMatches = [...yesterdayData.events, ...tomorrowData.events];
    const filteredMatches = allMatches.filter(event => 
      Object.values(TOP_LEAGUES).includes(event.tournament.uniqueTournament.id)
    );

    return filteredMatches.map((event: any) => ({
      id: event.id,
      status: {
        code: event.status.code,
        description: event.status.description
      },
      time: event.time ? {
        initial: event.time.initial,
        max: event.time.max,
        extra: event.time.extra,
        injuryTime1: event.time.injuryTime1,
        currentPeriodStartTimestamp: event.time.currentPeriodStartTimestamp
      } : undefined,
      period: {
        current: event.period?.current || 0
      },
      score: {
        current: {
          home: event.homeScore?.current || 0,
          away: event.awayScore?.current || 0
        },
        period1: event.homeScore?.period1 !== undefined && event.awayScore?.period1 !== undefined ? {
          home: event.homeScore.period1,
          away: event.awayScore.period1
        } : undefined
      },
      homeTeam: {
        name: event.homeTeam.name,
        shortName: event.homeTeam.shortName || event.homeTeam.name,
        crest: `https://api.sofascore.app/api/v1/team/${event.homeTeam.id}/image`,
        score: event.homeScore.current
      },
      awayTeam: {
        name: event.awayTeam.name,
        shortName: event.awayTeam.shortName || event.awayTeam.name,
        crest: `https://api.sofascore.app/api/v1/team/${event.awayTeam.id}/image`,
        score: event.awayScore.current
      },
      league: {
        id: event.tournament.uniqueTournament.id,
        name: event.tournament.uniqueTournament.name,
        shortName: event.tournament.uniqueTournament.shortName || event.tournament.uniqueTournament.name,
        crest: `https://api.sofascore.app/api/v1/unique-tournament/${event.tournament.uniqueTournament.id}/image`,
        round: event.roundInfo?.round,
        season: event.season?.name
      },
      startTime: new Date(event.startTimestamp * 1000)
    }));

  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

export interface MatchStatistics {
  statistics: Array<{
    group: string;
    statisticsItems: Array<{
      name: string;
      home: string | number;
      away: string | number;
    }>;
  }>;
}

export const fetchMatchStatistics = async (matchId: number): Promise<MatchStatistics> => {
  const response = await fetch(`https://api.sofascore.com/api/v1/event/${matchId}/statistics`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle case where statistics might not be available
  if (!data.statistics || !Array.isArray(data.statistics)) {
    return { statistics: [] };
  }
  
  // Transform the data into a more usable format
  return {
    statistics: data.statistics.map((group: any) => ({
      group: group.groupName || 'Other',
      statisticsItems: Array.isArray(group.statisticsItems) ? 
        group.statisticsItems.map((item: any) => ({
          name: item.name || '',
          home: item.home ?? 0,
          away: item.away ?? 0
        })) : []
    }))
  };
};

export interface StandingTeam {
  id: number;
  name: string;
  shortName: string;
  crest: string;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface LeagueStandings {
  id: number;
  name: string;
  crest: string;
  standings: StandingTeam[];
  seasonId: number;
}

const LEAGUES = {
  premierLeague: { id: 17, seasonId: 52186 },
  laLiga: { id: 8, seasonId: 52376 },
  bundesliga: { id: 35, seasonId: 52608 },
  serieA: { id: 23, seasonId: 52760 },
  ligue1: { id: 34, seasonId: 52571 },
  championsLeague: { id: 7, seasonId: 52162 }
};

export const fetchLeagueStandings = async (leagueId: number): Promise<LeagueStandings> => {
  // First, get the current season ID for this league
  const seasonResponse = await fetch(`https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/seasons`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    cache: 'no-store'
  });

  const seasonData = await seasonResponse.json();
  const currentSeasonId = seasonData.seasons[0].id;

  // Then fetch standings with the correct season ID
  const response = await fetch(`https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${currentSeasonId}/standings/total`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Log the raw data to see the structure
  console.log('Raw standings data:', data);

  return {
    id: leagueId,
    name: data.name,
    crest: `https://api.sofascore.app/api/v1/unique-tournament/${leagueId}/image`,
    standings: data.standings[0].rows.map((row: any) => {
      const goalsFor = row.score?.for || row.scoresFor || 0;
      const goalsAgainst = row.score?.against || row.scoresAgainst || 0;
      
      return {
        id: row.team.id,
        name: row.team.name,
        shortName: row.team.shortName || row.team.name,
        crest: `https://api.sofascore.app/api/v1/team/${row.team.id}/image`,
        position: row.position,
        points: row.points,
        played: row.matches,
        won: row.wins,
        drawn: row.draws,
        lost: row.losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst
      };
    }),
    seasonId: currentSeasonId
  };
};

export const fetchTeamData = async (teamId: number) => {
  const response = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export interface MatchEvent {
  time: number;
  type: 'goal' | 'card' | 'substitution' | 'var';
  team: 'home' | 'away';
  player: {
    name: string;
    id: number;
  };
  assistPlayer?: {
    name: string;
    id: number;
  };
  cardType?: 'yellow' | 'red' | 'yellowred';
  varDetail?: string;
  subIn?: {
    name: string;
    id: number;
  };
  subOut?: {
    name: string;
    id: number;
  };
}

export const fetchMatchEvents = async (matchId: number): Promise<MatchEvent[]> => {
  const response = await fetch(`https://api.sofascore.com/api/v1/event/${matchId}/incidents`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  return data.incidents.map((incident: any) => ({
    time: incident.time,
    type: incident.incidentType.toLowerCase(),
    team: incident.isHome ? 'home' : 'away',
    player: {
      name: incident.player?.name || '',
      id: incident.player?.id || 0
    },
    assistPlayer: incident.assistPlayer ? {
      name: incident.assistPlayer.name,
      id: incident.assistPlayer.id
    } : undefined,
    cardType: incident.cardType?.toLowerCase(),
    varDetail: incident.varDetail,
    subIn: incident.playerIn ? {
      name: incident.playerIn.name,
      id: incident.playerIn.id
    } : undefined,
    subOut: incident.playerOut ? {
      name: incident.playerOut.name,
      id: incident.playerOut.id
    } : undefined
  }));
};

export interface SearchResult {
  id: number;
  type: 'team' | 'player' | 'league';
  name: string;
  shortName?: string;
  crest?: string;
  country?: {
    name: string;
    flag?: string;
  };
}

export const searchSofascore = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];

  const response = await fetch(`https://api.sofascore.com/api/v1/search/${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  const data = await response.json();
  
  return data.results.map((result: any) => {
    // Debug logs
    console.log('Raw result:', {
      type: result.type,
      entityType: result.entity?.type,
      entity: result.entity
    });

    // The type is directly in the result
    const type = result.type;
    const entity = result.entity;

    // Map tournament type to league
    const mappedType = type === 'player' ? 'player' : 
                      type === 'team' ? 'team' : 
                      type === 'tournament' ? 'league' :
                      type === 'uniqueTournament' ? 'league' : 'team';

    console.log('Mapped type:', mappedType); // Debug log

    return {
      id: entity.id,
      type: mappedType,
      name: entity.name,
      shortName: entity.shortName,
      crest: getCrestUrl(mappedType, entity.id),
      country: entity.country ? {
        name: entity.country.name,
        flag: entity.country.alpha2?.toLowerCase()
          ? `https://api.sofascore.app/api/v1/country/${entity.country.alpha2.toLowerCase()}/image`
          : undefined
      } : undefined
    };
  });
};

// Helper function to get the correct crest URL
const getCrestUrl = (type: 'team' | 'player' | 'league', id: number) => {
  switch (type) {
    case 'team':
      return `https://api.sofascore.app/api/v1/team/${id}/image`;
    case 'player':
      return `https://api.sofascore.app/api/v1/player/${id}/image`;
    case 'league':
      return `https://api.sofascore.app/api/v1/unique-tournament/${id}/image`;
    default:
      return undefined;
  }
};

export async function fetchPlayerDetails(playerId: number) {
  try {
    const response = await fetch(
      `https://api.sofascore.com/api/v1/player/${playerId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    )
    const data = await response.json()
    return data.player
  } catch (error) {
    console.error('Error fetching player details:', error)
    throw error
  }
}

export async function fetchPlayerAttributes(playerId: number) {
  try {
    const response = await fetch(
      `https://api.sofascore.com/api/v1/player/${playerId}/attribute-overviews`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    )
    const data = await response.json()
    return data.playerAttributeOverviews
  } catch (error) {
    console.error('Error fetching player attributes:', error)
    throw error
  }
}

export async function fetchPlayerStatistics(playerId: number) {
  try {
    // First get the player details to find their current team and tournament
    const playerResponse = await fetch(
      `https://api.sofascore.com/api/v1/player/${playerId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    )
    const playerData = await playerResponse.json()
    console.log('Player data:', playerData.player)

    // Get the primary tournament ID (usually the domestic league)
    const primaryTournament = playerData.player?.team?.primaryUniqueTournament
    const tournamentId = primaryTournament?.id

    if (!tournamentId) {
      console.error('No tournament found for player')
      return null
    }

    console.log('Tournament ID:', tournamentId)

    // Get the current season for the player's tournament
    const seasonResponse = await fetch(
      `https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/seasons`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    )
    const seasonData = await seasonResponse.json()
    console.log('Season data:', seasonData)

    // Find the current active season
    const currentSeason = seasonData.seasons.find((season: any) => season.status === 'ACTIVE')
    const currentSeasonId = currentSeason?.id || seasonData.seasons[0].id

    console.log('Season ID:', currentSeasonId)

    // Then fetch player statistics with the current season and tournament
    const response = await fetch(
      `https://api.sofascore.com/api/v1/player/${playerId}/unique-tournament/${tournamentId}/season/${currentSeasonId}/statistics/overall`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch player statistics:', await response.text())
      return null
    }

    const data = await response.json()
    console.log('Statistics data:', data)
    
    return data.statistics
  } catch (error) {
    console.error('Error fetching player statistics:', error)
    return null
  }
}

export async function fetchPlayerRecentMatches(playerId: number) {
  try {
    const response = await fetch(
      `https://api.sofascore.com/api/v1/player/${playerId}/events/last/0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    )
    if (!response.ok) throw new Error('Failed to fetch recent matches')
    const data = await response.json()
    
    // Fetch player statistics for each match
    const matchesWithStats = await Promise.all(
      data.events.map(async (match: any) => {
        try {
          const statsResponse = await fetch(
            `https://api.sofascore.com/api/v1/event/${match.id}/player/${playerId}/statistics`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            }
          )
          if (!statsResponse.ok) return match
          const statsData = await statsResponse.json()
          return { 
            ...match, 
            statistics: statsData
          }
        } catch (error) {
          console.error(`Error fetching stats for match ${match.id}:`, error)
          return match
        }
      })
    )
    
    return matchesWithStats
  } catch (error) {
    console.error('Error fetching recent matches:', error)
    return null
  }
}

export async function fetchPlayerTournaments(playerId: number) {
  try {
    const response = await fetch(
      `https://api.sofascore.com/api/v1/player/${playerId}/unique-tournaments`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    )
    if (!response.ok) throw new Error('Failed to fetch player tournaments')
    const data = await response.json()
    return data.uniqueTournaments
  } catch (error) {
    console.error('Error fetching player tournaments:', error)
    return null
  }
} 