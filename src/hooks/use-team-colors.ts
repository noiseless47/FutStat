import React, { useState, useEffect } from 'react'

interface TeamColors {
  primary: string
  secondary: string
}

function isColorTooBright(color: string): boolean {
  // Remove the '#' and convert to RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate relative luminance
  // Using the formula: (0.299*R + 0.587*G + 0.114*B)
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return brightness > 0.85 // If brightness is > 85%, consider it too bright
}

export function useTeamColors(teamId: number) {
  const [colors, setColors] = useState<TeamColors>({
    primary: '#22c55e', // default green
    secondary: '#3b82f6' // default blue
  })

  useEffect(() => {
    const fetchTeamColors = async () => {
      try {
        const response = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}`, {
          headers: { 'User-Agent': '...' }
        })
        const data = await response.json()
        
        let primaryColor = data.team.teamColors?.primary || '#22c55e'
        let secondaryColor = data.team.teamColors?.secondary || '#3b82f6'

        // If primary color is white or too bright, try to use secondary color
        if (!primaryColor || primaryColor === '#ffffff' || isColorTooBright(primaryColor)) {
          primaryColor = secondaryColor
        }
        
        // If we still have a white/bright color, use defaults
        if (!primaryColor || primaryColor === '#ffffff' || isColorTooBright(primaryColor)) {
          primaryColor = '#22c55e' // default green
        }

        setColors({
          primary: primaryColor,
          secondary: secondaryColor
        })
      } catch (error) {
        console.error('Error fetching team colors:', error)
      }
    }

    if (teamId) {
      fetchTeamColors()
    }
  }, [teamId])

  return colors
} 