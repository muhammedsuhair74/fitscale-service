import { redis } from "./redis";

export async function getCache<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);

  if (!cached) return null;

  return JSON.parse(cached);
}

export async function setCache(key: string, value: unknown, ttl = 60) {
  await redis.set(key, JSON.stringify(value), {
    EX: ttl,
  });
}

export async function deleteCache(key: string) {
  await redis.del(key);
}
