import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const isProd = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

function getDbConfig() {
  if (databaseUrl) {
    const u = new URL(databaseUrl);
    return {
      host: u.hostname,
      port: Number(u.port || 5432),
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ''),
      ssl: { rejectUnauthorized: false },
    };
  }
  return {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  };
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...getDbConfig(),
  entities: isProd ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],
  migrations: isProd
    ? ['dist/database/migrations/*.js']
    : ['src/database/migrations/*.ts'],
  synchronize: false,
});
