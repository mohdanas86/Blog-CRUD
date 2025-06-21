import redis from "./redisClient.js";
import postModel from "../Models/PostSchema.js";

// Run every 60 seconds
setInterval(async () => {
    try {
        const keys = await redis.keys("post:*:views:buffer");

        for (const key of keys) {
            const [, postId] = key.split(":"); // safer destructure
            const bufferedViews = parseInt(await redis.get(key)) || 0;

            if (bufferedViews > 0) {
                // Update MongoDB
                await postModel.findByIdAndUpdate(
                    postId,
                    { $inc: { views: bufferedViews } }
                );

                // Clear the buffer
                await redis.del(key);
                console.log(`[SYNC] ${bufferedViews} views synced for post ${postId}`);
            }
        }
    } catch (err) {
        console.error("[VIEW SYNC ERROR]", err.message);
    }
}, 300 * 1000); // Every 300 seconds
