import { log, logGroup, logPerformance } from './logger';

export interface ScoringSettings {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  threePointMade: number;
  doubleDouble: number;
  tripleDouble: number;
  missedFieldGoal: number;
  missedFreeThrow: number;
}

export const SCORING_SETTINGS: ScoringSettings = {
  points: 1,
  rebounds: 1,
  assists: 1.5,
  steals: 3,
  blocks: 3,
  turnovers: -1,
  threePointMade: 1,
  doubleDouble: 3,
  tripleDouble: 7,
  missedFieldGoal: -0.5,
  missedFreeThrow: -0.5,
};

interface PlayerGameStats {
  date: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  threePointersMade: number;
  fantasyPoints: number;
}

interface WeeklyPlayerStats {
  playerName: string;
  playerId: string;
  games: PlayerGameStats[];
  totalFantasyPoints: number;
  averageFantasyPoints: number;
  gamesPlayed: number;
  gamesRemaining: number;
}

export interface PlayerStats {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  threePointersMade: number;
}

/**
 * Calculates if a player has achieved a double-double or triple-double
 * based on their stats
 */
export function calculateSpecialBonuses(stats: PlayerStats): number {
  const startTime = performance.now();
  let bonusPoints = 0;
  
  logGroup('scoring', 'Calculating Special Bonuses', () => {
    // Track double-digit categories
    const doubleDigitStats = {
      points: stats.points >= 10,
      rebounds: stats.rebounds >= 10,
      assists: stats.assists >= 10,
      blocks: stats.blocks >= 10,
      steals: stats.steals >= 10
    };
    
    log('scoring', 'Double-digit categories', doubleDigitStats);
    
    const doubleDigitCount = Object.values(doubleDigitStats).filter(Boolean).length;
    log('scoring', 'Double-digit count', doubleDigitCount);
    
    // Apply bonuses
    if (doubleDigitCount >= 3) {
      bonusPoints += SCORING_SETTINGS.tripleDouble;
      log('scoring', 'Triple-double bonus applied', SCORING_SETTINGS.tripleDouble);
    } else if (doubleDigitCount >= 2) {
      bonusPoints += SCORING_SETTINGS.doubleDouble;
      log('scoring', 'Double-double bonus applied', SCORING_SETTINGS.doubleDouble);
    }
  });
  
  logPerformance('calculateSpecialBonuses', startTime);
  return bonusPoints;
}

/**
 * Calculates fantasy points for a player based on their stats
 * and the league scoring settings
 */
export function calculateFantasyPoints(stats: PlayerStats): number {
  const startTime = performance.now();
  let points = 0;
  
  logGroup('scoring', 'Calculating Fantasy Points', () => {
    log('scoring', 'Input stats', stats);
    
    // Calculate base points
    const basePoints = {
      points: stats.points * SCORING_SETTINGS.points,
      rebounds: stats.rebounds * SCORING_SETTINGS.rebounds,
      assists: stats.assists * SCORING_SETTINGS.assists,
      steals: stats.steals * SCORING_SETTINGS.steals,
      blocks: stats.blocks * SCORING_SETTINGS.blocks,
      turnovers: stats.turnovers * SCORING_SETTINGS.turnovers,
      threePointers: stats.threePointersMade * SCORING_SETTINGS.threePointMade
    };
    
    log('scoring', 'Base points breakdown', basePoints);
    
    // Calculate shot penalties
    const missedFieldGoals = stats.fieldGoalsAttempted - stats.fieldGoalsMade;
    const missedFreeThrows = stats.freeThrowsAttempted - stats.freeThrowsMade;
    
    const penaltyPoints = {
      missedFieldGoals: missedFieldGoals * SCORING_SETTINGS.missedFieldGoal,
      missedFreeThrows: missedFreeThrows * SCORING_SETTINGS.missedFreeThrow
    };
    
    log('scoring', 'Shot penalties', penaltyPoints);
    
    // Calculate bonuses
    const bonusPoints = calculateSpecialBonuses(stats);
    log('scoring', 'Bonus points', bonusPoints);
    
    // Sum up all points
    points = 
      Object.values(basePoints).reduce((sum, points) => sum + points, 0) +
      Object.values(penaltyPoints).reduce((sum, points) => sum + points, 0) +
      bonusPoints;
    
    log('scoring', 'Total fantasy points', points);
  });
  
  logPerformance('calculateFantasyPoints', startTime);
  return Number(points.toFixed(2));
}

export async function getPlayerWeekStats(playerId: string, week: number): Promise<WeeklyPlayerStats | null> {
  try {
    const response = await fetch(`https://api.sleeper.app/v1/stats/nba/regular/2024/${week}`);
    const stats = await response.json();
    
    const playerStats = stats[playerId];
    if (!playerStats) return null;

    const games: PlayerGameStats[] = [];
    
    // Process each game in the week
    if (playerStats.stats) {
      const gameStats: PlayerGameStats = {
        date: playerStats.date || '',
        points: playerStats.stats.pts || 0,
        rebounds: (playerStats.stats.dreb || 0) + (playerStats.stats.oreb || 0),
        assists: playerStats.stats.ast || 0,
        steals: playerStats.stats.stl || 0,
        blocks: playerStats.stats.blk || 0,
        turnovers: playerStats.stats.to || 0,
        fieldGoalsMade: playerStats.stats.fgm || 0,
        fieldGoalsAttempted: playerStats.stats.fga || 0,
        freeThrowsMade: playerStats.stats.ftm || 0,
        freeThrowsAttempted: playerStats.stats.fta || 0,
        threePointersMade: playerStats.stats.tpm || 0,
        fantasyPoints: calculateFantasyPoints({
          points: playerStats.stats.pts || 0,
          rebounds: (playerStats.stats.dreb || 0) + (playerStats.stats.oreb || 0),
          assists: playerStats.stats.ast || 0,
          steals: playerStats.stats.stl || 0,
          blocks: playerStats.stats.blk || 0,
          turnovers: playerStats.stats.to || 0,
          fieldGoalsMade: playerStats.stats.fgm || 0,
          fieldGoalsAttempted: playerStats.stats.fga || 0,
          freeThrowsMade: playerStats.stats.ftm || 0,
          freeThrowsAttempted: playerStats.stats.fta || 0,
          threePointersMade: playerStats.stats.tpm || 0,
        })
      };
      games.push(gameStats);
    }

    const totalFantasyPoints = games.reduce((sum, game) => sum + game.fantasyPoints, 0);
    const gamesPlayed = games.length;
    const averageFantasyPoints = gamesPlayed > 0 ? totalFantasyPoints / gamesPlayed : 0;

    return {
      playerName: `${playerStats.first_name} ${playerStats.last_name}`,
      playerId,
      games,
      totalFantasyPoints,
      averageFantasyPoints,
      gamesPlayed,
      gamesRemaining: 0 // TODO: Calculate remaining games
    };
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return null;
  }
}
