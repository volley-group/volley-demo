import { Resource } from 'sst';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/**/*.sql.ts'],
  out: './src/drizzle/migrations',
  verbose: true,
  dbCredentials: {
    ssl: false,
    host: Resource.Database.host,
    port: Resource.Database.port,
    user: Resource.Database.username,
    password: Resource.Database.password,
    database: Resource.Database.database,
  },
});
