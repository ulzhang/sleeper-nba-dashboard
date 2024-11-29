'use client';

import { useState, useEffect } from 'react';
import { getCurrentWeek } from '@/lib/config';
import { getTopPerformers, type Player } from '@/lib/players';
import { log, logError, logGroup, logPerformance } from '@/lib/logger';

export default function PlayersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [topPerformers, setTopPerformers] = useState<(Player & { fantasyPoints?: number })[]>([]);
  const currentWeek = getCurrentWeek();

  useEffect(() => {
    const loadTopPerformers = async () => {
      const startTime = performance.now();
      setIsLoading(true);
      
      logGroup('ui', 'Loading Top Performers', () => {
        log('ui', `Fetching data for week ${currentWeek}`);
      });
      
      try {
        const performers = await getTopPerformers(currentWeek);
        log('data', `Loaded ${performers.length} top performers`);
        setTopPerformers(performers);
      } catch (error) {
        logError('Failed to load top performers', error);
      }
      
      setIsLoading(false);
      logPerformance('loadTopPerformers', startTime);
    };

    loadTopPerformers();
  }, [currentWeek]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Player Stats</h1>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Top Performers - Week {currentWeek}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPerformers.map((player) => (
              <div
                key={player.player_id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {player.first_name} {player.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {player.team} • {player.position}
                    </div>
                  </div>
                  {player.fantasyPoints && (
                    <div className="text-lg font-bold text-blue-600">
                      {player.fantasyPoints.toFixed(1)} FP
                    </div>
                  )}
                </div>
                {player.injury_status && (
                  <div className="mt-2 text-xs px-2 py-1 bg-red-100 text-red-800 rounded inline-block">
                    {player.injury_status}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}