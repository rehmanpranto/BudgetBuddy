# BudgetBuddy - Expense Tracking Application

## 🚀 Quick Start (Super Easy!)

**Option 1: Double-click** `start.bat` (Windows)

**Option 2: VS Code Task**
- Press `Ctrl+Shift+P` → "Tasks: Run Task" → "Start BudgetBuddy"

**Option 3: Terminal**
```bash
npm run dev
```

This starts both the server (localhost:4000) and client (localhost:5173) together!

## ✅ **Database Setup Complete!**

The PostgreSQL database tables have been created:
- ✅ `users` table (authentication)
- ✅ `transactions` table (income/expenses)

You can now register and login successfully!

## 📱 Access Your App

Open your browser to: **http://localhost:5173**

## 🛠️ Available Commands

```bash
npm run dev          # Start both server + client
npm run server       # Start only server
npm run client       # Start only client  
npm run install-all  # Install all dependencies
npm run build        # Build for production
```

## 🏗️ Project Structure

```
BudgetBuddy/
├── server/          # Node.js + Express API
├── client/          # React + Vite frontend
├── start.bat        # Windows quick-start
└── package.json     # Root scripts
```

## 🔧 Features

- ✅ User authentication (JWT + bcrypt)
- ✅ Income/expense tracking
- ✅ Visual charts and analytics
- ✅ Category filtering
- ✅ PostgreSQL database (Supabase)
- ✅ Responsive design

## 🛡️ Environment

Server uses `.env` file with:
- `DATABASE_URL` - Supabase PostgreSQL connection
- `JWT_SECRET` - Token signing secret
- `PORT` - Server port (default: 4000)
