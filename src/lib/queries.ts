import { useQuery } from '@tanstack/react-query'
import { fetchLeagueInfo, fetchMatchups, fetchRosters, fetchUsers, fetchResearchData } from './api'
import { getCurrentWeek } from './config'
import { log, logError } from './logger'
import type { Matchup, Roster, User } from './types'

// Cache time: 1 hour
const ONE_HOUR = 1000 * 60 * 60

// Stale time: 5 minutes
const FIVE_MINUTES = 1000 * 60 * 5

export function useLeagueInfo() {
  return useQuery<unknown, unknown, unknown>({
    queryKey: ['leagueInfo'],
    queryFn: fetchLeagueInfo,
    gcTime: ONE_HOUR,
    staleTime: FIVE_MINUTES,
  })
}

export function useRosters() {
  return useQuery<Roster[], unknown, Roster[]>({
    queryKey: ['rosters'],
    queryFn: fetchRosters,
    gcTime: ONE_HOUR,
    staleTime: FIVE_MINUTES,
  })
}

export function useUsers() {
  return useQuery<User[], unknown, User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    gcTime: ONE_HOUR,
    staleTime: FIVE_MINUTES,
  })
}

export function useMatchups(week: number) {
  return useQuery<Matchup[], unknown, Matchup[]>({
    queryKey: ['matchups', week],
    queryFn: () => fetchMatchups(week),
    gcTime: ONE_HOUR,
    staleTime: FIVE_MINUTES,
  })
}

export function useResearchData() {
  const currentWeek = getCurrentWeek();
  
  return useQuery({
    queryKey: ['researchData', currentWeek],
    queryFn: () => {
      log('data', `Initiating research data query for week ${currentWeek}`);
      return fetchResearchData(currentWeek);
    },
  })
}
