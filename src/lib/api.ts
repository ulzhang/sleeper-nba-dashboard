import axios from 'axios'
import { log, logError } from './logger'

const SLEEPER_API_BASE = 'https://api.sleeper.app/v1'
const SLEEPER_PLAYERS_BASE = 'https://api.sleeper.com/players/nba'

// You'll need to replace this with your league ID
const LEAGUE_ID = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID

export async function fetchLeagueInfo() {
  const response = await axios.get(`${SLEEPER_API_BASE}/league/${LEAGUE_ID}`)
  return response.data
}

export async function fetchRosters() {
  const response = await axios.get(`${SLEEPER_API_BASE}/league/${LEAGUE_ID}/rosters`)
  return response.data
}

export async function fetchUsers() {
  const response = await axios.get(`${SLEEPER_API_BASE}/league/${LEAGUE_ID}/users`)
  return response.data
}

export async function fetchMatchups(week: number) {
  const response = await axios.get(`${SLEEPER_API_BASE}/league/${LEAGUE_ID}/matchups/${week}`)
  
  return response.data
}

export async function fetchResearchData(week: number) {
  try {
    const currentYear = new Date().getFullYear();
    
    // Construct the full endpoint URL
    const endpoint = `${SLEEPER_PLAYERS_BASE}/research/nba/${currentYear}/${week}`;
    
    log('api', `Fetching research data from full endpoint`, { 
      endpoint, 
      week, 
      year: currentYear 
    });
    
    const response = await axios.get(endpoint);
    
    log('api', `Research data fetch response`, { 
      playerCount: Object.keys(response.data).length,
      firstFewPlayers: Object.keys(response.data).slice(0, 5),
      samplePlayerData: Object.entries(response.data).slice(0, 2)
    });
    
    return response.data;
  } catch (error) {
    logError('Failed to fetch research data', {
      error: error instanceof Error ? error.message : error,
      endpoint: `${SLEEPER_PLAYERS_BASE}/research/nba/${new Date().getFullYear()}/${week}`
    });
    throw error;
  }
}
