'use client'

import { useState, useEffect } from 'react'
import { useMatchups, useRosters, useUsers } from '../lib/queries'
import type { Matchup, Roster, User } from '../lib/types'
import { Card } from './ui/Card'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { format } from 'date-fns'
import { WEEK_SCHEDULE, getCurrentWeek } from '../lib/config'
import Image from 'next/image'

interface WeekSchedule {
  week: number
  start: Date
  end: Date
}

interface TeamScore {
  roster_id: number
  points: number
  user: User | undefined
  isAboveMedian: boolean
}

export default function RecentMatchups() {
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek())
  const [isMobile, setIsMobile] = useState(false)

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

  // Helper function to get valid avatar URL
  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return '/favicon.ico'
    
    // Check if it's already a full URL
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar
    }
    
    // Construct Sleeper avatar URL
    return `https://sleepercdn.com/avatars/thumbs/${avatar}`
  }

  // Helper function to validate avatar URL
  const validateAvatarUrl = (avatarUrl: string) => {
    try {
      new URL(avatarUrl)
      return true
    } catch {
      return false
    }
  }

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobile(window.innerWidth <= 1400)
    }
    
    // Check initial size
    checkMobileView()
    
    // Add resize listener
    window.addEventListener('resize', checkMobileView)
    
    // Cleanup listener
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

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
  const groupedMatchups = (matchups || []).reduce((acc: { [key: number]: Matchup[] }, matchup: Matchup) => {
    if (!acc[matchup.matchup_id]) {
      acc[matchup.matchup_id] = []
    }
    acc[matchup.matchup_id].push(matchup)
    return acc
  }, {})

  // Process the scores and calculate median
  const teamScores: TeamScore[] = Object.values(groupedMatchups).flatMap((matchupPair: Matchup[]) => 
    matchupPair.map((matchup) => {
      const roster = rosters?.find((r) => r.roster_id === matchup.roster_id)
      const user = users?.find((u) => u.user_id === roster?.owner_id)
      return {
        roster_id: matchup.roster_id,
        points: matchup.points || 0,
        user,
        isAboveMedian: false, // Will be set after sorting
      }
    })
  ).sort((a, b) => b.points - a.points)

  // Calculate median index
  const medianIndex = Math.floor(teamScores.length / 2)

  // Mark teams above/below median
  teamScores.forEach((team, index) => {
    team.isAboveMedian = index < medianIndex
  })

  // Create a mapping of roster_id to user
  const rosterToUser = (rosters || []).reduce((acc: { [key: number]: User | undefined }, roster: Roster) => {
    const user = users?.find(u => u.user_id === roster.owner_id)
    acc[roster.roster_id] = user
    return acc
  }, {})

  // Color determination function
  const getMatchupColor = (firstPoints: number, secondPoints: number) => {
    const pointDiff = Math.abs(firstPoints - secondPoints)
    
    // Neck and neck (within 15 points)
    if (pointDiff <= 15) {
      if (firstPoints > secondPoints) {
        return {
          firstHalf: 'bg-yellow-100/50',
          secondHalf: 'bg-yellow-50/60',
          borderColor: 'border-gray-200'
        }
      } else {
        return {
          firstHalf: 'bg-yellow-50/60',
          secondHalf: 'bg-yellow-100/50',
          borderColor: 'border-gray-200'
        }
      }
    }
    
    // Large point differential (more than 60 points)
    if (pointDiff > 60) {
      if (firstPoints > secondPoints) {
        return {
          firstHalf: 'bg-green-200/50',
          secondHalf: 'bg-red-100/50',
          borderColor: 'border-gray-200'
        }
      } else {
        return {
          firstHalf: 'bg-red-100/50',
          secondHalf: 'bg-green-200/50',
          borderColor: 'border-gray-200'
        }
      }
    }
    
    // Standard point difference
    if (firstPoints > secondPoints) {
      return {
        firstHalf: 'bg-green-100/50',
        secondHalf: 'bg-red-50/50',
        borderColor: 'border-gray-200'
      }
    } else {
      return {
        firstHalf: 'bg-red-50/50',
        secondHalf: 'bg-green-100/50',
        borderColor: 'border-gray-200'
      }
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Head 2 Head</h2>
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
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Today
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {groupedMatchups && Object.values(groupedMatchups).map((matchup: unknown) => {
          const typedMatchup = matchup as Matchup[]
          const firstMatchup = typedMatchup[0]
          const secondMatchup = typedMatchup[1]
          const firstTeamUser = rosterToUser?.[firstMatchup.roster_id]
          const secondTeamUser = rosterToUser?.[secondMatchup.roster_id]

          const matchupColors = getMatchupColor(firstMatchup.points, secondMatchup.points)

          return (
            <div 
              key={firstMatchup.matchup_id} 
              className={`border-b pb-2 ${matchupColors.borderColor}`}
            >
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} w-full`}>
                <div className={`flex-1 flex ${matchupColors.firstHalf} ${matchupColors.borderColor} ${isMobile ? 'border-b-2' : 'border-r-2'} p-2`}>
                  <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center w-full`}>
                    <div className="flex items-center space-x-2 w-full">
                      <Image 
                        src={validateAvatarUrl(getAvatarUrl(firstTeamUser?.avatar)) ? getAvatarUrl(firstTeamUser?.avatar) : '/favicon.ico'} 
                        alt={`${firstTeamUser?.display_name || 'Unknown'} avatar`}
                        width={32} 
                        height={32} 
                        className="rounded-full"
                      />
                      <span className="text-sm font-medium truncate flex-grow">{firstTeamUser?.display_name || 'Unknown'}</span>
                      <div className="font-bold text-lg">{firstMatchup.points.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                <div className={`flex-1 flex ${matchupColors.secondHalf} ${matchupColors.borderColor} ${isMobile ? 'border-t-2' : 'border-l-2'} p-2`}>
                  <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center w-full`}>
                    {isMobile ? (
                      <div className="flex items-center space-x-2 w-full">
                        <Image 
                          src={validateAvatarUrl(getAvatarUrl(secondTeamUser?.avatar)) ? getAvatarUrl(secondTeamUser?.avatar) : '/favicon.ico'} 
                          alt={`${secondTeamUser?.display_name || 'Unknown'} avatar`}
                          width={32} 
                          height={32} 
                          className="rounded-full"
                        />
                        <span className="text-sm font-medium truncate flex-grow">{secondTeamUser?.display_name || 'Unknown'}</span>
                        <div className="font-bold text-lg">{secondMatchup.points.toFixed(2)}</div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 w-full justify-end">
                        <div className="font-bold text-lg">{secondMatchup.points.toFixed(2)}</div>
                        <span className="text-sm font-medium truncate flex-grow text-right">{secondTeamUser?.display_name || 'Unknown'}</span>
                        <Image 
                          src={validateAvatarUrl(getAvatarUrl(secondTeamUser?.avatar)) ? getAvatarUrl(secondTeamUser?.avatar) : '/favicon.ico'} 
                          alt={`${secondTeamUser?.display_name || 'Unknown'} avatar`}
                          width={32} 
                          height={32} 
                          className="rounded-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
