export const errorMessage = (msg: string, field: string) => {
  return {
    errorsMessages: [
      {
        message: msg,
        field: field,
      },
    ],
  };
};
