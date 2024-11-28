import LeagueOverview from '@/components/LeagueOverview'
import TeamStandings from '@/components/TeamStandings'
import RecentMatchups from '@/components/RecentMatchups'

export default function Home() {
  return (
    <div className="container max-w-[1600px] mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-primary mb-8">
        NBA Fantasy Dashboard
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <LeagueOverview />
        <TeamStandings />
        <RecentMatchups />
      </div>
    </div>
  )
}
