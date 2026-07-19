# TaskFlow - Full Stack Task Management Application

A complete full-stack sample application for testing AI code understanding and Graphify visualization. Built with React, Express.js, MongoDB, TypeScript, and Tailwind CSS.

## Project Structure

```
taskflow/
├── client/                 # Frontend (React + Vite)
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/           # API service functions
│   │   │   ├── auth.ts
│   │   │   ├── tasks.ts
│   │   │   └── index.ts
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TaskCard.tsx
│   │   ├── context/       # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   └── TasksContext.tsx
│   │   ├── hooks/         # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useTasks.ts
│   │   │   └── useForm.ts
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── TasksPage.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                # Backend (Express.js)
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   │   └── database.ts
│   │   ├── controllers/  # Route controllers
│   │   │   ├── authController.ts
│   │   │   └── taskController.ts
│   │   ├── middleware/   # Custom middleware
│   │   │   ├── errorHandler.ts
│   │   │   ├── validate.ts
│   │   │   └── authMiddleware.ts
│   │   ├── models/       # MongoDB models
│   │   │   ├── User.ts
│   │   │   └── Task.ts
│   │   ├── routes/       # Route definitions
│   │   │   ├── index.ts
│   │   │   ├── authRoutes.ts
│   │   │   └── taskRoutes.ts
│   │   ├── services/     # Business logic layer
│   │   │   ├── authService.ts
│   │   │   └── taskService.ts
│   │   ├── utils/        # Utility functions
│   │   │   ├── jwtUtils.ts
│   │   │   └── validators.ts
│   │   └── app.ts        # Express app setup
│   ├── .env.example
│   └── package.json
├── shared/               # Shared types and utilities
│   ├── src/
│   │   └── types/
│   │       ├── user.ts
│   │       └── task.ts
│   └── package.json
└── docs/                 # Documentation
    └── API.md
```

## Features

- **User Authentication**: Register, Login, JWT-based auth with refresh tokens
- **Task Management**: CRUD operations for tasks with status tracking
- **Dashboard**: Overview of total, completed, and pending tasks
- **Responsive UI**: Tailwind CSS styling with reusable components
- **Type Safety**: Full TypeScript implementation across frontend and backend

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd taskflow

# Install dependencies for both client and server
npm install
```

### Environment Setup

Create a `.env` file in the `server/` directory:

```bash
# Copy example env file
cp server/.env.example server/.env

# Edit with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/taskflow
# JWT_SECRET=your-secret-key
# PORT=5000
```

Create a `.env` file in the `client/` directory:

```bash
# Create client env file
touch client/.env

# Add API URL
# VITE_API_URL=http://localhost:5000/api
```

### Running the Application

Terminal 1 - Start Backend Server:

```bash
cd server
npm run dev
```

Terminal 2 - Start Frontend Client:

```bash
cd client
npm run dev
```

Open your browser to `http://localhost:5173` (or the port shown in Vite's terminal output).

## API Endpoints

See [docs/API.md](docs/API.md) for detailed endpoint documentation.

Quick reference:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/tasks` | Get all tasks (user only) |
| GET | `/api/tasks/:id` | Get task by ID |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

## Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Axios
- **Backend**: Express.js 4, MongoDB Mongoose 7, Bcrypt, JWT
- **Shared**: Custom type definitions for cross-repository consistency

## Architecture Notes

This project follows a clean architecture pattern:

- **Controllers** only handle HTTP requests/responses and delegate to services
- **Services** contain business logic and call models directly
- **Models** are pure MongoDB schemas with no external dependencies
- **Custom hooks** (`useAuth`, `useTasks`) centralize state management on the frontend
- **Context providers** enable global state without prop drilling

## License

MIT