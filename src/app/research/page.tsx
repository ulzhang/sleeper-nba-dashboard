'use client';

import { useResearchData } from '@/lib/queries';
import ResearchTable from '@/components/ResearchTable';
import { log, logError, enableLogging } from '@/lib/logger';
import { getPlayer, PLAYERS } from '@/lib/players';
import { getCurrentWeek } from '@/lib/config';
import { useRosters } from '@/lib/queries';

export default function ResearchPage() {
  // Enable research-related logging
  enableLogging('research', 'data', 'api', 'players');

  const currentWeek = getCurrentWeek();
  const { data: researchData, isLoading: researchLoading, error: researchError } = useResearchData();
  const { data: rosters, isLoading: rostersLoading, error: rostersError } = useRosters();

  log('research', `Rendering Research Page for Week ${currentWeek}`, { 
    researchLoading, 
    rostersLoading,
    hasResearchData: !!researchData,
    hasRosters: !!rosters
  });

  if (researchLoading || rostersLoading) {
    log('research', 'Data is loading');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (researchError || rostersError) {
    logError('Failed to load data', { researchError, rostersError });
    return (
      <div className="text-center text-red-600 p-4">
        Failed to load research data. Please try again later.
      </div>
    );
  }

  if (!researchData || !rosters) {
    log('research', 'No data available');
    return null;
  }

  // Create a set of all player IDs owned by teams
  const ownedPlayerIds = new Set<string>();
  rosters.forEach(roster => {
    roster.players?.forEach(playerId => {
      ownedPlayerIds.add(playerId);
    });
  });

  // Transform research data into the format expected by ResearchTable
  const playerStats: Record<string, { 
    owned: number; 
    started: number; 
    teamOwned: boolean 
  }> = {};

  // Safely get player IDs
  const allPlayerIds = PLAYERS ? Object.keys(PLAYERS) : [];
  log('research', 'Total players in cache', { count: allPlayerIds.length });

  // Track player ID mismatches
  const missingPlayerIds: string[] = [];

  Object.entries(researchData).forEach(([playerId, playerData]: [string, any]) => {
    const player = getPlayer(playerId);
    
    // Log each player's data for debugging
    log('research', `Processing player ${playerId}`, {
      player,
      playerData,
      playerExists: !!player,
      ownedPct: playerData?.owned,
      startPct: playerData?.started,
      isTeamOwned: ownedPlayerIds.has(playerId)
    });

    // Track missing players
    if (!player) {
      missingPlayerIds.push(playerId);
    }

    // Only include NBA players
    if (player) {
      // Debugging: log the actual values before multiplication
      const ownedPct = playerData?.owned ?? 0;
      const startPct = playerData?.started ?? 0;
      const isTeamOwned = ownedPlayerIds.has(playerId);
      
      log('research', `Player ${playerId} percentages`, {
        rawOwnedPct: ownedPct,
        rawStartPct: startPct,
        processedOwnedPct: ownedPct,
        processedStartPct: startPct,
        teamOwned: isTeamOwned
      });

      playerStats[playerId] = {
        owned: ownedPct,
        started: startPct,
        teamOwned: isTeamOwned
      };
    }
  });

  log('research', `Processed research data for ${Object.keys(playerStats).length} players`);

  // If no players were processed, log all players to understand why
  if (Object.keys(playerStats).length === 0) {
    log('research', 'No players processed', {
      researchDataKeys: Object.keys(researchData),
      playerCacheKeys: allPlayerIds,
      missingPlayerIds
    });
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Player Research</h1>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          Week {currentWeek}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <ResearchTable data={playerStats} />
      </div>
    </div>
  );
}
