'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchRosters, fetchUsers } from '@/lib/api'
import { Card } from './ui/Card'

interface User {
  user_id: string
  display_name: string
  avatar?: string
}

interface Roster {
  roster_id: number
  owner_id: string
  settings: {
    wins: number
    losses: number
    ties: number
  }
}

interface Standing extends Roster {
  user?: User
}

export default function TeamStandings() {
  const { data: rosters, isLoading: rostersLoading } = useQuery<Roster[]>({
    queryKey: ['rosters'],
    queryFn: fetchRosters,
  })

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  // Combine roster data with user data
  const standings = rosters?.map((roster: Roster) => {
    const user = users?.find((u: User) => u.user_id === roster.owner_id)
    return {
      ...roster,
      user,
    }
  })?.sort((a, b) => {
    // Sort by wins first, then by points if wins are equal
    if (a.settings.wins !== b.settings.wins) {
      return b.settings.wins - a.settings.wins
    }
    return 0
  })

  if (rostersLoading || usersLoading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Standings</h2>
      <div className="space-y-4">
        {standings?.map((team: Standing) => (
          <div key={team.roster_id} className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {team.user?.avatar && (
                <img
                  src={`https://sleepercdn.com/avatars/thumbs/${team.user.avatar}`}
                  alt="avatar"
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span>{team.user?.display_name || `Team ${team.roster_id}`}</span>
            </div>
            <div className="text-sm text-gray-600">
              {team.settings.wins}W - {team.settings.losses}L
              {team.settings.ties > 0 && ` - ${team.settings.ties}T`}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
