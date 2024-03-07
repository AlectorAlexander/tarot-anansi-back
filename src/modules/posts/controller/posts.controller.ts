import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/users/service/jwt-auth.guard';
import PostService from '../service/posts.service';
import { IPost } from '../dtos/post.dtos';

@Controller('posts')
export class PostController {
  constructor(private readonly PostService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() data: IPost): Promise<IPost> {
    try {
      const role = req.user.role;
      if (role === 'admin') {
        const post = await this.PostService.create(data);
        return post;
      } else {
        throw new BadRequestException({
          message: 'Failed to create post',
          details: 'Only admins can create posts',
        });
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to create post',
        details: error.message,
      });
    }
  }

  @Get('recent/:limit')
  async getRecentPosts(@Param('limit') limit: number): Promise<IPost[]> {
    try {
      const recentPosts = await this.PostService.getRecentPosts(limit);
      return recentPosts;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to get recent posts',
        details: error.message,
      });
    }
  }

  @Get()
  async read(): Promise<IPost[]> {
    try {
      const posts = await this.PostService.read();
      return posts;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to read posts',
        details: error.message,
      });
    }
  }

  @Get(':id')
  async readOne(@Param('id') id: string): Promise<IPost> {
    try {
      const post = await this.PostService.readOne(id);
      if (!post) {
        throw new NotFoundException('post not found');
      }
      return post;
    } catch (error) {
      throw new NotFoundException('post not found');
    }
  }

  @Put('updateWithout/:id')
  async updateWithoutToken(
    @Request() req: any,
    @Param('id') id: string,
    @Body() { data, secret }: { data: IPost; secret: string },
  ): Promise<IPost> {
    try {
      if (secret === process.env.APP_SECRET_KEY) {
        const updatedPost = await this.PostService.update(id, data);
        if (!updatedPost) {
          throw new NotFoundException('post not found');
        }
        return updatedPost;
      } else {
        throw new BadRequestException({
          message: 'Failed to update post',
          details: 'Only admins can update posts',
        });
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to update post',
        details: error.message,
      });
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() { data, secret }: { data: IPost; secret: string },
  ): Promise<IPost> {
    try {
      const role = req.user.role;
      if (role === 'admin' || secret === process.env.APP_SECRET_KEY) {
        const updatedPost = await this.PostService.update(id, data);
        if (!updatedPost) {
          throw new NotFoundException('post not found');
        }
        return updatedPost;
      } else {
        throw new BadRequestException({
          message: 'Failed to update post',
          details: 'Only admins can update posts',
        });
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to update post',
        details: error.message,
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req: any, @Param('id') id: string): Promise<IPost> {
    try {
      const role = req.user.role;
      if (role === 'admin') {
        const deletedPost = await this.PostService.delete(id);
        if (!deletedPost) {
          throw new NotFoundException('post not found');
        }
        return deletedPost;
      } else {
        throw new BadRequestException({
          message: 'Failed to delete post',
          details: 'Only admins can delete posts',
        });
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to delete post',
        details: error.message,
      });
    }
  }
}
