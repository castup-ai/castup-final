# ⚡ Quick Setup - Database Connected!

## ✅ Your Neon Database is Ready

Connection String:
```
postgresql://neondb_owner:npg_0DhFqNygIC4P@ep-rough-rain-ahg7ahin-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 🔧 One Manual Step Required

The `.env` file is protected by gitignore (for security). Please update it manually:

### Option 1: Edit in VS Code
1. Open `backend/.env` in VS Code
2. Find the line: `DATABASE_URL=postgresql://localhost:5432/castup`
3. Replace with:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_0DhFqNygIC4P@ep-rough-rain-ahg7ahin-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save the file (Ctrl+S)

### Option 2: Use Command
```powershell
cd backend
(Get-Content .env) -replace 'DATABASE_URL=.*', 'DATABASE_URL=postgresql://neondb_owner:npg_0DhFqNygIC4P@ep-rough-rain-ahg7ahin-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' | Set-Content .env
```

## 🚀 After Updating .env

Start the backend:
```bash
cd backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════╗
║   🎬 CastUp Backend Server Running   ║
║   Port: 5000                          ║
╚═══════════════════════════════════════╝
```

## ✅ Test It Works

```bash
curl http://localhost:5000/api/health
```

Expected response: `{"status":"OK","message":"CastUp API is running"}`

---

**Once backend is running, I'll help you connect the React frontend to it!**
