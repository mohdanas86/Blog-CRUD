import express from "express";
import postModel from "../Models/PostSchema.js";
import redis from "../config/redisClient.js";
import rateLimiter from "../Middlewares/rateLimiter.js";
import commentModel from "../Models/commentModel.js";

const PostRouter = express.Router();

/**
 * @desc Get all posts (with optional filtering & pagination)
 * @route GET /api/posts
 * @access Public
 * @rateLimit no limit
 */
PostRouter.get("/posts", async (req, res) => {
  try {
    const { tag, limit = 10, page = 1 } = req.query;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build filter object
    const filter = tag ? { tags: tag } : {};

    // Build cache key
    const cacheKey = `posts:tag=${tag || "all"}:limit=${parsedLimit}:page=${parsedPage}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        message: "Posts fetched from cache",
        data: JSON.parse(cachedData),
      });
    }

    const posts = await postModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .skip(skip);

    const totalPosts = await postModel.countDocuments(filter);

    const responseData = {
      totalPosts,
      page: parsedPage,
      pageSize: posts.length,
      posts,
    };

    await redis.set(cacheKey, JSON.stringify(responseData), "EX", process.env.EXP || 60);

    return res.status(200).json({
      message: "Posts fetched successfully",
      data: responseData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

/**
 * @desc Add a new post
 * @route POST /api/posts
 * @access Public
 * @rateLimit 5
 */
PostRouter.post("/posts", rateLimiter, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const newPost = new postModel({
      title,
      content,
      tags: tags || [],
    });

    const savedPost = await newPost.save();

    if (savedPost) {
      await redis.del("posts"); // Invalidate cache (note: consider invalidating pattern-based keys if needed)
      return res.status(201).json({
        message: "Post created successfully",
        post: savedPost,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

/**
 * @desc Get a single post by ID (with comments)
 * @route GET /api/posts/:id
 * @access Public
 * @rateLimit no limit
 */
PostRouter.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `post:${id}`;
  // On viewing a post
  await redis.incr(`post:${id}:views:buffer`); // Buffer to sync later
  await redis.incr(`post:${id}:views:total`);  // Optional: real-time total

  try {
    const cachedPost = await redis.get(cacheKey);
    if (cachedPost) {
      return res.status(200).json({
        message: "Post fetched from cache",
        data: JSON.parse(cachedPost),
      });
    }

    const post = await postModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await commentModel.find({ postId: id }).sort({ createdAt: -1 });

    const postData = {
      ...post.toObject(),
      comments: comments || [],
    };

    await redis.set(cacheKey, JSON.stringify(postData), "EX", process.env.EXP || 60);

    return res.status(200).json({
      message: "Post fetched successfully",
      data: postData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

/**
 * @desc Update a post by ID
 * @route PATCH /api/posts/:id
 * @access Public
 * @rateLimit 5
 */
PostRouter.patch("/posts/:id", rateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    await redis.del(`post:${id}`); // Clear individual post cache
    await redis.del("posts");      // Optional: clear all posts list caches

    const updatedPost = await postModel.findByIdAndUpdate(id, data, { new: true });

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

/**
 * @desc Delete a post by ID
 * @route DELETE /api/posts/:id
 * @access Public
 * @rateLimit 5
 */
PostRouter.delete("/posts/:id", rateLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await postModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await postModel.findByIdAndDelete(id);

    await redis.del(`post:${id}`);
    await redis.del("posts");

    return res.status(200).json({
      message: "Post deleted successfully",
      data: post,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

export default PostRouter;
