# CastUp Backend API

Backend API for CastUp - AI-Powered Cinema Networking Platform

## Features

- ✅ JWT Authentication
- ✅ File Upload (Computer, YouTube, Instagram)
- ✅ Portfolio Management
- ✅ User Profiles
- ✅ Casting Calls
- ✅ File Sharing
- ✅ PostgreSQL Database
- ✅ Cloudinary Integration

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL=postgresql://localhost:5432/castup
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL
```bash
# Create database
createdb castup
```

#### Option B: Neon (Free Cloud PostgreSQL)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### 4. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/me` - Get current user (protected)

### Files (Script Locker)
- `POST /api/files/upload` - Upload file from computer (protected)
- `POST /api/files/url` - Save YouTube/Instagram URL (protected)
- `GET /api/files` - Get user's files (protected)
- `POST /api/files/:fileId/share` - Share file with users (protected)
- `GET /api/files/shared` - Get files shared with me (protected)

### Portfolios
- `POST /api/portfolios` - Create/Update portfolio (protected)
- `GET /api/portfolios/me` - Get my portfolio (protected)
- `GET /api/portfolios/:userId` - Get user's portfolio

### Users
- `GET /api/users` - Search/Get all users
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/profile` - Update profile (protected)

### Casting Calls
- `POST /api/casting` - Create casting call (protected)
- `GET /api/casting` - Get all casting calls
- `GET /api/casting/:id` - Get casting call by ID
- `POST /api/casting/:id/apply` - Apply to casting call (protected)

## Database Schema

### Users
- id (UUID)
- email (unique)
- password_hash
- name
- department
- auth_provider
- profile_picture
- timestamps

### Portfolios
- id (UUID)
- user_id (FK)
- bio
- experience (JSON)
- skills (array)
- media (JSON)
- external_links (JSON)
- timestamps

### Files
- id (UUID)
- user_id (FK)
- name
- description
- source_type (computer/youtube/instagram)
- file_url
- source_url
- shared_with (array)
- timestamps

### Casting Calls
- id (UUID)
- created_by (FK)
- title
- description
- requirements (JSON)
- status (open/closed)
- applications (JSON)
- timestamps

## Testing with Postman/cURL

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","department":"Actor"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Profile (use token from login)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment

### Render.com (Recommended)
1. Create account at https://render.com
2. Create new Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy!

### Railway
1. Create account at https://railway.app
2. Create new project from GitHub
3. Add PostgreSQL service
4. Add environment variables
5. Deploy!

## Next Steps

- [x] Backend API complete
- [ ] Connect frontend to backend
- [ ] Add OAuth (Google/Facebook)
- [ ] Deploy to production
- [ ] Add email notifications
- [ ] Add WebSockets for real-time features
