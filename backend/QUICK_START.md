# Quick Start Guide - CastUp Backend

## ⚠️ Important: Database Setup Required

The backend requires a PostgreSQL database. Here are your options:

## Option 1: Use Neon (Free Cloud PostgreSQL) - RECOMMENDED ✅

**This is the easiest option and requires no local installation!**

### Steps:
1. **Sign up** at https://neon.tech (free account)
2. **Create a new project** named "cast up"
3. **Copy the connection string** from the dashboard
4. **Update `.env` file** in the backend folder:
   ```
   DATABASE_URL=postgresql://username:password@host/database?sslmode=require
   ```
5. **Start the server**:
   ```bash
   cd backend
   npm run dev
   ```

The server will automatically create all necessary tables!

## Option 2: Local PostgreSQL

If you have PostgreSQL already installed:

1. **Create database**:
   ```bash
   createdb castup
   ```

2. **Update `.env`**:
   ```
   DATABASE_URL=postgresql://localhost:5432/castup
   ```

3. **Start server**:
   ```bash
   cd backend
   npm run dev
   ```

## Option 3: Use SQLite for Quick Testing

**Don't want to set up PostgreSQL right now?**

I can create a SQLite version that works with zero setup. Just let me know!

## After Database is Set Up

The server will run on `http://localhost:5000`

Test it:
```bash
curl http://localhost:5000/api/health
```

You should see: `{"status":"OK","message":"CastUp API is running"}`

## Next: Connect Frontend

Once the backend is running, we'll update the frontend to use the real APIs instead of mock data!

## Need Help?

Just let me know if you:
- Want me to set up Neon for you (I'll guide you)
- Want the SQLite version instead
- Run into any errors
