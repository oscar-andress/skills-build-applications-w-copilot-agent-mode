import { useApiResource } from '../hooks/useApiResource.js';

type Team = { _id?: string; name: string; mascot?: string; members: string[] };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  const { data, loading, error } = useApiResource<TeamResponse>('/api/teams');
  return <section className="card"><div className="card-body">
    <h2 className="h4">Teams</h2>
    <p>Manage teams and members.</p>
    {loading && <p role="status">Loading teams...</p>}
    {error && <p role="alert">Unable to load teams.</p>}
    {data && data.teams.length === 0 && <p>No teams yet.</p>}
    {data && data.teams.length > 0 && <ul className="list-group list-group-flush">
      {data.teams.map((team, index) => <li className="list-group-item px-0" key={team._id ?? `${team.name}-${index}`}>
        <strong>{team.name}</strong>{team.mascot && <span> · {team.mascot}</span>}
        <div className="text-body-secondary">{team.members.length} {team.members.length === 1 ? 'member' : 'members'}</div>
      </li>)}
    </ul>}
  </div></section>;
}
