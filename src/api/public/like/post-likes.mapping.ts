export const newestLikesMapping = (postLikes) => {
  return postLikes.map((like) => {
    return {
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.login,
    };
  });
};
