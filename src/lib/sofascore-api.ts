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
  tournament: {
    name: string;
    uniqueTournament: {
      id: number;
      name: string;
    };
    category?: {
      name: string;
      flag?: string;
    };
    round?: {
      round?: number;
      name?: string;
    };
  };
  status: {
    code: number;
    description: string;
    type: string;
  };
  time?: {
    currentPeriodStartTimestamp: number;
    initial: number;
    max: number;
    extra?: number;
    injuryTime?: number;
    timestamp: number;
  };
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    crest: string;
  };
  homeScore: {
    current: number;
    display: number;
    period1?: number;
    period2?: number;
  };
  awayScore: {
    current: number;
    display: number;
    period1?: number;
    period2?: number;
  };
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
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching matches for date:', today);
    
    const response = await fetch(
      `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${today}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );
    const data = await response.json();
    console.log('Raw API response:', data);

    // Map all matches without filtering
    const matches = (data.events || []).map((event: any) => {
      console.log('Processing event:', event);
      return {
        id: event.id,
        tournament: {
          name: event.tournament.name,
          uniqueTournament: {
            id: event.tournament.uniqueTournament.id,
            name: event.tournament.uniqueTournament.name
          },
          category: event.tournament.category ? {
            name: event.tournament.category.name,
            flag: event.tournament.category.flag
          } : undefined,
          round: event.roundInfo ? {
            round: event.roundInfo.round,
            name: event.roundInfo.name
          } : undefined
        },
        status: {
          code: getStatusCode(event.status.description),
          description: event.status.description,
          type: event.status.type
        },
        time: {
          currentPeriodStartTimestamp: event.time?.currentPeriodStartTimestamp,
          initial: event.time?.initial || 0,
          max: event.time?.max || 90,
          extra: event.time?.extra,
          injuryTime: event.time?.injuryTime,
          timestamp: event.startTimestamp
        },
        homeTeam: {
          id: event.homeTeam.id,
          name: event.homeTeam.name,
          shortName: event.homeTeam.shortName || event.homeTeam.name,
          crest: `https://api.sofascore.app/api/v1/team/${event.homeTeam.id}/image`
        },
        awayTeam: {
          id: event.awayTeam.id,
          name: event.awayTeam.name,
          shortName: event.awayTeam.shortName || event.awayTeam.name,
          crest: `https://api.sofascore.app/api/v1/team/${event.awayTeam.id}/image`
        },
        homeScore: {
          current: event.homeScore?.current || 0,
          display: event.homeScore?.display || 0,
          period1: event.homeScore?.period1,
          period2: event.homeScore?.period2
        },
        awayScore: {
          current: event.awayScore?.current || 0,
          display: event.awayScore?.display || 0,
          period1: event.awayScore?.period1,
          period2: event.awayScore?.period2
        }
      };
    });

    console.log('Processed matches:', matches);
    return matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

// Helper function to convert status description to code
function getStatusCode(description: string): number {
  // Add more status mappings based on what we see in the logs
  const statusMap: { [key: string]: number } = {
    'Not started': 0,
    '1st half': 1,
    'First half': 1,
    'Halftime': 2,
    'HT': 2,
    '2nd half': 3,
    'Second half': 3,
    'Extra Time': 4,
    'ET': 4,
    'Penalty Shootout': 5,
    'PEN': 5,
    'Break Time': 6,
    'BT': 6,
    'Finished': 7,
    'FT': 7,
    'AET': 7,
    'AP': 7,
    'Ended': 7,
    'Interrupted': 8,
    'Abandoned': 9,
    'Postponed': 10,
    'Cancelled': 11
  };

  console.log('Status description:', description); // Debug log
  console.log('Mapped status code:', statusMap[description]); // Debug log

  return statusMap[description] ?? 0;
}

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

// Helper function to get match time display
export function getMatchTime(match: SofaScoreMatch): string {
  if (!match.status || !match.time) return match.status?.description || '';

  const now = Math.floor(Date.now() / 1000);
  const elapsed = Math.floor((now - match.time.currentPeriodStartTimestamp) / 60);

  if (match.status.description.includes('1st half')) {
    const regularTime = Math.min(elapsed, 45);
    const injuryTime = elapsed > 45 ? elapsed - 45 : match.time.injuryTime;
    return injuryTime ? `45+${injuryTime}'` : `${regularTime}'`;
  }

  if (match.status.description.includes('2nd half')) {
    const regularTime = Math.min(elapsed + 45, 90);
    const injuryTime = elapsed + 45 > 90 ? elapsed + 45 - 90 : match.time.injuryTime;
    return injuryTime ? `90+${injuryTime}'` : `${regularTime}'`;
  }

  // For other statuses, just return the description
  return match.status.description;
} 