import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing/all-data')
export class DeleteController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Delete()
  @HttpCode(204)
  async deleteRoutes() {
    await this.dataSource.query(`Delete from public.users`);
    // await this.dataSource.query(`Delete from public.devices`);
    // await this.dataSource.query(`Delete from public.post_like`);
    // await this.dataSource.query(`Delete from public.blog_owner_info`);
    // await this.dataSource.query(`Delete from public.blogs`);
    // await this.dataSource.query(`Delete from public.comment_like`);
    await this.dataSource.query(`Delete from public.email_confirmation`);
    await this.dataSource.query(`Delete from public.password_recovery`);
    await this.dataSource.query(`Delete from public.users_ban_by_sa`);
    // await this.dataSource.query(`Delete from public.blog_ban_info`);
    // await this.dataSource.query(`Delete from public.posts`);
    // await this.dataSource.query(`Delete from public.comments`);
    // await this.dataSource.query(`Delete from public.post_info`);
    // await this.dataSource.query(`Delete from public.commentator_info`);
    // await this.dataSource.query(`Delete from public.post_like`);
    // await this.dataSource.query(`Delete from public.users_ban_by_blogger`);

    return;
  }
}
