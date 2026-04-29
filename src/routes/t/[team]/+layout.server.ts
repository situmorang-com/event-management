import { redirect } from '@sveltejs/kit';
import { getTeamBySlug, requireTeamRole, requireUser } from '$lib/server/permissions';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals }) => {
  if (!locals.user) throw redirect(303, '/login');
  const user = await requireUser(locals);
  const team = await getTeamBySlug(params.team);
  const { role } = await requireTeamRole(user.id, team.id, 'staff');
  return {
    team: { id: team.id, slug: team.slug, name: team.name },
    role
  };
};
