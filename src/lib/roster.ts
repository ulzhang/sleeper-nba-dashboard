export interface RosterSettings {
  wins: number
  losses: number
  ties: number
  fpts: number
  fpts_decimal: number
  fpts_against: number
  fpts_against_decimal: number
  ppts: number
  ppts_decimal: number
  waiver_budget_used: number
  waiver_position: number
  total_moves: number
}

export interface RosterMetadata {
  team_name?: string
  streak?: string
  record?: string
  // Player nicknames in format: p_nick_[player_id]
  [key: string]: string | undefined
}

export interface Roster {
  roster_id: number
  owner_id: string
  league_id: string
  players: string[] // Array of player IDs
  starters: string[] // Array of starter player IDs
  reserve: string[] | null // Array of IR player IDs
  taxi: string[] | null // Not used in this league
  settings: RosterSettings
  metadata: RosterMetadata
}

export interface RosterLockInfo {
  rosterId: number
  ownerId: string
  totalPlayers: number
  activePlayers: string[]
  reservePlayers: string[]
  benchPlayers: string[]
  hasFullLineup: boolean
  hasOpenSlots: boolean
  hasIRPlayer: boolean
}

/**
 * Get information about which players are locked into different roster positions
 */
export function getRosterLockInfo(roster: Roster): RosterLockInfo {
  const activePlayers = roster.starters || []
  const reservePlayers = roster.reserve || []
  const allPlayers = roster.players || []
  
  // Bench players are those not in starters or reserve
  const benchPlayers = allPlayers.filter(
    playerId => !activePlayers.includes(playerId) && !reservePlayers.includes(playerId)
  )

  return {
    rosterId: roster.roster_id,
    ownerId: roster.owner_id,
    totalPlayers: allPlayers.length,
    activePlayers,
    reservePlayers,
    benchPlayers,
    hasFullLineup: activePlayers.length === 6, // 6 starters in this league
    hasOpenSlots: allPlayers.length < 10, // 10 max roster spots
    hasIRPlayer: reservePlayers.length > 0
  }
}

/**
 * Get player nickname if set in roster metadata
 */
export function getPlayerNickname(roster: Roster, playerId: string): string | undefined {
  const nicknameKey = `p_nick_${playerId}`
  return roster.metadata[nicknameKey]
}

/**
 * Calculate fantasy points per game
 */
export function getFantasyPointsPerGame(roster: Roster): number {
  const totalGames = roster.settings.wins + roster.settings.losses + roster.settings.ties
  if (totalGames === 0) return 0

  const totalPoints = roster.settings.fpts + roster.settings.fpts_decimal / 100
  return Number((totalPoints / totalGames).toFixed(2))
}

/**
 * Get win percentage for the roster
 */
export function getWinPercentage(roster: Roster): number {
  const totalGames = roster.settings.wins + roster.settings.losses + roster.settings.ties
  if (totalGames === 0) return 0

  return Number(((roster.settings.wins / totalGames) * 100).toFixed(1))
}

/**
 * Parse streak information from metadata
 */
export function parseStreak(roster: Roster): { count: number; type: 'W' | 'L' } | null {
  const streak = roster.metadata.streak
  if (!streak) return null

  const count = parseInt(streak)
  const type = streak.endsWith('W') ? 'W' : 'L'

  return { count, type }
}
