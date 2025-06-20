import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const postModel = mongoose.model("posts", postSchema);
export default postModel;
// This code defines a Mongoose schema for a blog post, including fields for title, content, tags, and timestamps for creation and updates. The schema is then compiled into a model named "posts" for use in the application.
// Note: The 'tags' field should use 'String' instead of 'string' to avoid errors.
// Also, ensure that the 'updateAt' field is updated correctly in your application logic when a post is modified.
