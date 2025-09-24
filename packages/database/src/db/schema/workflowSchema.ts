// import { pgTable, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
// import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

// export const workflows = pgTable('workflows', {
//   id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
//   slug: text('slug').notNull().unique(),
//   name: text('name').notNull(),
//   description: text('description'),
//   spec: jsonb('spec').notNull(), // WorkflowSpec JSON
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });

// // Zod schemas for validation
// export const selectWorkflowSchema = createSelectSchema(workflows);
// export const insertWorkflowSchema = createInsertSchema(workflows);

// export type Workflow = typeof selectWorkflowSchema;
// export type InsertWorkflow = typeof insertWorkflowSchema;