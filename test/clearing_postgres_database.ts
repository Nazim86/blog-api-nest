import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class ClearDatabase {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async clearDatabase() {
    await this.dataSource.query(`Truncate public.users`);
    await this.dataSource.query(`Truncate public.blogs`);
  }
}
