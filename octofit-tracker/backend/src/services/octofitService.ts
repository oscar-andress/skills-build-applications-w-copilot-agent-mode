import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw httpError('Activity details are required', 400);
  const { userId, teamId, type, minutes } = input;
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw httpError('Valid userId and teamId are required', 400);
  }
  if (typeof type !== 'string' || !type.trim() || typeof minutes !== 'number' || !Number.isInteger(minutes) || minutes < 1) {
    throw httpError('A type and positive whole-number minutes are required', 400);
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw httpError('The requested user or team does not exist', 404);

  return Activity.create({ user: user._id, team: team._id, type: type.trim(), minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw httpError('Team details are required', 400);
  const { name, mascot } = input;
  const members = input.members ?? [];
  if (typeof name !== 'string' || !name.trim() || typeof mascot !== 'string' || !mascot.trim()) {
    throw httpError('A team name and mascot are required', 400);
  }
  if (!Array.isArray(members) || members.some((member) => !mongoose.isValidObjectId(member))) {
    throw httpError('Members must be valid user IDs', 400);
  }

  const uniqueMembers = [...new Set(members.map(String))];
  const existingMembers = await User.find({ _id: { $in: uniqueMembers } }).select('_id').lean();
  if (existingMembers.length !== uniqueMembers.length) throw httpError('One or more members do not exist', 404);

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: existingMembers.map((member) => member._id) });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw httpError('User not found', 404);

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus = recentActivity
    ? ({ run: 'endurance', cycle: 'endurance', swim: 'endurance', walk: 'mobility', strength: 'strength' }[recentActivity.type.toLowerCase()] ?? recentActivity.type.toLowerCase())
    : undefined;
  const preferredFocuses = [...new Set([user.fitnessGoal.toLowerCase(), activityFocus].filter((focus): focus is string => Boolean(focus)))];
  const workouts = await Workout.find().lean();

  return workouts
    .sort((left, right) => {
      const leftRank = preferredFocuses.indexOf(left.focus.toLowerCase());
      const rightRank = preferredFocuses.indexOf(right.focus.toLowerCase());
      return (leftRank < 0 ? Number.MAX_SAFE_INTEGER : leftRank) - (rightRank < 0 ? Number.MAX_SAFE_INTEGER : rightRank)
        || left.title.localeCompare(right.title);
    })
    .map((workout) => {
      const focus = workout.focus.toLowerCase();
      const reason = focus === user.fitnessGoal.toLowerCase()
        ? `Matches ${user.name}'s ${user.fitnessGoal} goal.`
        : focus === activityFocus
          ? `Builds on recent ${recentActivity?.type} activity.`
          : `Supports ${workout.focus} training.`;
      return { ...workout, reason };
    });
}

export { User };
