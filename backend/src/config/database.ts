import { env } from "./index";

export const databaseConfig = {
  uri: env.MONGODB_URI,
  options: {
    maxPoolSize: 20,
    minPoolSize: 5,
    maxIdleTimeMS: 600000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
  },
};
