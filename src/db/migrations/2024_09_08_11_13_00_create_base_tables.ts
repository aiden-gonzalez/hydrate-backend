import {Kysely, sql} from 'kysely';

const epochType = 'bigint';
const epochSql = sql`(EXTRACT(EPOCH FROM NOW())::double precision*1000)::bigint`;

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('username', 'text', col => col.unique().notNull())
    .addColumn('email', 'text', col => col.unique().notNull())
    .addColumn('hashed_password', 'jsonb', col => col.notNull())
    .addColumn('profile', 'jsonb', col => col.notNull())
    .addColumn('created_at', epochType, col => col.defaultTo(epochSql).notNull())
    .addColumn('updated_at', epochType, col => col.defaultTo(epochSql).notNull())
    .execute();
  await db.schema
    .createTable('fob')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('user_id', 'text', col => col.notNull()) // no .references() because we don't want a foreign key constraint
    .addColumn('name', 'text')
    .addColumn('location', 'jsonb', col => col.unique().notNull())
    .addColumn('info', 'jsonb', col => col.notNull())
    .addColumn('created_at', epochType, col => col.defaultTo(epochSql).notNull())
    .addColumn('updated_at', epochType, col => col.defaultTo(epochSql).notNull())
    .execute();
  await db.schema
    .createTable('fob_change')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('fob_id', 'text', col => col.references('fob.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'text', col => col.notNull())
    .addColumn('details', 'jsonb', col => col.notNull())
    .addColumn('changed_at', epochType, col => col.defaultTo(epochSql).notNull())
    .execute();
  await db.schema
    .createTable('rating')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('fob_id', 'text', col => col.references('fob.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'text', col => col.notNull()) // no .references() because we don't want a foreign key constraint
    .addColumn('details', 'jsonb', col => col.notNull())
    .addColumn('created_at', epochType, col => col.defaultTo(epochSql).notNull())
    .addColumn('updated_at', epochType, col => col.defaultTo(epochSql).notNull())
    .execute();
  await db.schema
    .createTable('picture')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('fob_id', 'text', col => col.references('fob.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'text', col => col.notNull()) // no .references() because we don't want a foreign key constraint
    .addColumn('url', 'text', col => col.notNull())
    .addColumn('created_at', epochType, (col) => col.defaultTo(epochSql).notNull())
    .addColumn('updated_at', epochType, (col) => col.defaultTo(epochSql).notNull())
    .execute();
  await db.schema
    .createView('fob_with_rating')
    .as(sql`
      SELECT
        fob.*,
        avg((value)::float) AS average_rating
      FROM fob
        LEFT JOIN rating ON rating.fob_id = fob.id
        LEFT JOIN jsonb_each(rating.details) on true
      GROUP BY fob.id`
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropView('fob_with_rating').execute();
  await db.schema.dropTable('picture').execute();
  await db.schema.dropTable('rating').execute();
  await db.schema.dropTable('fob_change').execute();
  await db.schema.dropTable('fob').execute();
  await db.schema.dropTable('user').execute();
}
