import mongoose from "mongoose";

const connection = async () => {
  try {
    const options = {
      // These options help with connection issues
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    // Exit with failure if in production, or retry if in development
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      console.log("Will retry connection in 5 seconds...");
      setTimeout(connection, 5000);
    }
  }
};

export default connection;
