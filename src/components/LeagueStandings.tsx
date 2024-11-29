'use client'

import { useQuery } from '@tanstack/react-query'
import { useRosters, useUsers } from '../lib/queries'
import { fetchLeagueInfo } from '@/lib/api'
import type { Roster, User } from '../lib/types'
import { Card } from './ui/Card'
import { TrophyIcon } from '@heroicons/react/24/solid'

interface Standing extends Roster {
  user?: User
}

export default function LeagueStandings() {
  const { data: leagueInfo, isLoading: leagueLoading } = useQuery({
    queryKey: ['leagueInfo'],
    queryFn: fetchLeagueInfo
  })
  const { data: rosters, isLoading: rostersLoading } = useRosters()
  const { data: users, isLoading: usersLoading } = useUsers()

  // Combine roster data with user data
  const standings = rosters?.map((roster: Roster) => ({
    ...roster,
    user: users?.find(u => u.user_id === roster.owner_id)
  }))?.sort((a, b) => {
    // Sort by wins first, then by points if wins are equal
    const aWins = a.settings?.wins ?? 0
    const bWins = b.settings?.wins ?? 0
    
    if (aWins !== bWins) {
      return bWins - aWins
    }
    return 0
  }) || []

  if (leagueLoading || rostersLoading || usersLoading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold flex items-center">
          <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
          League Overview & Standings
        </h2>
      </div>
      
      {/* League Info Section */}
      <div className="grid grid-cols-2 gap-4 mb-6 border-b pb-4">
        <div>
          <p className="text-gray-600 text-sm">League Name</p>
          <p className="font-medium">{leagueInfo?.name}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Season</p>
          <p className="font-medium">{leagueInfo?.season}</p>
        </div>
      </div>
      
      {/* Standings Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Rankings</h3>
        <div className="space-y-3">
          {standings?.map((team: Standing, index: number) => (
            <div 
              key={team.roster_id} 
              className={`flex justify-between items-center p-2 rounded-lg ${
                index === 0 ? 'bg-yellow-50 border-yellow-200 border' : 
                index === 1 ? 'bg-gray-50 border-gray-200 border' : 
                index === 2 ? 'bg-orange-50 border-orange-200 border' : 
                'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="font-bold text-gray-500 w-6 text-right">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">
                    {team.user?.display_name || 'Unknown Team'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Wins: {team.settings?.wins ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
