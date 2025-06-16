import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  connectTimeout: 3000,
});

redis.on("connect", () => {
  console.log("Redis connected.....");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redis;
