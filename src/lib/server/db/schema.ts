import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// ───────────────────────────── Users & sessions ─────────────────────────────

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), // session token hash (sha-256 hex)
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const authTokens = sqliteTable(
  'auth_tokens',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    email: text('email').notNull(), // present even before user exists
    tokenHash: text('token_hash').notNull(),
    purpose: text('purpose').notNull(), // 'magic_link'
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    usedAt: integer('used_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
  },
  (t) => ({
    tokenHashIdx: uniqueIndex('auth_tokens_hash_idx').on(t.tokenHash),
    emailIdx: index('auth_tokens_email_idx').on(t.email)
  })
);

// ───────────────────────────── Teams ─────────────────────────────

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

export const teamMembers = sqliteTable(
  'team_members',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'owner' | 'admin' | 'staff'
    invitedBy: text('invited_by').references(() => users.id),
    joinedAt: integer('joined_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
  },
  (t) => ({
    teamUserUniq: uniqueIndex('team_members_team_user_idx').on(t.teamId, t.userId)
  })
);

export const teamInvitations = sqliteTable(
  'team_invitations',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role').notNull(),
    tokenHash: text('token_hash').notNull(),
    invitedBy: text('invited_by').references(() => users.id),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
  },
  (t) => ({
    tokenIdx: uniqueIndex('team_invitations_token_idx').on(t.tokenHash),
    teamEmailIdx: index('team_invitations_team_email_idx').on(t.teamId, t.email)
  })
);

// ───────────────────────────── Conferences ─────────────────────────────

export const conferences = sqliteTable(
  'conferences',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    venue: text('venue'),
    timezone: text('timezone').notNull().default('UTC'),
    startsAt: integer('starts_at', { mode: 'timestamp' }).notNull(),
    endsAt: integer('ends_at', { mode: 'timestamp' }).notNull(),
    capacity: integer('capacity'),
    registrationCloseAt: integer('registration_close_at', { mode: 'timestamp' }),
    status: text('status').notNull().default('draft'), // draft | published | closed | archived
    bannerUrl: text('banner_url'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
  },
  (t) => ({
    teamIdx: index('conferences_team_idx').on(t.teamId)
  })
);

// ───────────────────────────── Attendees & tickets ─────────────────────────────

