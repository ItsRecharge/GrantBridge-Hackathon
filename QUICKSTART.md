# Quick Start Guide

Get the Divergent College app running in minutes!

## ⚡ The Fastest Way (One Command)

### Option 1: Shell Script
```bash
./setup.sh
```

### Option 2: Make (if installed)
```bash
make setup
```

### Option 3: npm
```bash
npm run dev
```

All three options will:
1. ✅ Install all dependencies
2. ✅ Create `.env` files with sensible defaults
3. ✅ Start PostgreSQL & Redis (Docker)
4. ✅ Start backend server (port 5001)
5. ✅ Start frontend server (port 3000)

**That's it!** Open http://localhost:3000 in your browser.

---

## 🚀 What Gets Started

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | React app - http://localhost:3000 |
| Backend | 5001 | API server - http://localhost:5001 |
| PostgreSQL | 5432 | Database (Docker) |
| Redis | 6379 | Cache & job queue (Docker) |

---

## 🔧 Common Commands

### Development
```bash
# Start everything
npm run dev

# Just start servers (if Docker already running)
npm run start:all

# Start only backend
npm run start:backend

# Start only frontend
npm run start:frontend
```

### Docker Management
```bash
# Start Docker services
npm run docker:up

# Stop Docker services
npm run docker:down

# View logs
npm run docker:logs
```

### Building for Production
```bash
# Build everything
npm run build

# Build specific services
npm run build:backend
npm run build:frontend
```

### Make Commands (if you have `make`)
```bash
make setup          # One-time setup
make dev            # Start dev servers
make docker-up      # Start Docker
make docker-down    # Stop Docker
make help           # Show all commands
```

---

## 🔐 Environment Setup

The first run will automatically create `.env` files in:
- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

### AI Backend: Ollama (Local)

This project uses **Ollama** with `llama2:7b` for AI features — no API key needed.  
Ollama runs locally via Docker and is set up automatically by `setup.sh`.

The default Ollama URL is `http://localhost:11434/v1`. To change it, edit `backend/.env`:
```bash
OLLAMA_BASE_URL=http://localhost:11434
```

---

## 📝 Project Structure

```
divergent-college/
├── backend/          # Node.js/Express API
├── frontend/         # React SPA
├── docker-compose.yml # PostgreSQL & Redis
├── package.json      # Root configuration
├── Makefile         # Make commands
└── setup.sh         # Setup script
```

---

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 5001 is in use:
```bash
# Kill process on port
kill -9 $(lsof -ti:3000)  # Frontend
kill -9 $(lsof -ti:5001)  # Backend
```

### Docker Issues
```bash
# Restart all services
npm run docker:down
npm run docker:up
```

### Dependencies Not Installing
```bash
# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

### Check Service Status
```bash
# View Docker logs
npm run docker:logs

# Check backend
curl http://localhost:5001/health

# Check frontend
curl http://localhost:3000
```

---

## ✅ Testing the Setup

1. **Frontend works**: Visit http://localhost:3000
2. **Backend works**: Visit http://localhost:5001/health (should return `{"status":"OK"}`)
3. **Try signup**: Create an account on the app
4. **Try login**: Sign in with your credentials

---

## 📚 Next Steps

After setup is complete:

1. **Read the README.md** for full documentation
2. **Check out the plan** at the top of the codebase
3. **Start development** on Phase 2 (Profile System)

---

## 🆘 Need Help?

- Check the main **README.md** for detailed documentation
- Review the **implementation plan** in the repo
- Look at backend logs: `npm run docker:logs`

Happy coding! 🎉
