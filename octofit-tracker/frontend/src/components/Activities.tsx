import { useApiResource } from '../hooks/useApiResource.js';

type Activity = { _id?: string; type: string; minutes: number; points: number; occurredAt?: string };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const { data, loading, error } = useApiResource<ActivityResponse>('/api/activities');
  return <section className="card"><div className="card-body">
    <h2 className="h4">Activities</h2>
    <p>Track student activity minutes and points.</p>
    {loading && <p role="status">Loading activities...</p>}
    {error && <p role="alert">Unable to load activities.</p>}
    {data && data.activities.length === 0 && <p>No activities yet.</p>}
    {data && data.activities.length > 0 && <ul className="list-group list-group-flush">
      {data.activities.map((activity, index) => <li className="list-group-item px-0" key={activity._id ?? `${activity.type}-${activity.occurredAt ?? index}`}>
        <strong>{activity.type}</strong><span> · {activity.minutes} min · {activity.points} points</span>
      </li>)}
    </ul>}
  </div></section>;
}
