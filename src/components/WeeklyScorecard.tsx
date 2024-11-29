'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { format } from 'date-fns'
import { useMatchups, useRosters, useUsers } from '../lib/queries'
import type { Matchup, Roster, User } from '../lib/types'
import { Card } from './ui/Card'
import { WEEK_SCHEDULE, getCurrentWeek } from '../lib/config'

interface TeamScore {
  roster_id: number
  points: number
  user?: User
  isAboveMedian: boolean | null
}

export default function WeeklyScorecard() {
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek())

  const { data: matchups, isLoading: matchupsLoading } = useMatchups(selectedWeek)
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: rosters, isLoading: rostersLoading } = useRosters()

  const handlePreviousWeek = () => {
    if (selectedWeek > 1) {
      setSelectedWeek(prev => prev - 1)
    }
  }

  const handleNextWeek = () => {
    if (selectedWeek < WEEK_SCHEDULE.length) {
      setSelectedWeek(prev => prev + 1)
    }
  }

  const handleJumpToCurrentWeek = () => {
    setSelectedWeek(getCurrentWeek())
  }

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

  // Mark teams above/below/at median
  teamScores.forEach((team, index) => {
    if (index === medianIndex) {
      team.isAboveMedian = null // Explicitly mark as median
    } else {
      team.isAboveMedian = index < medianIndex
    }
  })

  // Color determination function
  const getTeamColor = (team: TeamScore, index: number, medianIndex: number) => {
    // Median team gets yellow
    if (index === medianIndex) {
      return 'bg-yellow-50/50 border-yellow-100'
    }
    
    // Teams above median get green
    if (index < medianIndex) {
      return 'bg-green-100/50 border-green-100'
    }
    
    // Teams below median get red
    return 'bg-red-50/50 border-red-50'
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Median</h2>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handlePreviousWeek}
            disabled={selectedWeek === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">Week {selectedWeek}</span>
          <button 
            onClick={handleNextWeek}
            disabled={selectedWeek === WEEK_SCHEDULE.length}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleJumpToCurrentWeek}
            className="ml-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Today
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {teamScores.map((team, index) => (
          <div
            key={team.roster_id}
            className={`flex items-center justify-between p-2 rounded border ${getTeamColor(team, index, medianIndex)}`}
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
                {!team.user?.avatar && (
                  <img
                    src="/favicon.ico"
                    alt="default avatar"
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span>{team.user?.display_name || `Team ${team.roster_id}`}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono">{team.points.toFixed(2)}</span>
              <span className="text-sm">
                {team.isAboveMedian === null ? (
                  <span className="text-yellow-600">―</span>
                ) : team.isAboveMedian ? (
                  <span className="text-green-600">↑</span>
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
