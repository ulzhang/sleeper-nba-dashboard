import axios from 'axios'

const SLEEPER_API_BASE = 'https://api.sleeper.app/v1'

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
