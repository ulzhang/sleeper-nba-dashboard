'use client';

import { useState, useEffect } from 'react';
import { getPlayerWeekStats } from '@/lib/scoring';
import { fetchNBASchedule, getTeamName } from '@/lib/schedule';
import { format, formatDistanceToNow } from 'date-fns';

interface PlayerWeekStatsProps {
  playerId: string;
  week: number;
  teamId?: string; // Optional team ID to show schedule
}

export default function PlayerWeekStats({ playerId, week, teamId }: PlayerWeekStatsProps) {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getPlayerWeekStats>>>(null);
  const [schedule, setSchedule] = useState<Awaited<ReturnType<typeof fetchNBASchedule>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [playerStats, scheduleData] = await Promise.all([
        getPlayerWeekStats(playerId, week),
        fetchNBASchedule()
      ]);
      setStats(playerStats);
      setSchedule(scheduleData);
      setIsLoading(false);
    };

    fetchData();
  }, [playerId, week]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-gray-500">No stats available for this player</div>;
  }

  const teamSchedule = teamId && schedule ? schedule.teamSchedules[teamId].weekGames[week] : [];
  const now = Date.now();
  const upcomingGames = teamSchedule?.filter(game => game.startTime > now) || [];

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{stats.playerName}</h3>
        <div className="text-sm text-gray-500">
          Week {week} • {stats.gamesPlayed} played • {stats.gamesRemaining} remaining
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-gray-600">Total FP</div>
          <div className="font-bold text-blue-600">{stats.totalFantasyPoints.toFixed(1)}</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-gray-600">Avg FP</div>
          <div className="font-bold text-green-600">{stats.averageFantasyPoints.toFixed(1)}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-sm text-gray-600">Games</div>
          <div className="font-bold text-purple-600">{stats.gamesPlayed}</div>
        </div>
      </div>

      {upcomingGames.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Upcoming Games</div>
          <div className="grid gap-2">
            {upcomingGames.map((game) => (
              <div key={game.gameId} className="bg-orange-50 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {game.homeTeam === teamId ? 
                      `vs ${getTeamName(game.awayTeam)}` : 
                      `@ ${getTeamName(game.homeTeam)}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(game.startTime, { addSuffix: true })}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {format(game.startTime, 'MMM d, h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Game Log</div>
        {stats.games.map((game, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {game.date ? format(new Date(game.date), 'MMM d') : 'Date N/A'}
              </span>
              <span className="font-medium text-blue-600">
                {game.fantasyPoints.toFixed(1)} FP
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div>
                {game.points} PTS
              </div>
              <div>
                {game.rebounds} REB
              </div>
              <div>
                {game.assists} AST
              </div>
              <div>
                {game.steals} STL
              </div>
              <div>
                {game.blocks} BLK
              </div>
              <div>
                {game.turnovers} TO
              </div>
              <div className="col-span-3">
                FG: {game.fieldGoalsMade}/{game.fieldGoalsAttempted} • 
                3PM: {game.threePointersMade} • 
                FT: {game.freeThrowsMade}/{game.freeThrowsAttempted}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
