import { DataSource } from 'typeorm';
export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'sa',
  database: 'blog-api-nest-rawSql',
  synchronize: false,
  entities: ['src/**/*.entity{.ts,.js}'],
});
