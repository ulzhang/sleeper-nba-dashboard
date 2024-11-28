'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMatchups, fetchUsers, fetchRosters } from '@/lib/api'
import { Card } from './ui/Card'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { format, addDays, differenceInDays, startOfWeek } from 'date-fns'

interface WeekSchedule {
  start: Date
  end: Date
  week: number
}

interface Matchup {
  matchup_id: number
  roster_id: number
  points: number
}

interface User {
  user_id: string
  display_name: string
  avatar?: string
}

interface Roster {
  roster_id: number
  owner_id: string
}

// NBA season started on October 24, 2023
const TOTAL_WEEKS = 25

const WEEK_SCHEDULE: WeekSchedule[] = [
  { start: new Date('2023-10-24T00:00:00'), end: new Date('2023-10-27T23:59:59'), week: 1 },
  { start: new Date('2023-10-28T00:00:00'), end: new Date('2023-11-03T23:59:59'), week: 2 },
  { start: new Date('2023-11-04T00:00:00'), end: new Date('2023-11-10T23:59:59'), week: 3 },
  { start: new Date('2023-11-11T00:00:00'), end: new Date('2023-11-17T23:59:59'), week: 4 },
  { start: new Date('2023-11-18T00:00:00'), end: new Date('2023-11-24T23:59:59'), week: 5 },
  { start: new Date('2023-11-25T00:00:00'), end: new Date('2023-12-01T23:59:59'), week: 6 },
  { start: new Date('2023-12-02T00:00:00'), end: new Date('2023-12-08T23:59:59'), week: 7 },
  { start: new Date('2023-12-09T00:00:00'), end: new Date('2023-12-15T23:59:59'), week: 8 },
  // ... rest of the weeks
]

const getCurrentWeek = () => {
  const today = new Date()
  console.log('Today:', today)
  
  const currentWeek = WEEK_SCHEDULE.find(w => today >= w.start && today <= w.end)
  console.log('Found week:', currentWeek?.week)
  
  return currentWeek?.week || 6 // Default to week 6 if not found
}

export default function RecentMatchups() {
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek())

  // Calculate date range for the selected week
  const weekData = WEEK_SCHEDULE.find(w => w.week === selectedWeek)
  const dateRange = weekData 
    ? `${format(weekData.start, 'MMM d')} - ${format(weekData.end, 'MMM d')}`
    : ''

  const { data: matchups, isLoading: matchupsLoading } = useQuery({
    queryKey: ['matchups', selectedWeek],
    queryFn: () => fetchMatchups(selectedWeek)
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  })

  const { data: rosters, isLoading: rostersLoading } = useQuery({
    queryKey: ['rosters'],
    queryFn: fetchRosters
  })

  const handlePreviousWeek = () => {
    if (selectedWeek > 1) {
      setSelectedWeek(prev => prev - 1)
    }
  }

  const handleNextWeek = () => {
    if (selectedWeek < TOTAL_WEEKS) {
      setSelectedWeek(prev => prev + 1)
    }
  }

  const handleJumpToCurrentWeek = () => {
    setSelectedWeek(getCurrentWeek())
  }

  if (matchupsLoading || usersLoading || rostersLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  // Group matchups by matchup_id
  const groupedMatchups = matchups?.reduce((acc: { [key: number]: Matchup[] }, matchup: Matchup) => {
    if (!acc[matchup.matchup_id]) {
      acc[matchup.matchup_id] = []
    }
    acc[matchup.matchup_id].push(matchup)
    return acc
  }, {})

  // Create a mapping of roster_id to user
  const rosterToUser = rosters?.reduce((acc: { [key: number]: User | undefined }, roster: Roster) => {
    const user = users?.find(u => u.user_id === roster.owner_id)
    acc[roster.roster_id] = user
    return acc
  }, {})

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Week {selectedWeek}</h2>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handlePreviousWeek}
            disabled={selectedWeek === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">{dateRange}</span>
          <button 
            onClick={handleNextWeek}
            disabled={selectedWeek === TOTAL_WEEKS}
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
      <div className="space-y-4">
        {groupedMatchups && Object.values(groupedMatchups).map((matchup: Matchup[]) => {
          const team1User = rosterToUser?.[matchup[0]?.roster_id]
          const team2User = rosterToUser?.[matchup[1]?.roster_id]

          return (
            <div key={matchup[0]?.matchup_id} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {team1User?.avatar && (
                    <img 
                      src={`https://sleepercdn.com/avatars/thumbs/${team1User.avatar}`} 
                      alt="" 
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium">{team1User?.display_name || 'TBD'}</span>
                </div>
                <span className="text-sm text-gray-600">vs</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{team2User?.display_name || 'TBD'}</span>
                  {team2User?.avatar && (
                    <img 
                      src={`https://sleepercdn.com/avatars/thumbs/${team2User.avatar}`} 
                      alt="" 
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                <span>{matchup[0]?.points?.toFixed(2) || '0.00'}</span>
                <span>{matchup[1]?.points?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
