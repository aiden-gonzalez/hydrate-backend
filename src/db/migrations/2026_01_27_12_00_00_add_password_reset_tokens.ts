import {Kysely, sql} from 'kysely';
const epochType = 'bigint';
const epochSql = sql`(EXTRACT(EPOCH FROM NOW())::double precision*1000)::bigint`;

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('password_reset_token')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'text', col => col.references('user.id').onDelete('cascade').notNull())
    .addColumn('token', 'text', col => col.unique().notNull())
    .addColumn('expires_at', epochType, col => col.notNull())
    .addColumn('used', 'boolean', col => col.defaultTo(false).notNull())
    .addColumn('created_at', epochType, col => col.defaultTo(epochSql).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('password_reset_token').execute();
}