import { relations } from 'drizzle-orm'
import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { uuidv7 } from 'uuidv7'
import { ExtendedCoreMessage } from '../types'

// *********************************
//       User info
// https://supabase.com/docs/guides/auth/managing-user-data
// *********************************

export const T_userMeta = pgTable('user_meta', {
  id: uuid('id')
    .references(() => authUsers.id, {
      onDelete: 'cascade'
    })
    .primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  isAdmin: boolean('is_admin').notNull().default(false),
  username: varchar('username', { length: 100 }).unique()
})

export const T_chat = pgTable('chat', {
  id: varchar('id', { length: 36 })
    .$defaultFn(() => uuidv7())
    .primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  userId: uuid('user_id')
    .references(() => T_userMeta.id, {
      onDelete: 'cascade'
    })
    .notNull()
})

export const T_message = pgTable('message', {
  id: varchar('id', { length: 36 })
    .$defaultFn(() => uuidv7())
    .primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  chatId: varchar('chat_id', { length: 36 })
    .references(() => T_chat.id, {
      onDelete: 'cascade'
    })
    .notNull(),
  message: jsonb('message').notNull().$type<ExtendedCoreMessage>()
})

export const T_chatRelations = relations(T_chat, ({ one, many }) => ({
  messages: many(T_message),
  user: one(T_userMeta, {
    fields: [T_chat.userId],
    references: [T_userMeta.id]
  })
}))

export const T_messageRelations = relations(T_message, ({ one }) => ({
  chat: one(T_chat, {
    fields: [T_message.chatId],
    references: [T_chat.id]
  })
}))
