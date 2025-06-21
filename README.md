# Blog API Platform

A high-performance, fully-featured blog backend API built with Express.js, MongoDB, and Redis.

## Features

- **RESTful API endpoints** for blog posts and comments
- **Redis caching** for improved performance
- **Rate limiting** to prevent API abuse
- **Filtering & pagination** for better data retrieval
- **View counting** with Redis buffer and MongoDB sync
- **Docker containerization** for easy deployment
- **Cron job** for syncing view counts from Redis to MongoDB

## Technology Stack

- **Node.js & Express.js**: Server and API framework
- **MongoDB & Mongoose**: Database and ODM
- **Redis**: Caching and rate limiting
- **Docker & Docker Compose**: Containerization and service orchestration
- **ESM Modules**: Modern JavaScript module system

## API Endpoints

### Posts

| Method | Endpoint        | Description                         | Rate Limit |
|--------|-----------------|-------------------------------------|------------|
| GET    | `/api/posts`    | Get all posts with filtering & pagination | No limit |
| GET    | `/api/posts/:id`| Get a single post with its comments | No limit |
| POST   | `/api/posts`    | Create a new post                   | 5 req/min |
| PATCH  | `/api/posts/:id`| Update a post                       | 5 req/min |
| DELETE | `/api/posts/:id`| Delete a post                       | 5 req/min |

### Comments

| Method | Endpoint                    | Description               | Rate Limit |
|--------|----------------------------|---------------------------|------------|
| POST   | `/api/post/comment/:postId` | Add a comment to a post   | 5 req/min |
| GET    | `/api/post/comment/:postId` | Get all comments for a post | 10 req/min |
| DELETE | `/api/post/comment/:id/:postId` | Delete a comment      | 5 req/min |

## Filtering & Pagination

You can filter and paginate post results:

```http
GET /api/posts?tag=node&limit=5&page=2
```

Parameters:

- `tag`: Filter posts by tag
- `limit`: Number of posts per page (default: 10)
- `page`: Page number (default: 1)

## Data Models

### Post Schema

```javascript
{
  title: String,       // required
  content: String,     // required
  tags: [String],      // optional array of tags
  views: Number,       // view counter (default: 0)
  createdAt: Date,     // automatically set
  updatedAt: Date      // automatically set
}
```

### Comment Schema

```javascript
{
  postId: ObjectId,    // reference to post
  author: String,      // required
  content: String,     // required
  createdAt: Date      // automatically set
}
```

## Caching Strategy

- GET requests for posts and individual posts are cached in Redis
- Cache is invalidated when posts or comments are created, updated, or deleted
- Custom cache keys include query parameters for accurate cache hits

## View Counter System

1. When a post is viewed, a Redis counter is incremented
2. A background cron job runs every 5 minutes to:
   - Collect buffered view counts from Redis
   - Update MongoDB with the accumulated view counts
   - Clear the Redis buffer

## Rate Limiting

- Uses Redis to track request counts by IP address
- Different endpoints have different rate limits
- Returns 429 Too Many Requests when limit is exceeded

## Docker Setup

The application is containerized with Docker and can be run with Docker Compose.

### Services

- **backend**: Node.js application
- **redis**: Redis server for caching and rate limiting

### Running with Docker

```bash
# Build and start all services
docker-compose up

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://username:password@hostname:port/database
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm start
```

## Project Structure

```text
├── app.js                  # Entry point
├── config/
│   ├── connection.js       # MongoDB connection
│   ├── cornJob.js          # View count sync job
│   └── redisClient.js      # Redis client setup
├── Middlewares/
│   └── rateLimiter.js      # Rate limiting middleware
├── Models/
│   ├── commentModel.js     # Comment schema
│   └── PostSchema.js       # Post schema
├── Routes/
│   ├── CommentRouter.js    # Comment routes
│   └── PostRouter.js       # Post routes
├── docker-compose.yml      # Docker Compose configuration
├── dockerfile              # Docker container configuration
└── package.json           # Project dependencies
```

## Next Steps & Improvements

- **Authentication**: Add JWT-based auth system
- **User Management**: User profiles and permissions
- **Testing**: Add unit and integration tests
- **API Documentation**: Add Swagger/OpenAPI docs
- **Logging**: Implement structured logging
- **Error Handling**: Improve error responses
- **Metrics**: Add monitoring and analytics

---

Created by Anas Alam
