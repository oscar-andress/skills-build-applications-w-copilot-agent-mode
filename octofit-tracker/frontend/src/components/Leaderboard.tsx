import { useApiResource } from '../hooks/useApiResource.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const { data, loading, error } = useApiResource<LeaderboardResponse>('/api/leaderboard');
  return <section className="card"><div className="card-body">
    <h2 className="h4">Leaderboard</h2>
    <p>Compare team point totals.</p>
    {loading && <p role="status">Loading leaderboard...</p>}
    {error && <p role="alert">Unable to load leaderboard.</p>}
    {data && data.leaderboard.length === 0 && <p>No rankings yet.</p>}
    {data && data.leaderboard.length > 0 && <div className="table-responsive"><table className="table align-middle mb-0">
      <thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Points</th></tr></thead>
      <tbody>{data.leaderboard.map((entry) => <tr key={entry.teamName}>
        <th scope="row">{entry.rank}</th><td>{entry.teamName}</td><td>{entry.totalPoints}</td>
      </tr>)}</tbody>
    </table></div>}
  </div></section>;
}
