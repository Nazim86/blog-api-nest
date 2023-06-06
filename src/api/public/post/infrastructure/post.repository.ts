import { ObjectId } from 'mongodb';
import {
  Post,
  PostDocument,
  PostModelType,
} from '../../../../domains/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
  async getPostById(postId: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({ _id: new ObjectId(postId) });
  }

  async save(post: PostDocument) {
    return post.save();
  }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await this.PostModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }
}
