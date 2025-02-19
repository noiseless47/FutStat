export interface Player {
  name: string
  slug: string
  shortName: string
  position: string
  jerseyNumber: string
  height: number
  preferredFoot: string
  userCount: number
  deceased: boolean
  gender: string
  id: number
  shirtNumber: number
  dateOfBirthTimestamp: number
  contractUntilTimestamp: number
  proposedMarketValue: number
  proposedMarketValueRaw: {
    value: number
    currency: string
  }
  team: Team
  country: Country
  fieldTranslations: {
    nameTranslation: Record<string, string>
    shortNameTranslation: Record<string, string>
  }
}

export interface Team {
  name: string
  slug: string
  shortName: string
  gender: string
  sport: Sport
  tournament: Tournament
  primaryUniqueTournament: UniqueTournament
  userCount: number
  nameCode: string
  disabled: boolean
  national: boolean
  type: number
  id: number
  country: Country
  entityType: string
  teamColors: {
    primary: string
    secondary: string
    text: string
  }
  fieldTranslations: {
    nameTranslation: Record<string, string>
    shortNameTranslation: Record<string, string>
  }
}

export interface Sport {
  name: string
  slug: string
  id: number
}

export interface Tournament {
  name: string
  slug: string
  category: Category
  uniqueTournament: UniqueTournament
  priority: number
  isLive: boolean
  id: number
}

export interface Category {
  name: string
  slug: string
  sport: Sport
  id: number
  country: Country
  flag: string
  alpha2: string
}

export interface UniqueTournament {
  name: string
  slug: string
  primaryColorHex: string
  secondaryColorHex: string
  category: Category
  userCount: number
  id: number
  country: Record<string, never>
  displayInverseHomeAwayTeams: boolean
}

export interface Country {
  alpha2: string
  alpha3: string
  name: string
  slug: string
} 