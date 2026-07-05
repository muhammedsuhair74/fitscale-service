import { redis } from "../lib/redis";
import { cacheKeys } from "../lib/constants";

export const invalidateWorkoutCaches = async (keys: string[]) => {
  await redis.del(keys);
};
