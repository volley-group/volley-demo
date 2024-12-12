import { sql } from 'drizzle-orm';
import { text, pgTable, timestamp, jsonb, serial, integer, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';

export const UserTable = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    externalId: text('external_id').notNull().unique(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url'),
    teamId: text('team_id').notNull(),
  },
  (t) => [uniqueIndex('emailUniqueIndex').on(sql`lower(${t.email})`)]
);

export const SlackInstallationTable = pgTable('slack_installations', {
  id: serial('id').primaryKey(),
  teamId: text('team_id').notNull().unique(),
  teamName: text('team_name').notNull(),
  botUserId: text('bot_user_id').notNull(),
  botToken: text('bot_token').notNull(),
  botScopes: text('bot_scopes').notNull(),
  incomingWebhook: jsonb('incoming_webhook')
    .$type<{
      channel: string;
      channelId: string;
      configurationUrl: string;
      url: string;
    }>()
    .notNull(),
});

export const ConfigTable = pgTable(
  'config',
  {
    installationId: integer('installation_id').references(() => SlackInstallationTable.id),
    product: text('product').notNull(),
    services: jsonb('services').$type<string[]>().notNull().default([]),
  },
  (table) => [primaryKey({ columns: [table.installationId, table.product] })]
);

export const StatusMessageTable = pgTable('status_messages', {
  guid: text('guid').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  pubDate: timestamp('pub_date', { mode: 'date' }).notNull(),
  product: text('product').notNull(),
  affectedServices: jsonb('affected_services').$type<string[]>().notNull().default([]),
});
