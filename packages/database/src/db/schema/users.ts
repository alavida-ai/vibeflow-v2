// // db/schema.ts
// import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// export const users = pgTable('users', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   clerkId: text('clerk_id').unique().notNull(),
//   email: text('email').notNull(),
//   firstName: text('first_name'),
//   lastName: text('last_name'),
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
// })