// import { Controller } from '@nestjs/common';
//
// @Controller('posts')
// export class PostsController {
//   constructor(
//     protected postQueryRepo: PostsQueryRepo,
//     protected commentsQueryRepo: CommentsQueryRepo,
//     protected postService: PostService,
//     protected commentService: CommentService,
//     protected jwtService: JwtService,
//   ) {}
//
//   async getPosts(req: Request, res: Response) {
//     const accessToken: string | undefined =
//       req.headers.authorization?.split(' ')[1];
//
//     let userId = undefined;
//
//     if (accessToken) {
//       const tokenData = await this.jwtService.getTokenMetaData(
//         accessToken,
//         settings.ACCESS_TOKEN_SECRET,
//       );
//       if (tokenData) {
//         userId = tokenData.userId;
//       }
//     }
//
//     const { pageNumber, pageSize, sortBy, sortDirection } = getPaginationValues(
//       req.query,
//     );
//
//     const getPost: QueryPaginationType<PostsViewType[]> =
//       await this.postQueryRepo.getPost(
//         pageNumber,
//         pageSize,
//         sortBy,
//         sortDirection,
//         userId,
//       );
//
//     res.status(200).send(getPost);
//   }
//
//   async getPostById(req: Request, res: Response) {
//     const accessToken: string | undefined =
//       req.headers.authorization?.split(' ')[1];
//
//     let userId = undefined;
//
//     if (accessToken) {
//       const tokenData = await this.jwtService.getTokenMetaData(
//         accessToken,
//         settings.ACCESS_TOKEN_SECRET,
//       );
//       if (tokenData) {
//         userId = tokenData.userId;
//       }
//     }
//
//     const getPost: PostsViewType | boolean =
//       await this.postQueryRepo.getPostById(req.params.id, userId);
//
//     if (!getPost) {
//       return res.sendStatus(404);
//     }
//     res.status(200).send(getPost);
//   }
//
//   async getCommentByPostId(req: Request, res: Response) {
//     const { pageNumber, pageSize, sortBy, sortDirection } = getPaginationValues(
//       req.query,
//     );
//
//     const getCommentsForPost: QueryPaginationType<CommentsViewType[]> | null =
//       await this.commentsQueryRepo.getCommentsForPost(
//         req.params.postId,
//         pageNumber,
//         pageSize,
//         sortBy,
//         sortDirection,
//       );
//
//     if (!getCommentsForPost) {
//       return res.sendStatus(404);
//     }
//     res.status(200).send(getCommentsForPost);
//   }
//
//   async createPost(req: Request, res: Response) {
//     const title = req.body.title;
//     const shortDescription = req.body.shortDescription;
//     const content = req.body.content;
//     const blogId = req.body.blogId;
//
//     const newPost: PostsViewType | null = await this.postService.createPost(
//       title,
//       shortDescription,
//       content,
//       blogId,
//     );
//     if (!newPost) {
//       return res.sendStatus(404);
//     }
//     res.status(201).send(newPost);
//   }
//
//   async createCommentByPostId(req: Request, res: Response) {
//     const postId = req.params.postId;
//     const content = req.body.content;
//     const userId = req.context.user!._id.toString();
//     const userLogin = req.context.user!.accountData.login;
//
//     const postComment: CommentsViewType | null =
//       await this.commentService.createPostComment(
//         postId,
//         content,
//         userId,
//         userLogin,
//       );
//
//     if (!postComment) {
//       return res.sendStatus(404);
//     }
//     res.status(201).send(postComment);
//   }
//
//   async updatePost(req: Request, res: Response) {
//     const title = req.body.title;
//     const shortDescription = req.body.shortDescription;
//     const content = req.body.content;
//     const blogId = req.body.blogId;
//
//     const updatePost: boolean = await this.postService.updatePost(
//       req.params.id,
//       title,
//       shortDescription,
//       content,
//       blogId,
//     );
//
//     if (!updatePost) {
//       return res.sendStatus(404);
//     }
//     res.sendStatus(204);
//   }
//
//   async updatePostLikeStatus(req: Request, res: Response) {
//     const likeStatus = req.body.likeStatus;
//     const postId = req.params.id;
//     const userId = req.context.user!._id.toString();
//
//     const updateLikeStatus: boolean =
//       await this.postService.updatePostLikeStatus(postId, userId, likeStatus);
//
//     if (!updateLikeStatus) {
//       return res.sendStatus(404);
//     }
//     res.sendStatus(204);
//   }
//
//   async deletePost(req: Request, res: Response) {
//     const deletePost: boolean = await this.postService.deletePostById(
//       req.params.id,
//     );
//
//     if (!deletePost) {
//       return res.sendStatus(404);
//     }
//     res.sendStatus(204);
//   }
// }
