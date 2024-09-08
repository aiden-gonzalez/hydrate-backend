import {Kysely, sql} from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('username', 'text', col => col.unique().notNull())
    .addColumn('email', 'text', col => col.unique().notNull())
    .addColumn('hashed_password', 'jsonb', col => col.notNull())
    .addColumn('profile', 'jsonb', col => col.notNull())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute();
  await db.schema
    .createTable('fob')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('user_id', 'text', col => col.references('user.id').notNull())
    .addColumn('name', 'text')
    .addColumn('location', 'jsonb', col => col.unique().notNull())
    .addColumn('info', 'jsonb', col => col.notNull())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute();
  await db.schema
    .createTable('rating')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('fob_id', 'text', col => col.references('fob.id').notNull())
    .addColumn('user_id', 'text', col => col.references('user.id').notNull())
    .addColumn('details', 'jsonb', col => col.notNull())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
    .execute();
  await db.schema
    .createTable('picture')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('fob_id', 'text', col => col.references('fob.id').notNull())
    .addColumn('user_id', 'text', col => col.references('user.id').notNull())
    .addColumn('url', 'text', col => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('picture').execute();
  await db.schema.dropTable('rating').execute();
  await db.schema.dropTable('fob').execute();
  await db.schema.dropTable('user').execute();
}
