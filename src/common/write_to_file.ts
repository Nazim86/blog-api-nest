export const writeSql = async (content) => {
  const fs = await import('fs/promises');

  try {
    await fs.writeFile('/Users/nazimmammadov/Downloads/sql.txt', content);
  } catch (err) {
    console.log(err);
  }
};
