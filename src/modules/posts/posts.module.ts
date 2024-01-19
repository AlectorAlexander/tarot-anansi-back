import { Module } from '@nestjs/common';
import { PostController } from './controller/posts.controller';
import PostService from './service/posts.service';

@Module({
  controllers: [PostController],
  providers: [PostService],
})
export class postsModule {}
