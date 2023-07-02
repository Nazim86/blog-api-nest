export const newestLikesMapping = (postLikes) => {
  return postLikes.map((likes) => {
    return {
      addedAt: likes.addedAt,
      userId: likes.userId,
      login: likes.login,
    };
  });
};
