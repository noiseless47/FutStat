import { NextResponse } from 'next/server'

// Mock data
const mockMatches = [
  {
    id: "1",
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    homeScore: 2,
    awayScore: 1,
    status: "LIVE",
    time: "65'"
  },
  {
    id: "2",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeScore: 0,
    awayScore: 0,
    status: "LIVE",
    time: "23'"
  },
  {
    id: "3",
    homeTeam: "Bayern Munich",
    awayTeam: "Dortmund",
    homeScore: 3,
    awayScore: 2,
    status: "LIVE",
    time: "89'"
  }
]

export async function GET() {
  return NextResponse.json(mockMatches)
} 