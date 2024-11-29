import LeagueOverview from '@/components/LeagueOverview'
import TeamStandings from '@/components/TeamStandings'
import RecentMatchups from '@/components/RecentMatchups'
import WeeklyScorecard from '@/components/WeeklyScorecard'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-[1600px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LeagueOverview />
        </div>
        <div>
          <TeamStandings />
        </div>
        <div className="lg:col-span-2">
          <RecentMatchups />
        </div>
        <div>
          <WeeklyScorecard />
        </div>
      </div>
    </main>
  )
}
