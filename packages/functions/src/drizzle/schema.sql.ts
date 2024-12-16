import { relations, sql } from 'drizzle-orm';
import { text, pgTable, timestamp, jsonb, serial, integer, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';

export const UserTable = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    externalId: text('external_id').notNull().unique(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url'),
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

export const UserInstallations = pgTable(
  'user_installations',
  {
    userId: text('user_id')
      .references(() => UserTable.id, { onDelete: 'cascade' })
      .notNull(),
    installationId: integer('installation_id')
      .references(() => SlackInstallationTable.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.installationId] })]
);

export const ConfigTable = pgTable(
  'config',
  {
    installationId: integer('installation_id')
      .references(() => SlackInstallationTable.id, { onDelete: 'cascade' })
      .notNull(),
    product: text('product').notNull(),
    services: jsonb('services').$type<string[]>().notNull().default([]),
  },
  (table) => [primaryKey({ columns: [table.installationId, table.product] })]
);

export const UserRelations = relations(UserTable, ({ many }) => ({
  installations: many(UserInstallations),
}));

export const InstallationRelations = relations(SlackInstallationTable, ({ many }) => ({
  configs: many(ConfigTable),
}));

export const UserInstallationsRelations = relations(UserInstallations, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserInstallations.userId],
    references: [UserTable.id],
  }),
  installation: one(SlackInstallationTable, {
    fields: [UserInstallations.installationId],
    references: [SlackInstallationTable.id],
  }),
}));

export const ConfigTableRelations = relations(ConfigTable, ({ one }) => ({
  installation: one(SlackInstallationTable, {
    fields: [ConfigTable.installationId],
    references: [SlackInstallationTable.id],
  }),
}));

export const StatusMessageTable = pgTable('status_messages', {
  guid: text('guid').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  pubDate: timestamp('pub_date', { mode: 'string' }).notNull(),
  product: text('product').notNull(),
  affectedServices: jsonb('affected_services').$type<string[]>().notNull().default([]),
});
