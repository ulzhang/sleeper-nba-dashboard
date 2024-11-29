import nbaPlayers from '@/data/nba_players.json';

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  team?: string;
  position?: string;
  injury_status?: string;
  injury_note?: string;
  age?: number;
  number?: number;
  years_exp?: number;
  college?: string;
  status?: string;
}

// Create a map for quick player lookups
const playerMap = new Map<string, SleeperPlayer>();

// Initialize the player map
Object.entries(nbaPlayers).forEach(([id, player]: [string, any]) => {
  playerMap.set(id, {
    player_id: id,
    first_name: player.first_name,
    last_name: player.last_name,
    team: player.team,
    position: player.position,
    injury_status: player.injury_status,
    injury_note: player.injury_note,
    age: player.age,
    number: player.number,
    years_exp: player.years_exp,
    college: player.college,
    status: player.status,
  });
});

/**
 * Get a player by their Sleeper ID
 */
export function getPlayerById(id: string): SleeperPlayer | undefined {
  return playerMap.get(id);
}

/**
 * Search for players by name (case-insensitive)
 */
export function searchPlayersByName(query: string): SleeperPlayer[] {
  const searchQuery = query.toLowerCase();
  return Array.from(playerMap.values()).filter(player => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    return fullName.includes(searchQuery);
  });
}

/**
 * Get all active players
 */
export function getAllActivePlayers(): SleeperPlayer[] {
  return Array.from(playerMap.values()).filter(player => 
    player.status !== 'Inactive' && player.team
  );
}

/**
 * Get players by team
 */
export function getPlayersByTeam(team: string): SleeperPlayer[] {
  return Array.from(playerMap.values()).filter(player => 
    player.team === team.toUpperCase()
  );
}

/**
 * Get players by position
 */
export function getPlayersByPosition(position: string): SleeperPlayer[] {
  return Array.from(playerMap.values()).filter(player => 
    player.position === position.toUpperCase()
  );
}
