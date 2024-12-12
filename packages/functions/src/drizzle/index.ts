import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.sql';
import { Resource } from 'sst';

const pool = new pg.Pool({
  host: Resource.Database.host,
  port: Resource.Database.port,
  user: Resource.Database.username,
  password: Resource.Database.password,
  database: Resource.Database.database,
});

export const db = drizzle(pool, { schema });
export { schema };
