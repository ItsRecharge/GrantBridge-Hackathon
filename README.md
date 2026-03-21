# Divergent College - Financial Aid & Scholarship Web App

An intelligent web application that helps students estimate financial aid and discover scholarship opportunities using AI-powered form filling and smart matching algorithms.

## Features

- **AI-Powered Form Filling**: Automatically fill college financial aid forms using Llama2 via Ollama
- **Scholarship Discovery**: Search and filter scholarships by tags and criteria
- **Smart Recommendations**: Get personalized scholarship recommendations based on your profile
- **Multi-step Profile Setup**: Complete academic and financial information in a guided flow
- **Background Job Processing**: Handle long-running tasks with BullMQ and Redis

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT
- **AI**: Ollama (Llama2:7b, local)
- **Browser Automation**: Puppeteer
- **Job Queue**: BullMQ with Redis
- **Caching**: Redis

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS + DaisyUI
- **Router**: React Router v6
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## Quick Start (One Command!)

### Option 1: Using the Setup Script
```bash
./setup.sh
```

### Option 2: Using Make
```bash
make setup
```

### Option 3: Using npm
```bash
npm run dev
```

This will:
- Install all dependencies
- Create `.env` files automatically
- Start PostgreSQL and Redis containers
- Start both backend (port 5001) and frontend (port 3000) servers

Then visit **http://localhost:3000** 🎉

## Manual Setup (If Needed)

### Prerequisites
- Node.js 18+
- Docker and Docker Compose

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd divergent-college
```

2. **Start Docker services**
```bash
docker-compose up -d
```

3. **Install dependencies**
```bash
npm install
```

4. **Setup environment files**
```bash
npm run setup:env
```

5. **Start the application**
```bash
npm run start:all
```

6. **Access the app**
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## Available Commands

### Setup & Running
- `npm run dev` - Start everything (Docker + both servers)
- `npm run setup` - First-time setup with environment configuration
- `npm run start:all` - Start both backend and frontend (requires Docker)
- `npm run start:backend` - Start backend server only
- `npm run start:frontend` - Start frontend server only

### Docker
- `npm run docker:up` - Start PostgreSQL and Redis
- `npm run docker:down` - Stop Docker services
- `npm run docker:logs` - View Docker container logs

### Building
- `npm run build` - Build both backend and frontend for production
- `npm run build:backend` - Build backend only
- `npm run build:frontend` - Build frontend only

### Make Commands (Alternative)
If you have `make` installed:
```bash
make setup          # One-command setup and run
make dev            # Start dev servers
make docker-up      # Start Docker
make docker-down    # Stop Docker
make logs           # View logs
make help           # Show all commands
```

## Project Structure

```
divergent-college/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, JWT, Ollama config
│   │   ├── models/          # Sequelize models
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── routes/          # Express routes
│   │   ├── services/        # AI, scraping, caching
│   │   ├── utils/           # Validators, logger
│   │   ├── migrations/      # Database migrations
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── styles/          # CSS files
│   │   ├── App.jsx          # Main app component
│   │   └── index.jsx        # Entry point
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create profile
- `PUT /api/profile` - Update profile

### Colleges
- `GET /api/colleges` - Search colleges
- `POST /api/colleges/estimate` - Request FA estimate
- `GET /api/colleges/estimate/:jobId` - Check estimate status

### Scholarships
- `GET /api/scholarships` - Search scholarships
- `GET /api/scholarships/:id` - Get scholarship details
- `GET /api/scholarships/recommendations` - Get recommendations
- `GET /api/scholarships/tags` - Get all tags
- `POST /api/scholarships/save/:id` - Save scholarship
- `GET /api/scholarships/saved` - Get saved scholarships

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/divergent_college
REDIS_URL=redis://localhost:6379

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

OLLAMA_BASE_URL=http://localhost:11434

PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000

SCRAPING_MAX_SCHOLARSHIPS=100
SCRAPING_RATE_LIMIT_MS=2000
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5001/api
```

## Development

### Running Tests
```bash
cd backend
npm test

cd ../frontend
npm test
```

### Database Migrations
```bash
cd backend

# Create migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npm run migrate

# Undo migrations
npm run migrate:undo
```

### Building for Production

Backend:
```bash
cd backend
npm run build
```

Frontend:
```bash
cd frontend
npm run build
```

## Implementation Phases

### Phase 1: Foundation (Current)
- ✅ Project structure
- ✅ Docker setup
- ✅ Database schema
- ✅ Authentication system
- ✅ Frontend framework
- ⏳ Database migrations

### Phase 2: User Profile System
- Profile API endpoints
- Multi-step form UI
- Profile validation

### Phase 3: AI Form Filling
- Ollama / Llama2 integration
- Puppeteer setup
- Form analysis & filling
- College endpoints

### Phase 4: Scholarship Scraping
- Background job processing
- Scholarship scraper
- Tag extraction
- Database seeding

### Phase 5: Scholarship Features
- Search & filtering
- Recommendation engine
- User interface

### Phase 6: Polish & Testing
- Error handling
- UI refinements
- Testing
- Deployment

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
