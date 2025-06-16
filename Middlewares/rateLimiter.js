import redis from "../config/redisClient.js";

const MAX_LIMIT = 2;
const WINDOW = 30;

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;
    const key = `key:${ip}`;

    let request = await redis.get(key);
    // console.log(`IP: ${ip}, Count: ${parseInt(request)}`); // Debugging line to check the request count

    if (request) {
      if (parseInt(request) >= MAX_LIMIT) {
        return res.status(429).json({
          message: "Too many requests, please try again later.",
        });
      }

      await redis.incr(key);
    } else {
      await redis.set(key, 1, "EX", WINDOW); // set with expiry
    }

    next();
  } catch (err) {
    next();
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export default rateLimiter;
