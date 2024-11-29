import nbaPlayers from '@/data/nba_players.json';
import { calculateFantasyPoints, SCORING_SETTINGS } from './scoring';
import { log, logError, logGroup, logPerformance } from './logger';

export interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  team: string | null;  // Updated to allow null
  position: string;
  injury_status?: string;
  injury_note?: string;
}

export interface PlayerStats {
  player_id: string;
  stats: {
    pts?: number;
    reb?: number;
    ast?: number;
    stl?: number;
    blk?: number;
    to?: number;
    fgm?: number;
    fga?: number;
    ftm?: number;
    fta?: number;
    tpm?: number;
  };
}

// Initialize player cache
const playersCache: Map<string, Player> = new Map();

// Initialize cache on module load
initializePlayerCache();

export function initializePlayerCache(): void {
  const startTime: number = performance.now();
  log('init', 'Initializing player cache');
  
  Object.values(nbaPlayers).forEach((player: any) => {
    const mappedPlayer: Player = {
      player_id: player.player_id,
      first_name: player.first_name,
      last_name: player.last_name,
      team: player.team || 'FA',  // Use 'FA' for free agents
      position: player.fantasy_positions?.[0] || 'UTIL',
      injury_status: player.injury_status,
      injury_note: player.injury_note
    };
    playersCache.set(mappedPlayer.player_id, mappedPlayer);
  });
  
  log('cache', `Cached ${playersCache.size} players`);
  logPerformance('initializePlayerCache', startTime);
}

export function getPlayer(playerId: string): Player | undefined {
  log('players', `Looking up player: ${playerId}`);
  return playersCache.get(playerId);
}

export async function getTopPerformers(week: number): Promise<(Player & { fantasyPoints: number })[]> {
  const startTime: number = performance.now();
  try {
    log('api', `Fetching projections for week ${week}`);
    const response: Response = await fetch(`https://api.sleeper.com/projections/nba/2024/${week}?season_type=regular&position[]=C&position[]=F&position[]=G&position[]=UTIL&order_by=std`);
    const projections: any[] = await response.json();
    
    log('api', 'Received projections response', { count: projections.length });
    if (projections.length > 0) {
      log('api', 'Sample projection', projections[0]);
    }
    
    const processedPlayerIds: Set<string> = new Set();
    
    const playerScores = projections
      .map((projection: any): (Player & { fantasyPoints: number }) | null => {
        const player: Player | undefined = playersCache.get(projection.player_id);
        
        if (!player || !projection.stats || processedPlayerIds.has(projection.player_id)) {
          log('players', `Skipping player ${projection.player_id}`, {
            found: !!player,
            hasStats: !!projection.stats,
            alreadyProcessed: processedPlayerIds.has(projection.player_id)
          });
          return null;
        }
        
        processedPlayerIds.add(projection.player_id);
        
        let result: (Player & { fantasyPoints: number }) | null = null;
        
        logGroup('stats', `Processing ${player.first_name} ${player.last_name}`, () => {
          log('stats', 'Raw stats', projection.stats);
          
          const mappedStats = {
            points: projection.stats.pts || 0,
            rebounds: (projection.stats.dreb || 0) + (projection.stats.oreb || 0),
            assists: projection.stats.ast || 0,
            steals: projection.stats.stl || 0,
            blocks: projection.stats.blk || 0,
            turnovers: projection.stats.to || 0,
            fieldGoalsMade: projection.stats.fgm || 0,
            fieldGoalsAttempted: projection.stats.fga || 0,
            freeThrowsMade: projection.stats.ftm || 0,
            freeThrowsAttempted: projection.stats.fta || 0,
            threePointersMade: projection.stats.tpm || 0,
          };
          
          log('stats', 'Mapped stats', mappedStats);
          
          const fantasyPoints: number = calculateFantasyPoints(mappedStats);
          result = { ...player, fantasyPoints };
        });
        
        return result;
      })
      .filter((player): player is (Player & { fantasyPoints: number }) => 
        player !== null && player.fantasyPoints > 0
      )
      .sort((a, b) => b.fantasyPoints - a.fantasyPoints);
      
    log('players', `Processed ${playerScores.length} valid player scores`);
    
    logPerformance('getTopPerformers', startTime);
    return playerScores.slice(0, 20);
  } catch (error) {
    logError('Failed to fetch top performers', error);
    return [];
  }
}
