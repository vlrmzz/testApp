# HabitTracker - Social Habit Tracking App

A full-stack habit tracking application with social features built with React, Node.js, Express, and PostgreSQL.

## Features

### Core Features
- 🔐 **User Authentication** - Secure login/signup with JWT
- 📊 **Habit Management** - Create, edit, and delete daily/weekly habits
- ✅ **Progress Tracking** - Log habit completions and track streaks
- 📈 **Analytics Dashboard** - Visualize your progress with charts
- 👥 **Social Features** - Add friends and see their progress
- 🎉 **Encouragement System** - Cheer on friends' achievements

### Technical Features
- Responsive design with Tailwind CSS
- Real-time data updates
- Secure API with input validation
- Docker containerization
- Database migrations and seeding
- Health checks and monitoring

## Tech Stack

### Frontend
- **React 18** - User interface
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (for local development)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habit-tracker
   ```

2. **Start with Docker Compose**
   ```bash
   # Start all services (app + database)
   docker-compose up -d

   # View logs
   docker-compose logs -f
   ```

3. **Access the application**
   - App: http://localhost:5000
   - Database: localhost:5432

4. **Stop the services**
   ```bash
   docker-compose down
   ```

### Option 2: Local Development

1. **Set up the database**
   ```bash
   # Start PostgreSQL with Docker
   docker-compose -f docker-compose.dev.yml up -d db
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   npm install

   # Frontend dependencies
   cd client && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or run separately:
   npm run server  # Backend on :5000
   npm run client  # Frontend on :3000
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/habit_tracker
DB_HOST=localhost
DB_PORT=5432
DB_NAME=habit_tracker
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Habits
- `GET /api/habits` - Get user habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/entries` - Log habit entry
- `GET /api/habits/:id/entries` - Get habit entries
- `GET /api/habits/:id/streak` - Get habit streak info

### Social
- `GET /api/social/users/search` - Search users
- `POST /api/social/friends/request` - Send friend request
- `GET /api/social/friends/requests` - Get friend requests
- `PUT /api/social/friends/requests/:id` - Respond to friend request
- `GET /api/social/friends` - Get friends list
- `DELETE /api/social/friends/:id` - Remove friend
- `POST /api/social/cheers` - Send cheer
- `GET /api/social/cheers` - Get received cheers
- `GET /api/social/feed` - Get friends' activity feed

## Database Schema

### Tables
- **users** - User accounts and profiles
- **habits** - User-created habits
- **habit_entries** - Daily/weekly habit completions
- **friendships** - Friend relationships
- **cheers** - Social encouragement messages

## Deployment

### Production with Docker

1. **Build the production image**
   ```bash
   docker build -t habit-tracker .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Heroku Deployment

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL addon**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway Deployment

1. **Connect your GitHub repository**
2. **Add PostgreSQL service**
3. **Set environment variables**
4. **Deploy automatically on push**

## Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── utils/            # Server utilities
│   └── database.js       # Database configuration
├── docker-compose.yml    # Production compose
├── docker-compose.dev.yml # Development compose
└── Dockerfile           # Production container
```

### Adding New Features

1. **Backend**: Add routes in `server/routes/`
2. **Frontend**: Add pages in `client/src/pages/`
3. **Database**: Update schema in `server/database.js`
4. **API**: Add service calls in `client/src/services/api.js`

### Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client && npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For support, email your-email@example.com or create an issue in the GitHub repository.

---

Happy habit tracking! 🚀