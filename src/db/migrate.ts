import * as path from 'path'
import { promises as fs } from 'fs'
import {
  Migrator,
  FileMigrationProvider,
  NO_MIGRATIONS,
  sql
} from 'kysely'
import {getDb} from "./database";
import {exponentialBackoff} from "../utils/retry";

export async function migrateToLatest() {
  await migrateTo();
}

export async function migrateToNothing() {
  await migrateTo(NO_MIGRATIONS);
}

async function migrateTo(migration_name : any = null) {
  // We want a separate db pool for migration
  const migrationDb = getDb();

  // Ensure postgres db is ready for migration. This will execute this query until it succeeds
  await exponentialBackoff(
    async () => await migrationDb.executeQuery(sql`SELECT * FROM information_schema.tables`.compile(migrationDb)),
    {
      tryMessage: "Checking if the database is ready for migration...",
      retryMessage: "Database not ready yet"
    }
  );


  const migrator = new Migrator({
    db: migrationDb,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  const { error, results } = migration_name != null ? await migrator.migrateTo(migration_name) : await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await migrationDb.destroy();
}
