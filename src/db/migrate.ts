import * as path from 'path'
import { promises as fs } from 'fs'
import {
  Migrator,
  FileMigrationProvider,
  NO_MIGRATIONS
} from 'kysely'
import {getDb} from "./database";

export async function migrateToLatest() {
  await migrateTo();
}

export async function migrateToNothing() {
  await migrateTo(NO_MIGRATIONS);
}

async function migrateTo(migration_name : any = null) {
  // We want a separate db pool for migration
  const migrationDb = getDb();

  const migrator = new Migrator({
    db: migrationDb,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  })

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
