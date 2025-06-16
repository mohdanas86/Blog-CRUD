# Project Idea: Blog API Platform

A clean, modular blog backend with:
- Blog posts
- Comments
- Caching (Redis)
- Rate limiting
- Filtering & pagination

---

## Step-by-Step – What to Build

### Step 1: Setup Project
- Create Express project
- Connect to MongoDB
- Connect to Redis

---

### Step 2: Blog Post CRUD

**Collection:** `posts`

**Post Schema:**
- `title`: string  
- `content`: string  
- `tags`: array of strings  
- `createdAt`: date  
- `updatedAt`: date  

**Endpoints:**
- `POST /posts` → Create a new post  
- `GET /posts` → Get all posts  
- `GET /posts/:id` → Get a single post  
- `PUT /posts/:id` → Update a post  
- `DELETE /posts/:id` → Delete a post  

---

### Step 3: Add Redis Caching
- Cache `GET /posts` and `GET /posts/:id`
- Invalidate cache on create, update, delete

---

### Step 4: Add Comments

**Collection:** `comments`

**Comment Schema:**
- `postId`: ObjectId  
- `author`: string  
- `text`: string  
- `createdAt`: date  

**Endpoints:**
- `POST /posts/:id/comments` → Add a comment to a post  
- `GET /posts/:id/comments` → Get all comments for a post  
- `DELETE /comments/:id` → Delete a comment  

---

### Step 5: Add Rate Limiting (with Redis)
- Limit `GET` routes (e.g., 100 requests/IP/hour)
- Respond with `429 Too Many Requests` if exceeded

---

### Step 6: Filtering & Pagination
- Example:  
  `GET /posts?tag=node&limit=5&page=2`  
  → Filter by tag, paginate results

---

### Step 7: Analytics Counter *(Optional)*
- On `GET /posts/:id`, increment Redis counter
- `GET /posts/:id/views` → Return view count from Redis

---

### Step 8: Testing & Tools
- Use Postman for manual testing
- Add proper error handling and logs
- (Optional) Minimal unit tests

---

## Skills Required
- Express routing & middleware  
- MongoDB schema modeling  
- Redis (caching, TTL, rate limiting)  
- CRUD operations  
- RESTful API design  
- Query params, pagination, relationships  

