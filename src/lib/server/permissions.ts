import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { teams, teamMembers } from './db/schema';
import type { Role } from './db/schema';

const ROLE_RANK: Record<Role, number> = { staff: 1, admin: 2, owner: 3 };

export async function requireUser(locals: App.Locals) {
  if (!locals.user) throw error(401, 'Sign in required');
  return locals.user;
}

export async function getTeamBySlug(slug: string) {
  const team = await db.query.teams.findFirst({ where: eq(teams.slug, slug) });
  if (!team) throw error(404, 'Team not found');
  return team;
}

export async function requireTeamRole(
  userId: string,
  teamId: string,
  minRole: Role
): Promise<{ role: Role }> {
  const member = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
  });
  if (!member) throw error(403, 'Not a member of this team');
  const role = member.role as Role;
  if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
    throw error(403, `Requires ${minRole} role or higher`);
  }
  return { role };
}

export const canSeeSensitiveSponsorFields = (role: Role) => role === 'owner' || role === 'admin';
