import express from "express";
import http from "http";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connection from "./config/connection.js";

// Configure environment variables early
dotenv.config();
const app = express();

// middleware
app.use(express.json());
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));

// database connection - now with proper error handling
connection();

// home route
app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
});

// post routes
import PostRouter from "./Routes/PostRouter.js";
import rateLimiter from "./Middlewares/rateLimiter.js";
app.use(rateLimiter); // Apply rate limiting middleware
app.use("/api", PostRouter);

// server setup
const server = http.createServer(app);
server.listen(process.env.PORT || 3001, () => {
  console.log("server is running on port :", process.env.PORT || 3001);
});
