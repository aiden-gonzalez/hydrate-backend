import {Kysely} from 'kysely';

// Existing passwords were hashed with 100 PBKDF2 iterations. Record the iteration count per user so
// those hashes keep working and can be upgraded the next time the user logs in.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('auth')
    .addColumn('hash_iterations', 'integer', col => col.defaultTo(100).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('auth').dropColumn('hash_iterations').execute();
}
