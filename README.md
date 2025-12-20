# Reddit Clone - Full-Stack Web Application

- [Reddit Clone - Full-Stack Web Application](#reddit-clone---full-stack-web-application)
  - [Project Overview](#project-overview)
  - [Key Features](#key-features)
    - [User Management](#user-management)
    - [Community Features](#community-features)
    - [Content Creation \& Interaction](#content-creation--interaction)
    - [Discovery \& Navigation](#discovery--navigation)
    - [Additional Features](#additional-features)
  - [Technology Stack](#technology-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Cloud Services \& APIs](#cloud-services--apis)
    - [Development Tools](#development-tools)
  - [Database Schema](#database-schema)
    - [Core Tables](#core-tables)
      - [Users](#users)
      - [Communities](#communities)
      - [Posts](#posts)
      - [Comments](#comments)
    - [Relationship Tables](#relationship-tables)
      - [Joined Communities](#joined-communities)
      - [Community Admins](#community-admins)
    - [Voting Tables](#voting-tables)
      - [Post Votes](#post-votes)
      - [Comment Votes](#comment-votes)
    - [Media Management Tables](#media-management-tables)
      - [User Media Info](#user-media-info)
      - [Post Media Info](#post-media-info)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Building for Production](#building-for-production)
    - [Running Tests](#running-tests)
  - [UI/UX Features](#uiux-features)
  - [Security Features](#security-features)
  - [Performance Optimizations](#performance-optimizations)
  - [Testing](#testing)
  - [Known Limitations \& Future Enhancements](#known-limitations--future-enhancements)
    - [Current Limitations](#current-limitations)
    - [Possible Enhancements](#possible-enhancements)
  - [Learning Outcomes](#learning-outcomes)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)


##  Project Overview

This project is a full-featured Reddit clone built as part of a Web Development course at Ainshams University, Cairo, Egypt. It demonstrates modern web development practices, including server-side rendering, authentication, real-time interactions, and cloud-based media management.

The application replicates core Reddit functionality, allowing users to create communities (subreddits), post content, comment, vote, and interact with other users in a social media environment.

**Course**: Web Development  
**Semester**: Fall 2025  
**Institution**: Ainshams University, Cairo, Egypt  
**Live Demo**: [https://reddit-clone-nt.vercel.app/](https://reddit-clone-nt.vercel.app/)

---

## Key Features

### User Management
- **Authentication & Authorization**: Secure user registration and login using NextAuth.js with credential-based authentication
- **User Profiles**: Customizable profiles with profile pictures, bio, and activity tracking
- **Password Security**: Bcrypt-based password hashing for secure credential storage
- **Session Management**: JWT-based session handling with secure token management

### Community Features
- **Create Communities**: Users can create and manage their own subreddit-style communities
- **Community Administration**: Owner and admin roles with moderation capabilities
- **Join/Leave Communities**: Users can subscribe to communities of interest
- **Community Customization**: Custom descriptions and community photos

### Content Creation & Interaction
- **Post Creation**: Support for text posts, link posts, and image posts
- **Rich Media Support**: Image uploads via Cloudinary integration
- **Commenting System**: Nested comment threads on posts
- **Voting System**: Upvote/downvote functionality for both posts and comments
- **Vote Tracking**: Real-time vote count updates and user vote state management

### Discovery & Navigation
- **Feed System**: Personalized feed showing posts from joined communities
- **Search Functionality**: Search for posts, communities, and users
- **Community Browsing**: Explore and discover new communities
- **User Activity**: View user post history and comment activity

### Additional Features
- **AI Integration**: Google Generative AI integration for enhanced features
- **Rate Limiting**: Upstash Redis-based rate limiting to prevent abuse
- **Dark Mode**: Theme switching support with next-themes
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Draft System**: Save post drafts for later publication

---

## Technology Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 19](https://react.dev/) - Component-based UI library
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: 
  - [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
  - [Lucide React](https://lucide.dev/) - Icon library
  - [Sonner](https://sonner.emilkowal.ski/) - Toast notifications
- **Theme Management**: [next-themes](https://github.com/pacocoursey/next-themes) - Dark mode support

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Authentication**: [NextAuth.js v5](https://next-auth.js.org/) - Authentication solution
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Relational database
- **Database Client**: [node-postgres (pg)](https://node-postgres.com/) - PostgreSQL client
- **Validation**: [Zod v4](https://zod.dev/) - TypeScript-first schema validation
- **Password Hashing**: [bcrypt](https://www.npmjs.com/package/bcrypt) - Secure password hashing

### Cloud Services & APIs
- **Media Storage**: [Cloudinary](https://cloudinary.com/) - Image hosting and optimization
- **Rate Limiting**: [Upstash Redis](https://upstash.com/) - Serverless Redis for rate limiting
- **AI Integration**: [Google Generative AI](https://ai.google.dev/) - AI-powered features

### Development Tools
- **Language**: TypeScript - Type-safe JavaScript
- **Testing**: Jest - JavaScript testing framework
- **Linting**: ESLint - Code quality and consistency
- **Package Manager**: npm - Dependency management

---

## Database Schema

The application uses a PostgreSQL relational database with the following schema:

### Core Tables

#### Users
```sql
CREATE TABLE users (
    email TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    profile_picture_link TEXT,
    about_me TEXT,
    created_on TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### Communities
```sql
CREATE TABLE communities (
    name TEXT PRIMARY KEY,
    description TEXT,
    community_photo_link TEXT,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    community_owner TEXT NOT NULL,
    FOREIGN KEY (community_owner) REFERENCES users(email) ON DELETE CASCADE
);
```

#### Posts
```sql
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    community_name TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    picture_link TEXT,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (community_name) REFERENCES communities(name) ON DELETE CASCADE
);
```

#### Comments
```sql
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_email TEXT NOT NULL,
    body TEXT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);
```

### Relationship Tables

#### Joined Communities
```sql
CREATE TABLE joined_communities (
    user_email TEXT NOT NULL,
    community_name TEXT NOT NULL,
    joined_on TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_email, community_name),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (community_name) REFERENCES communities(name) ON DELETE CASCADE
);
```

#### Community Admins
```sql
CREATE TABLE community_admins (
    user_email TEXT NOT NULL,
    community_name TEXT NOT NULL,
    PRIMARY KEY (user_email, community_name),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (community_name) REFERENCES communities(name) ON DELETE CASCADE
);
```

### Voting Tables

#### Post Votes
```sql
CREATE TABLE post_votes (
    user_email TEXT NOT NULL,
    post_id INT NOT NULL,
    flag SMALLINT NOT NULL CHECK (flag IN (-1, 1)),
    PRIMARY KEY (user_email, post_id),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);
```

#### Comment Votes
```sql
CREATE TABLE comment_votes (
    user_email TEXT NOT NULL,
    comment_id INT NOT NULL,
    flag SMALLINT NOT NULL CHECK (flag IN (-1, 1)),
    PRIMARY KEY (user_email, comment_id),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);
```

### Media Management Tables

#### User Media Info
```sql
CREATE TABLE user_media_info (
    user_email TEXT PRIMARY KEY,
    public_id TEXT NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);
```

#### Post Media Info
```sql
CREATE TABLE post_media_info (
    post_id INT PRIMARY KEY,
    public_id TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);
```

--- 

## Getting Started

### Prerequisites

- **Node.js**: Version 20.x or higher
- **npm**: Version 10.x or higher
- **PostgreSQL**: Version 12.x or higher
- **Cloudinary Account**: For image hosting
- **Upstash Redis**: For rate limiting (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nour184/Reddit-Clone.git
   cd Reddit-Clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create a PostgreSQL database
   - Run the SQL schema from `utils/db_operations/create_database.sql`
   ```bash
   psql -U your_username -d your_database -f utils/db_operations/create_database.sql
   ```

4. **Configure environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Database Configuration
   POSTGRES_URL=postgresql://username:password@localhost:5432/reddit_clone
   
   # NextAuth Configuration
   AUTH_SECRET=your-secret-key-here
   AUTH_URL=http://localhost:3000
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Upstash Redis (Optional)
   UPSTASH_REDIS_REST_URL=your-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   
   # Google AI (Optional)
   GOOGLE_AI_API_KEY=your-google-ai-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Running Tests

```bash
npm test
```

---

## UI/UX Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode**: System preference detection with manual toggle
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: User-friendly error messages and fallbacks
- **Toast Notifications**: Real-time feedback for user actions
- **Infinite Scroll**: Efficient pagination for feeds and comments
- **Optimistic Updates**: Immediate UI updates with background sync

---

## Security Features

- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **SQL Injection Prevention**: Parameterized queries using pg library
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: NextAuth.js built-in CSRF tokens
- **Rate Limiting**: Upstash Redis-based request throttling
- **Secure Sessions**: HTTP-only cookies with secure flags
- **Environment Variables**: Sensitive data stored in .env files

---

## Performance Optimizations

- **Server-Side Rendering**: Fast initial page loads with Next.js SSR
- **Image Optimization**: Cloudinary CDN with automatic format conversion
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components and images loaded on demand
- **Database Indexing**: Optimized queries with strategic indexes
- **Caching**: Redis-based caching for frequently accessed data

---

## Testing

The project includes unit tests for critical functionality:

- **Authentication Tests**: Login, registration, and session management
- **CRUD Operations**: Database operation validation
- **API Endpoint Tests**: Request/response validation
- **Component Tests**: UI component rendering and interaction

Run tests with:
```bash
npm test
```

---

## Known Limitations & Future Enhancements

### Current Limitations
- No real-time notifications (WebSocket support pending)
- Limited moderation tools for community admins
- No direct messaging between users
- Basic search functionality (no advanced filters)

### Possible Enhancements
- Real-time notifications using WebSockets
- Advanced moderation dashboard
- User-to-user messaging system
- Enhanced search with filters and sorting
- Post scheduling and auto-moderation
- Community analytics and insights
- Mobile application (React Native)

---

## Learning Outcomes

This project demonstrates proficiency in:

1. **Full-Stack Development**: Building complete web applications from database to UI
2. **Modern React Patterns**: Hooks, Context API, and component composition
3. **Next.js Framework**: App Router, API routes, and server components
4. **Database Design**: Relational database modeling and normalization
5. **Authentication & Security**: Implementing secure user authentication
6. **API Development**: RESTful API design and implementation
7. **Cloud Integration**: Third-party service integration (Cloudinary, Upstash)
8. **TypeScript**: Type-safe development with interfaces and validation
9. **Responsive Design**: Mobile-first CSS with Tailwind
10. **Version Control**: Git workflow and collaboration

---

## License

This project is created for academic purposes as part of a Web Development course at Ainshams University, Cairo, Egypt.

---

## Acknowledgments

- **Next.js Team**: For the excellent React framework
- **Vercel**: For hosting and deployment platform
- **PostgreSQL Community**: For the robust database system
- **NextAuth.js**: For authentication solution
- **Cloudinary**: For media management services
- **ASU Faculty**: For guidance and support throughout the course

---

**Note**: This is an academic project and is not affiliated with Reddit, Inc. All Reddit trademarks and branding belong to their respective owners.
