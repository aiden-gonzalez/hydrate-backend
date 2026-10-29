import {Kysely, sql} from 'kysely';
const epochType = 'bigint';
const epochSql = sql`(EXTRACT(EPOCH FROM NOW())::double precision*1000)::bigint`;

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('report')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('reporter_id', 'text', col => col.references('user.id').onDelete('cascade').notNull())
    .addColumn('content_type', 'text', col => col.notNull())
    .addColumn('content_id', 'text', col => col.notNull())
    .addColumn('reason', 'text', col => col.notNull())
    .addColumn('details', 'text')
    .addColumn('resolved', 'boolean', col => col.defaultTo(false).notNull())
    .addColumn('created_at', epochType, col => col.defaultTo(epochSql).notNull())
    .addUniqueConstraint('report_reporter_content_unique', ['reporter_id', 'content_type', 'content_id'])
    .execute();
  await db.schema
    .alterTable('picture')
    .addColumn('hidden', 'boolean', col => col.defaultTo(false).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('picture').dropColumn('hidden').execute();
  await db.schema.dropTable('report').execute();
}
