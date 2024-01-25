import { IService } from 'src/modules/interfaces/IService';
import { SafeParseError } from 'zod';
import { Injectable } from '@nestjs/common';
import PostModel from '../entities/post.entity';
import { IPost, postValidationSchema } from '../dtos/post.dtos';

@Injectable()
class PostService implements IService<IPost> {
  private _post: PostModel;

  constructor() {
    this._post = new PostModel();
  }

  private sortByDateCreation(a: IPost, b: IPost): number {
    const dateA = a.date_creation || new Date(0);
    const dateB = b.date_creation || new Date(0);
    return dateA.getTime() - dateB.getTime();
  }

  public async getRecentPosts(limit: number): Promise<IPost[]> {
    try {
      const postsFromDB = await this._post.read();
      const posts = postsFromDB.map((post) => ({
        ...post,
      }));

      posts.sort(this.sortByDateCreation);

      const recentPosts = posts.reverse().slice(0, limit);

      return recentPosts;
    } catch (error) {
      throw error;
    }
  }

  private async validateDataAndCreate(data: IPost): Promise<IPost> {
    const parsed = postValidationSchema.safeParse(data);

    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<IPost>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    const post = await this._post.create(data);
    return post;
  }

  public async create(data: IPost): Promise<IPost> {
    try {
      return this.validateDataAndCreate(data);
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: string): Promise<IPost> {
    try {
      return await this._post.delete(id);
    } catch (error) {
      throw error;
    }
  }

  public async read(): Promise<IPost[]> {
    try {
      const postsFromDB = await this._post.read();
      const posts = postsFromDB.map((post) => ({
        ...post,
      }));

      posts.sort(this.sortByDateCreation);

      return posts;
    } catch (error) {
      throw error;
    }
  }

  public async readOne(id: string): Promise<IPost> {
    try {
      const post = await this._post.readOne(id);
      return post;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: string, data: IPost): Promise<IPost> {
    const parsed = postValidationSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed as SafeParseError<IPost>;
      const firstError = errorDetails.error?.errors[0];
      const errorMessage = firstError?.message || 'Validation error';
      const codeMessage = firstError?.code || 'invalid_type';
      throw new Error(`${errorMessage} (code: ${codeMessage})`);
    }
    try {
      const updatedPosts = await this._post.update(id, data);
      return updatedPosts;
    } catch (error) {
      throw error;
    }
  }
}

export default PostService;
