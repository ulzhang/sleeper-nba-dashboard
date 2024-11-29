import RecentMatchups from '@/components/RecentMatchups'
import WeeklyScorecard from '@/components/WeeklyScorecard'
import LeagueStandings from '@/components/LeagueStandings'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-[1600px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LeagueStandings />
        </div>
        <div className="lg:col-span-1">
          <RecentMatchups />
        </div>
        <div className="lg:col-span-1">
          <WeeklyScorecard />
        </div>
      </div>
    </main>
  )
}
