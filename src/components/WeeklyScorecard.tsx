'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchMatchups, fetchUsers, fetchRosters } from '@/lib/api'
import { Card } from './ui/Card'
import { getCurrentWeek } from '@/lib/config'

interface User {
  user_id: string
  display_name: string
  avatar?: string
}

interface Roster {
  roster_id: number
  owner_id: string
}

interface Matchup {
  matchup_id: number
  roster_id: number
  points: number
}

interface TeamScore {
  roster_id: number
  points: number
  user?: User
  isAboveMedian: boolean
}

export default function WeeklyScorecard() {
  const { data: matchups, isLoading: matchupsLoading } = useQuery<Matchup[]>({
    queryKey: ['matchups', getCurrentWeek()],
    queryFn: () => fetchMatchups(getCurrentWeek()),
  })

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const { data: rosters, isLoading: rostersLoading } = useQuery<Roster[]>({
    queryKey: ['rosters'],
    queryFn: fetchRosters,
  })

  if (matchupsLoading || usersLoading || rostersLoading) {
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

  // Process the scores and calculate median
  const teamScores: TeamScore[] = matchups?.map((matchup) => {
    const roster = rosters?.find((r) => r.roster_id === matchup.roster_id)
    const user = users?.find((u) => u.user_id === roster?.owner_id)
    return {
      roster_id: matchup.roster_id,
      points: matchup.points || 0,
      user,
      isAboveMedian: false, // Will be set after sorting
    }
  }).sort((a, b) => b.points - a.points) || []

  // Calculate median index
  const medianIndex = Math.floor(teamScores.length / 2)

  // Mark teams above/below median
  teamScores.forEach((team, index) => {
    team.isAboveMedian = index < medianIndex
  })

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Weekly Scorecard</h2>
      <div className="space-y-3">
        {teamScores.map((team, index) => (
          <div
            key={team.roster_id}
            className={`flex items-center justify-between p-2 rounded ${
              team.isAboveMedian
                ? 'bg-green-50 border border-green-100'
                : index === medianIndex
                ? 'bg-yellow-50 border border-yellow-100'
                : 'bg-red-50 border border-red-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-gray-500 w-6">{index + 1}.</span>
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
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono">{team.points.toFixed(2)}</span>
              <span className="text-sm">
                {team.isAboveMedian ? (
                  <span className="text-green-600">↑</span>
                ) : index === medianIndex ? (
                  <span className="text-yellow-600">―</span>
                ) : (
                  <span className="text-red-600">↓</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
