export interface User {
  user_id: string
  display_name: string
  avatar?: string
}

export interface Roster {
  roster_id: number
  owner_id: string
  players?: string[] 
  starters?: string[] 
  settings?: {
    wins: number
    losses: number
    ties: number
  }
}

export interface Matchup {
  matchup_id: number
  roster_id: number
  points: number
  
  // Additional fields for comprehensive debugging
  starters?: string[]
  players?: string[]
  starters_points?: number | null
  
  // Optional metadata for deeper investigation
  metadata?: {
    [key: string]: any
  }
}
