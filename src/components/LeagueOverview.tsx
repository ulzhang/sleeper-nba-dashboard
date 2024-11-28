'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchLeagueInfo } from '@/lib/api'
import { Card } from './ui/Card'

export default function LeagueOverview() {
  const { data: leagueInfo, isLoading } = useQuery({
    queryKey: ['leagueInfo'],
    queryFn: fetchLeagueInfo
  })

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-2xl font-semibold mb-4">League Overview</h2>
      <div className="space-y-4">
        <div>
          <p className="text-gray-600">League Name</p>
          <p className="font-medium">{leagueInfo?.name}</p>
        </div>
        <div>
          <p className="text-gray-600">Season</p>
          <p className="font-medium">{leagueInfo?.season}</p>
        </div>
        <div>
          <p className="text-gray-600">Total Teams</p>
          <p className="font-medium">{leagueInfo?.total_teams}</p>
        </div>
      </div>
    </Card>
  )
}
