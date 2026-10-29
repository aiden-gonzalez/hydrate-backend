import {Kysely, sql} from 'kysely';

// Emails are now compared case-insensitively (phone keyboards often capitalize the first letter),
// so store them lower case.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`UPDATE "user" SET email = lower(email) WHERE email <> lower(email)`.execute(db);
}

export async function down(): Promise<void> {
  // Original casing isn't recoverable, and lower case emails work either way
}
