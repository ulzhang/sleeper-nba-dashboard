interface NBAGame {
  gameId: string;
  startTime: number;
  homeTeam: string;
  awayTeam: string;
  week: number;
  gameStatus: 'upcoming' | 'in_progress' | 'complete';
  homeScore?: number;
  awayScore?: number;
}

interface TeamSchedule {
  teamId: string;
  weekGames: {
    [week: number]: NBAGame[];
  };
  totalGames: number;
}

export interface WeekSchedule {
  week: number;
  games: NBAGame[];
  startDate: Date;
  endDate: Date;
}

const NBA_TEAM_MAP: { [key: string]: string } = {
  'ATL': 'Atlanta Hawks',
  'BOS': 'Boston Celtics',
  'BKN': 'Brooklyn Nets',
  'CHA': 'Charlotte Hornets',
  'CHI': 'Chicago Bulls',
  'CLE': 'Cleveland Cavaliers',
  'DAL': 'Dallas Mavericks',
  'DEN': 'Denver Nuggets',
  'DET': 'Detroit Pistons',
  'GSW': 'Golden State Warriors',
  'HOU': 'Houston Rockets',
  'IND': 'Indiana Pacers',
  'LAC': 'Los Angeles Clippers',
  'LAL': 'Los Angeles Lakers',
  'MEM': 'Memphis Grizzlies',
  'MIA': 'Miami Heat',
  'MIL': 'Milwaukee Bucks',
  'MIN': 'Minnesota Timberwolves',
  'NOP': 'New Orleans Pelicans',
  'NYK': 'New York Knicks',
  'OKC': 'Oklahoma City Thunder',
  'ORL': 'Orlando Magic',
  'PHI': 'Philadelphia 76ers',
  'PHX': 'Phoenix Suns',
  'POR': 'Portland Trail Blazers',
  'SAC': 'Sacramento Kings',
  'SAS': 'San Antonio Spurs',
  'TOR': 'Toronto Raptors',
  'UTA': 'Utah Jazz',
  'WAS': 'Washington Wizards'
};

export async function fetchNBASchedule(year: number = 2024): Promise<{
  teamSchedules: { [teamId: string]: TeamSchedule };
  weekSchedules: WeekSchedule[];
}> {
  try {
    const response = await fetch(`https://api.sleeper.com/schedule/nba/regular/${year}`);
    const scheduleData = await response.json();

    const teamSchedules: { [teamId: string]: TeamSchedule } = {};
    const weekGames: { [week: number]: NBAGame[] } = {};

    // Initialize team schedules
    Object.keys(NBA_TEAM_MAP).forEach(teamId => {
      teamSchedules[teamId] = {
        teamId,
        weekGames: {},
        totalGames: 0
      };
    });

    // Process each game in the schedule
    Object.entries(scheduleData).forEach(([gameId, gameData]: [string, any]) => {
      const game: NBAGame = {
        gameId,
        startTime: gameData.start_time,
        homeTeam: gameData.home_team,
        awayTeam: gameData.away_team,
        week: gameData.week,
        gameStatus: gameData.status || 'upcoming',
        homeScore: gameData.home_score,
        awayScore: gameData.away_score
      };

      // Add to week games
      if (!weekGames[game.week]) {
        weekGames[game.week] = [];
      }
      weekGames[game.week].push(game);

      // Add to team schedules
      const homeTeam = game.homeTeam;
      const awayTeam = game.awayTeam;

      if (!teamSchedules[homeTeam].weekGames[game.week]) {
        teamSchedules[homeTeam].weekGames[game.week] = [];
      }
      if (!teamSchedules[awayTeam].weekGames[game.week]) {
        teamSchedules[awayTeam].weekGames[game.week] = [];
      }

      teamSchedules[homeTeam].weekGames[game.week].push(game);
      teamSchedules[awayTeam].weekGames[game.week].push(game);
      
      teamSchedules[homeTeam].totalGames++;
      teamSchedules[awayTeam].totalGames++;
    });

    // Create week schedules array
    const weekSchedules: WeekSchedule[] = Object.entries(weekGames).map(([week, games]) => {
      const weekNum = parseInt(week);
      const weekGames = games.sort((a, b) => a.startTime - b.startTime);
      return {
        week: weekNum,
        games: weekGames,
        startDate: new Date(weekGames[0].startTime),
        endDate: new Date(weekGames[weekGames.length - 1].startTime)
      };
    }).sort((a, b) => a.week - b.week);

    return {
      teamSchedules,
      weekSchedules
    };
  } catch (error) {
    console.error('Error fetching NBA schedule:', error);
    throw error;
  }
}

export function getTeamName(teamId: string): string {
  return NBA_TEAM_MAP[teamId] || teamId;
}

export function getTeamGamesInWeek(teamId: string, week: number, teamSchedules: { [teamId: string]: TeamSchedule }): NBAGame[] {
  return teamSchedules[teamId]?.weekGames[week] || [];
}

export function getRemainingGamesInWeek(teamId: string, week: number, teamSchedules: { [teamId: string]: TeamSchedule }): NBAGame[] {
  const weekGames = getTeamGamesInWeek(teamId, week, teamSchedules);
  const now = Date.now();
  return weekGames.filter(game => game.startTime > now);
}

export function getCompletedGamesInWeek(teamId: string, week: number, teamSchedules: { [teamId: string]: TeamSchedule }): NBAGame[] {
  const weekGames = getTeamGamesInWeek(teamId, week, teamSchedules);
  return weekGames.filter(game => game.gameStatus === 'complete');
}
