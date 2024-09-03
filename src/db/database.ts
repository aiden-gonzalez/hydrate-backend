import { Database } from "./types";
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

const dialect = new PostgresDialect({
  pool: process.env.NODE_ENV == "cloud" ?
    new Pool({
      database: process.env.CLOUD_PG_DB,
      host: process.env.CLOUD_PG_HOST,
      user: process.env.CLOUD_PG_USER,
      password: process.env.CLOUD_PG_PASS,
      port: 5432,
      max: 10
    }) : new Pool({
      database: process.env.LOCAL_PG_DB,
      host: process.env.LOCAL_PG_HOST,
      user: process.env.LOCAL_PG_USER,
      password: process.env.LOCAL_PG_PASS,
      port: 5432,
      max: 10
    })
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect
});
