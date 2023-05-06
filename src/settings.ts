export const settings = {
    MONGO_URI: process.env.MONGO_URL || 'mongodb:/0.0.0.0:27817',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "123",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "456"
}