import express from "express";
import postModel from "../Models/PostSchema.js";
import redis from "../config/redisClient.js";

const PostRouter = express.Router();

/**
 * @desc Add a new post
 * @route POST /api/posts
 * @access Public
 */
PostRouter.post("/posts", async (req, res) => {
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

    return res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

/**
 * @desc Get all posts
 * @route GET /api/posts
 * @access Public
 */
PostRouter.get("/posts", async (req, res) => {
  try {
    const posts = await postModel.find().sort({ createdAt: -1 });

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
 * @desc Get a single post by ID
 * @route GET /api/posts/:id
 * @access Public
 */
PostRouter.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  let key = `key:${id}`;
  let catchData = await redis.get(key);
  try {
    if (catchData) {
      return res.status(201).json({
        message: "checked cache",
        data: JSON.parse(catchData),
      });
    }
    const post = await postModel.findById(id);
    await redis.set(key, JSON.stringify(post), "Ex", 60);
    return res.status(200).json({
      message: "Post Fetched",
      data: post,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

export default PostRouter;
