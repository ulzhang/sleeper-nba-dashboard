'use client';

import { useState } from 'react';
import { ArrowDownIcon } from '@heroicons/react/24/solid';
import { getPlayer } from '@/lib/players';

interface PlayerData {
  owned: number;
  started: number;
  teamOwned: boolean;
}

interface ResearchTableProps {
  data: Record<string, PlayerData>;
}

type SortKey = 'name' | 'owned' | 'started' | 'ratio' | 'teamOwned';

export default function ResearchTable({ data }: ResearchTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('owned');

  const handleSort = (key: SortKey) => {
    setSortKey(key);
  };

  const sortedData = Object.entries(data)
    .map(([playerId, stats]) => {
      const player = getPlayer(playerId);
      return {
        id: playerId,
        name: player ? `${player.first_name} ${player.last_name}` : playerId,
        team: player?.team || '',
        owned: stats.owned,
        started: stats.started,
        teamOwned: stats.teamOwned,
        ratio: stats.started / stats.owned || 0
      };
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return b.name.localeCompare(a.name);
        case 'owned':
          return b.owned - a.owned;
        case 'started':
          return b.started - a.started;
        case 'ratio':
          return b.ratio - a.ratio;
        case 'teamOwned':
          return (b.teamOwned ? 1 : 0) - (a.teamOwned ? 1 : 0);
        default:
          return 0;
      }
    });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100 uppercase">
          <tr>
            {[
              { key: 'name', label: 'Player' },
              { key: 'owned', label: 'Owned %' },
              { key: 'started', label: 'Started %' },
              { key: 'ratio', label: 'Started/Owned' },
              { key: 'teamOwned', label: 'Team Owned' },
            ].map(({ key, label }) => (
              <th
                key={key}
                className="px-4 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort(key as SortKey)}
              >
                <div className="flex items-center space-x-1">
                  <span>{label}</span>
                  {sortKey === key && (
                    <ArrowDownIcon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((player) => (
            <tr key={player.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex flex-col">
                  <span className="font-medium">{player.name}</span>
                  {player.team && (
                    <span className="text-xs text-gray-500">{player.team}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {player.owned.toFixed(1)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {player.started.toFixed(1)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {player.ratio.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${player.teamOwned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                `}>
                  {player.teamOwned ? 'Owned' : 'Free Agent'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
