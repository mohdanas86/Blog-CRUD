import express from "express";
import postModel from "../Models/PostSchema.js";
import redis from "../config/redisClient.js";
import rateLimiter from "../Middlewares/rateLimiter.js";
import commentModel from "../Models/commentModel.js";

const PostRouter = express.Router();

/**
 * @desc Get all posts
 * @route GET /api/posts
 * @access Public
 * @rateLimit no limit
 */
PostRouter.get("/posts", async (req, res) => {
  try {
    // check redis cache for posts
    const cachedPosts = await redis.get("posts");
    if (cachedPosts) {
      return res.status(201).json({
        message: "Posts fetched from cache",
        data: JSON.parse(cachedPosts),
      });
    }
    // If not in cache, fetch from database
    // and store in cache
    // Fetch all posts from the database
    const posts = await postModel.find().sort({ createdAt: -1 });
    await redis.set(
      "posts",
      JSON.stringify(posts),
      "EX",
      process.env.EXP || 60
    );

    return res.status(200).json({
      message: "Posts fetched successfully",
      data: posts,
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
      await redis.del("posts"); // Invalidate the cache for posts
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
 * @desc Get a single post by ID
 * @route GET /api/posts/:id
 * @access Public
 * @rateLimit no limit
 */
PostRouter.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  let key = `post:${id}`;
  let catchData = await redis.get(key);
  try {
    if (catchData) {
      return res.status(200).json({
        message: "checked cache",
        data: JSON.parse(catchData),
      });
    }

    // If not in cache, fetch from database
    const post = await postModel.findById(id);
    const comments = await commentModel.find({ postId: id }).sort({ createdAt: -1 });

    // If post or comments are found, store in cache
    const postData = {
      ...post.toObject(),
      comments: comments || [],
    }
    if (post || comments) {
      await redis.set(key, JSON.stringify(postData), "Ex", process.env.EX || 60);
      return res.status(200).json({
        message: "Post Fetched",
        data: postData,
      });
    }

  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
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

    // Invalidate Redis cache for this post
    try {
      await redis.del(`post:${id}`);
    } catch (redisErr) {
      return res
        .status(400)
        .json({ message: "Failed to clear cache:", error: redisErr.message });
    }

    const updatePost = await postModel.findByIdAndUpdate({ _id: id }, data);
    if (updatePost) {
      await redis.del("posts"); // Invalidate the cache for all posts

      return res.status(200).json({
        message: "post updated successfully",
        data: updatePost,
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
 * @desc Delete a post by ID
 * @route DELETE /api/posts/:id
 * @access Public
 * @rateLimit 5
 */
PostRouter.delete("/posts/:id", rateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    await redis.del(`post:${id}`);

    // check if post exists
    const postExists = await postModel.findById(id);
    if (!postExists) {
      return res.json({
        message: "Post not found",
      });
    }

    // delete the post
    const deletePost = await postModel.findByIdAndDelete(id);
    if (deletePost) {
      await redis.del("posts"); // Invalidate the cache for all posts
      return res.status(200).json({
        message: "Post deleted successfully",
        data: deletePost,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

export default PostRouter;
