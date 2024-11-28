'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchRosters, fetchUsers } from '@/lib/api'
import { Card } from './ui/Card'

export default function TeamStandings() {
  const { data: rosters, isLoading: rostersLoading } = useQuery({
    queryKey: ['rosters'],
    queryFn: fetchRosters
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  })

  if (rostersLoading || usersLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  // Combine roster data with user data
  const standings = rosters?.map(roster => {
    const user = users?.find(u => u.user_id === roster.owner_id)
    return {
      ...roster,
      username: user?.display_name || 'Unknown',
      avatar: user?.avatar
    }
  }).sort((a, b) => (b.settings?.wins || 0) - (a.settings?.wins || 0))

  return (
    <Card>
      <h2 className="text-2xl font-semibold mb-4">Team Standings</h2>
      <div className="space-y-4">
        {standings?.map((team, index) => (
          <div key={team.roster_id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">{index + 1}.</span>
              <span className="font-medium">{team.username}</span>
            </div>
            <div className="text-sm text-gray-600">
              {team.settings?.wins || 0}-{team.settings?.losses || 0}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
