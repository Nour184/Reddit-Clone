## Backend Conventions

### 🔧 Error Handling Rules
| Code | Meaning | When We Use It |
|------|---------|----------------|
| 400 | Bad Request | Missing fields, invalid data |
| 401 | Unauthorized | User not logged in |
| 404 | Not Found | Post / user / subreddit doesn’t exist |
| 500 | Server Error | Unexpected backend crash |

### 🧩 Our Error Wrapper
We wrap all route handlers with a function to return consistent errors.

### 🔒 Middleware (Next.js)
Auth middleware lives in `middleware.js`  
Used for: login protection, redirects.

### 🧪 Validation
We use **Zod** for validating request bodies.