import { useApiResource } from '../hooks/useApiResource.js';

type Workout = { _id?: string; title: string; focus: string; minutes: number; difficulty: string; reason: string };
type WorkoutResponse = { suggestions: Workout[] };

export default function Workouts() {
  const { data, loading, error } = useApiResource<WorkoutResponse>('/api/workouts/suggestions/mona%40example.com');
  return <section className="card"><div className="card-body">
    <h2 className="h4">Workout suggestions</h2>
    <p>Recommend workouts from activity patterns.</p>
    {loading && <p role="status">Loading workout suggestions...</p>}
    {error && <p role="alert">Unable to load workout suggestions.</p>}
    {data && data.suggestions.length === 0 && <p>No workout suggestions yet.</p>}
    {data && data.suggestions.length > 0 && <ul className="list-group list-group-flush">
      {data.suggestions.map((workout, index) => <li className="list-group-item px-0" key={workout._id ?? `${workout.title}-${index}`}>
        <h3 className="h5 mb-1">{workout.title}</h3>
        <p className="mb-1">{workout.focus} · {workout.minutes} min · {workout.difficulty}</p>
        <p className="text-body-secondary mb-0">{workout.reason}</p>
      </li>)}
    </ul>}
  </div></section>;
}
