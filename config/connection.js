import mongoose from "mongoose";

const connection = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then((db) => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.error("Database connection failed:", err);
    });
};

export default connection;
