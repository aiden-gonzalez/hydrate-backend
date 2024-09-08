import { Database } from "./types";
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

export function getPgPool () : Pool {
  if (process.env.NODE_ENV == "cloud") {
    return new Pool({
      database: process.env.CLOUD_PG_DB,
      host: process.env.CLOUD_PG_HOST,
      user: process.env.CLOUD_PG_USER,
      password: process.env.CLOUD_PG_PASS,
      port: 5432,
      max: 10
    });
  } else if (process.env.NODE_ENV == "local") {
    return new Pool({
      database: process.env.LOCAL_PG_DB,
      host: process.env.LOCAL_PG_HOST,
      user: process.env.LOCAL_PG_USER,
      password: process.env.LOCAL_PG_PASS,
      port: 5432,
      max: 10
    });
  } else if (process.env.NODE_ENV == "test") {
    return new Pool({
      database: process.env.TEST_PG_DB,
      host: process.env.TEST_PG_HOST,
      user: process.env.TEST_PG_USER,
      password: process.env.TEST_PG_PASS,
      port: 5432,
      max: 10
    });
  } else {
    throw new Error("Invalid NODE_ENV, cannot create postgres Pool!");
  }
}

export function getDb() : Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: getPgPool()
    })
  });
}

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = getDb();
