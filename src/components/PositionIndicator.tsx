'use client'

// Define qualification zones for different competitions
export const QUALIFICATION_ZONES = {
  // Premier League
  2021: {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5],
    conferenceLeague: [6],
    relegation: [18, 19, 20]
  },
  // La Liga
  2014: {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5],
    conferenceLeague: [6],
    relegation: [18, 19, 20]
  },
  // Bundesliga
  2002: {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5],
    conferenceLeague: [6],
    relegation: [16, 17], // 16 is playoff
    directRelegation: [17, 18]
  },
  // Serie A
  2019: {
    championsLeague: [1, 2, 3, 4],
    europaLeague: [5],
    conferenceLeague: [6],
    relegation: [18, 19, 20]
  },
  // Ligue 1
  2015: {
    championsLeague: [1, 2, 3],
    championsLeaguePlayoff: [4],
    europaLeague: [5],
    relegation: [16, 17, 18] // 16 is playoff
  }
}

interface PositionIndicatorProps {
  position: number
  competitionId: number | string
}

export function PositionIndicator({ position, competitionId }: PositionIndicatorProps) {
  const zones = QUALIFICATION_ZONES[competitionId as keyof typeof QUALIFICATION_ZONES]
  if (!zones) return <span>{position}</span>

  let bgColor = ''
  let title = ''

  if (zones.championsLeague.includes(position)) {
    bgColor = 'bg-blue-500'
    title = 'Champions League qualification'
  } else if (zones.championsLeaguePlayoff?.includes(position)) {
    bgColor = 'bg-blue-300'
    title = 'Champions League qualification playoffs'
  } else if (zones.europaLeague.includes(position)) {
    bgColor = 'bg-orange-500'
    title = 'Europa League qualification'
  } else if (zones.conferenceLeague?.includes(position)) {
    bgColor = 'bg-green-500'
    title = 'Conference League qualification'
  } else if (zones.relegation.includes(position)) {
    bgColor = 'bg-red-500'
    title = zones.directRelegation?.includes(position) ? 'Relegation' : 'Relegation playoff'
  } else {
    return <span>{position}</span>
  }

  return (
    <div 
      className={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center text-white text-sm`}
      title={title}
    >
      {position}
    </div>
  )
} 