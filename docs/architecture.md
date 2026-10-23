# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep each route in its existing React component, use the shared API client, and share only the common loading/error/success lifecycle.
- Logic tier decision: Keep routes thin; validate request input and implement capability behavior in explicit service functions with deliberate 4xx errors.
- Data tier decision: Put required fields and safe defaults in Mongoose schemas; preserve the existing idempotent, non-destructive seed.
- Activity tracking approach: Validate positive minutes and existing user/team IDs, then store the submitted activity with points derived from minutes and a server timestamp.
- Team management approach: Require a name and mascot, accept only existing member IDs, and expose members in list/create responses.
- Leaderboard approach: Sum activity points by team, include teams with no points at zero, order highest first, and assign 1-based ranks.
- Workout suggestions approach: Find the user by email, prioritize their goal then recent activity, return matching workouts with a reason, and return 404 for unknown users.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — PASS (5 tests); failures indicate schema or seed contract regressions.
- API command: `npm run test:api --prefix octofit-tracker/backend` — PASS (4 tests); failures indicate endpoint validation or capability behavior regressions.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — PASS (15 tests); failures indicate rendering, loading, empty, error, or request regressions.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — PASS; failures indicate TypeScript errors in the logic/data tiers.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — PASS; failures indicate type or production-bundle errors.
