import express from "express";
import commentModel from "../Models/commentModel.js";
import rateLimiter from "../Middlewares/rateLimiter.js";
import postModel from "../Models/PostSchema.js";
import redis from "../config/redisClient.js";

const commentRouter = express.Router();

/**
 * @desc Create a new comment,
 * @route POST /api/comments
 * @access Public
 * @rateLimit 5 requests per minute
 */
commentRouter.post("/post/comment/:postId", rateLimiter, async (req, res) => {
  try {
    const { postId } = req.params;
    const { author, content } = req.body;


    // validate input
    if (!postId || !author || !content) {
      return res.status(400).json({
        message: "Post ID, author, and content are required",
      });
    }

    // check if post exists
    const postExists = await postModel.findById(postId);
    if (!postExists) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // create a new comment
    const newComment = new commentModel({
      postId,
      author,
      content,
    });

    const saveComment = await newComment.save();
    if (saveComment) {
      await redis.del(`post:${postId}`);
      return res.status(201).json({
        message: "Comment created successfully",
        data: saveComment,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

/**
 * @desc Get all comments for a post,
 * @route GET /api/comments/posts/:postid
 * @access Public
 * @rateLimit 10 requests per minute
 */
commentRouter.get("/post/comment/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    // validte input 
    if (!postId) {
      return res.status(400).json({
        message: "Post Id is required"
      })
    }

    // check if post exists
    const postExists = await postModel.findById(postId);
    if (!postExists) {
      return res.status(404).json({
        message: "Post not found"
      })
    }

    // get all comments for the post
    const comments = await commentModel.find({ postId }).sort({ createdAt: -1 })
    if (comments.length > 0) {
      return res.status(200).json({
        message: "Comments retrieved successfully",
        data: comments
      })
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message
    })
  }
})

/**
 * @desc Delete a comment by ID,
 * @route DELETE /api/comment/:id/:postId
 * @access Publid
 * @rateLimit 5 requests per minute
 */
commentRouter.delete("/post/comment/:id/:postId", rateLimiter, async (req, res) => {
  try {
    const { id, postId } = req.params;
    // validate input
    if (!id || !postId) {
      return res.status(400).json({
        message: "Comment ID and Post ID are required"
      })
    }

    // check if post exists
    const postExists = await postModel.findById(postId);
    if (!postExists) {
      return res.status(404).json({
        message: "Post not found"
      })
    }

    // check if comment exists
    const commentExists = await commentModel.find({ postId: id });
    if (!commentExists) {
      return res.status(404).json({
        message: "Comment not found"
      })
    }

    // delete the comment
    const deleteComment = await commentModel.findByIdAndDelete(id);
    if (deleteComment) {
      await redis.del(`post:${postId}`);
      return res.status(200).json({
        message: "Comment deleted successfully",
        data: deleteComment
      })
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message
    })
  }
})

export default commentRouter;
