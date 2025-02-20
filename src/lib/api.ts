const API_FOOTBALL_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
      elapsed: number;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number;
    away: number;
  };
}

export async function fetchLiveScores() {
  const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': API_FOOTBALL_KEY || ''
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch live scores')
  }
  
  const data = await response.json()
  
  // Transform the API response to match our interface
  return data.response.map((fixture: ApiFixture) => ({
    id: fixture.fixture.id.toString(),
    homeTeam: fixture.teams.home.name,
    awayTeam: fixture.teams.away.name,
    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,
    status: fixture.fixture.status.short,
    time: fixture.fixture.status.elapsed + "'"
  }))
} 