export const attendees = sqliteTable(
  'attendees',
  {
    id: text('id').primaryKey(),
    conferenceId: text('conference_id')
      .notNull()
      .references(() => conferences.id, { onDelete: 'cascade' }),
    email: text('email'),
    name: text('name').notNull(),
    company: text('company'),
    role: text('role'),
    whatsapp: text('whatsapp'),
    status: text('status').notNull().default('registered'), // registered | confirmed | checked_in | cancelled
    ticketCode: text('ticket_code').notNull().unique(),
    registeredAt: integer('registered_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    checkedInAt: integer('checked_in_at', { mode: 'timestamp' }),
    checkedInBy: text('checked_in_by').references(() => users.id)
  },
  (t) => ({
    confEmailUniq: uniqueIndex('attendees_conf_email_idx').on(t.conferenceId, t.email),
    confStatusIdx: index('attendees_conf_status_idx').on(t.conferenceId, t.status)
  })
);

// ───────────────────────────── Sponsors / vendors ─────────────────────────────

export const sponsorTiers = sqliteTable(
  'sponsor_tiers',
  {
    id: text('id').primaryKey(),
    conferenceId: text('conference_id')
      .notNull()
      .references(() => conferences.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    rank: integer('rank').notNull().default(0),
    price: integer('price'), // cents
    color: text('color'),
    benefits: text('benefits') // JSON string
  },
  (t) => ({
    confIdx: index('sponsor_tiers_conf_idx').on(t.conferenceId)
  })
);

export const sponsors = sqliteTable(
  'sponsors',
  {
    id: text('id').primaryKey(),
    conferenceId: text('conference_id')
      .notNull()
      .references(() => conferences.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull().default('sponsor'), // sponsor | vendor
    tierId: text('tier_id').references(() => sponsorTiers.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    logoAssetId: text('logo_asset_id'),
    websiteUrl: text('website_url'),
    description: text('description'),
    contactName: text('contact_name'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    contactWhatsapp: text('contact_whatsapp'),
    status: text('status').notNull().default('prospect'),
    // prospect | invited | confirmed | paid | declined
    contractAssetId: text('contract_asset_id'),
    amount: integer('amount'), // cents — sensitive
    currency: text('currency').notNull().default('USD'),
    notes: text('notes'),
    displayOrder: integer('display_order').notNull().default(0),
    isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
  },
  (t) => ({
    confKindIdx: index('sponsors_conf_kind_idx').on(t.conferenceId, t.kind),
    confSlugUniq: uniqueIndex('sponsors_conf_slug_idx').on(t.conferenceId, t.slug)
  })
);

export const sponsorDeliverables = sqliteTable('sponsor_deliverables', {
  id: text('id').primaryKey(),
  sponsorId: text('sponsor_id')
    .notNull()
    .references(() => sponsors.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  doneAt: integer('done_at', { mode: 'timestamp' }),
  notes: text('notes')
});

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  ownerTeamId: text('owner_team_id').references(() => teams.id, { onDelete: 'cascade' }),
  sponsorId: text('sponsor_id').references(() => sponsors.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // logo_light | logo_dark | banner | contract | other
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storagePath: text('storage_path').notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  uploadedBy: text('uploaded_by').references(() => users.id),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// ───────────────────────────── Ops ─────────────────────────────

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }),
    actorUserId: text('actor_user_id').references(() => users.id),
    action: text('action').notNull(),
    target: text('target'),
    metadata: text('metadata'), // JSON
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
  },
  (t) => ({
    teamCreatedIdx: index('audit_log_team_created_idx').on(t.teamId, t.createdAt)
  })
);

export const emailJobs = sqliteTable(
  'email_jobs',
  {
    id: text('id').primaryKey(),
    toAddress: text('to_address').notNull(),
    template: text('template').notNull(),
    payload: text('payload').notNull(), // JSON
    sendAfter: integer('send_after', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    sentAt: integer('sent_at', { mode: 'timestamp' }),
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
  },
  (t) => ({
    pendingIdx: index('email_jobs_pending_idx').on(t.sentAt, t.sendAfter)
  })
);

// ───────────────────────────── Relations ─────────────────────────────

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
  conferences: many(conferences),
  invitations: many(teamInvitations)
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(users, { fields: [teamMembers.userId], references: [users.id] })
}));

export const conferencesRelations = relations(conferences, ({ one, many }) => ({
  team: one(teams, { fields: [conferences.teamId], references: [teams.id] }),
  attendees: many(attendees),
  sponsors: many(sponsors),
  sponsorTiers: many(sponsorTiers)
}));

export const sponsorsRelations = relations(sponsors, ({ one, many }) => ({
  conference: one(conferences, {
    fields: [sponsors.conferenceId],
    references: [conferences.id]
  }),
  tier: one(sponsorTiers, { fields: [sponsors.tierId], references: [sponsorTiers.id] }),
  deliverables: many(sponsorDeliverables)
}));

export const sponsorDeliverablesRelations = relations(sponsorDeliverables, ({ one }) => ({
  sponsor: one(sponsors, { fields: [sponsorDeliverables.sponsorId], references: [sponsors.id] })
}));

export type Role = 'owner' | 'admin' | 'staff';
export type ConferenceStatus = 'draft' | 'published' | 'closed' | 'archived';
export type AttendeeStatus = 'registered' | 'confirmed' | 'checked_in' | 'cancelled';
export type SponsorStatus = 'prospect' | 'invited' | 'confirmed' | 'paid' | 'declined';
export type SponsorKind = 'sponsor' | 'vendor';
