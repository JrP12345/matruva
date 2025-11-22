# 🚀 MATRUVA - Full Stack E-Commerce Platform

**Modern, secure, production-ready platform with Next.js 16 + Express + MongoDB**

---

## 📋 Quick Links

- **Frontend Docs:** [`frontend/README.md`](./frontend/README.md)
- **Backend Docs:** [`backend/README.md`](./backend/README.md)
- **Testing Guide:** [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)

---

## 🎯 What is MATRUVA?

A modern full-stack e-commerce platform with:

- ✅ **Secure Authentication** - RS256 JWT + Refresh Token Rotation
- ✅ **Role-Based Access Control** - SUPER_ADMIN, ADMIN, USER roles
- ✅ **Admin Dashboard** - Stats, user management, audit logs
- ✅ **Modern UI** - Apple-inspired design system
- ✅ **Production Ready** - 123/123 backend tests passing
- ✅ **Type Safe** - Full TypeScript implementation

---

## 🏗️ Architecture

```
MATRUVA/
├── backend/          # Express.js API (Port 3001)
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation
│   │   └── helpers/      # Utilities
│   └── test/         # Jest tests (123 passing)
│
├── frontend/         # Next.js 16 App (Port 3000)
│   ├── src/
│   │   ├── app/          # Pages (App Router)
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React Context (Auth, Theme)
│   │   └── lib/          # Utilities, API client
│   └── public/       # Static assets
│
└── README.md         # This file
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** 6+ (running locally or Atlas)
- **npm** or **yarn**

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Environment Setup

**Backend** (`backend/.env`):

```env
PORT=3001
NODE_ENV=development
DATABASE_URI=mongodb://localhost:27017/matruva

# JWT Keys (auto-generated)
JWT_ACCESS_PRIVATE_KEY=./keys/access-private.pem
JWT_ACCESS_PUBLIC_KEY=./keys/access-public.pem
JWT_REFRESH_PRIVATE_KEY=./keys/refresh-private.pem
JWT_REFRESH_PUBLIC_KEY=./keys/refresh-public.pem
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES_DAYS=30

# Super Admin (for seeding)
SUPERADMIN_EMAIL=owner@example.com
SUPERADMIN_PASSWORD=VeryStrongPassword!
```

**Frontend** (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Generate JWT Keys & Seed Data

```bash
cd backend
npm run keys:generate
npm run seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

**Default Credentials:**

- Email: `owner@example.com`
- Password: `VeryStrongPassword!`

---

## 🔐 Authentication System

### Features

- ✅ **RS256 JWT** - Asymmetric key signing
- ✅ **Refresh Token Rotation** - Enhanced security
- ✅ **HttpOnly Cookies** - XSS protection
- ✅ **CSRF Protection** - X-Auth-Refresh header
- ✅ **Silent Authentication** - Seamless page reloads
- ✅ **Auto Token Refresh** - Transparent 401 handling
- ✅ **Request Queuing** - Prevents duplicate refreshes

### Auth Flow

```
1. Login → POST /v1/auth/login
   → Backend sets refresh_token cookie (HttpOnly)
   → Returns accessToken in JSON body
   → Frontend stores token in-memory only

2. Authenticated Requests
   → Add header: Authorization: Bearer <token>
   → Backend validates JWT

3. Token Expiry (401)
   → Auto-call POST /v1/auth/refresh
   → Get new accessToken
   → Retry original request

4. Page Reload
   → Call POST /v1/auth/refresh on mount
   → If valid → Stay logged in
   → If invalid → Redirect to login

5. Logout → POST /v1/auth/logout
   → Clear cookie + memory
   → Redirect to login
```

---

## 🎨 Design System

### Typography (Apple-Inspired)

- **Font:** SF Pro Display/Text style
- **Sizes:** 12px - 40px
- **Weights:** Light (300), Regular (400), Medium (500), Semibold (600)
- **Letter Spacing:** `-0.011em` (body), `-0.022em` (headings)
- **Line Height:** `1.47` (body), `1.2` (headings)

### Colors

- **Primary:** Blue (#3b82f6)
- **Success:** Green (#10b981)
- **Warning:** Amber (#f59e0b)
- **Error:** Red (#ef4444)
- **Info:** Sky (#0ea5e9)

### Components

- ✅ 30+ Reusable UI components
- ✅ Dark/Light theme support
- ✅ Smooth animations (60fps)
- ✅ Accessibility (ARIA, reduced motion)
- ✅ Responsive design (mobile-first)

---

## 📊 API Endpoints

### Public Routes

- `POST /v1/auth/login` - User login
- `POST /v1/auth/register` - User registration
- `GET /.well-known/jwks.json` - JWKS public keys
- `GET /health` - Health check

### Protected Routes (Auth Required)

- `GET /v1/auth/me` - Get current user
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout user

### Admin Routes (SUPER_ADMIN Role)

- `GET /v1/admin/dashboard` - Dashboard stats
- `GET /v1/admin/users` - List users
- `POST /v1/admin/users` - Create user
- `GET /v1/admin/roles` - List roles
- `GET /v1/admin/permissions` - List permissions
- `GET /v1/admin/audit` - Audit logs

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test          # Run all tests
npm test:watch    # Watch mode
npm test:coverage # Coverage report
```

**Status:** ✅ 123/123 tests passing

### Frontend Testing

```bash
cd frontend
npm run dev       # Manual testing
```

**Test Checklist:**

- ✅ Login with correct credentials
- ✅ Login with wrong credentials fails
- ✅ Page reload maintains session
- ✅ Token auto-refresh on 401
- ✅ Logout clears session
- ✅ Protected routes redirect
- ✅ Theme toggle works
- ✅ No console errors

---

## 📦 Tech Stack

### Frontend

- **Framework:** Next.js 16 (App Router)
- **React:** 19
- **TypeScript:** 5
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios
- **State Management:** React Context

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (RS256) + bcrypt
- **Testing:** Jest + Supertest
- **Validation:** Custom middleware

### DevOps

- **Package Manager:** npm
- **Dev Tools:** tsx (TypeScript execution)
- **Code Quality:** ESLint, Prettier (optional)
- **Version Control:** Git

---

## 🔧 Development

### Available Scripts

**Backend:**

```bash
npm run dev              # Start dev server
npm run keys:generate    # Generate JWT keys
npm run seed             # Seed database
npm test                 # Run tests
npm run jwks:verify      # Verify JWKS endpoint
```

**Frontend:**

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

---

## 🚀 Deployment

### Environment Variables

**Backend (Production):**

```env
NODE_ENV=production
PORT=3001
DATABASE_URI=mongodb+srv://user:pass@cluster.mongodb.net/matruva
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES_DAYS=30
```

**Frontend (Production):**

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Build Steps

```bash
# Backend
cd backend
npm install --production
npm run keys:generate  # If not committed
npm run seed          # Initial data

# Frontend
cd frontend
npm install
npm run build
npm run start
```

---

## 📁 Project Structure

### Backend

```
backend/
├── src/
│   ├── app.ts              # Express app entry
│   ├── controllers/        # Route handlers
│   │   ├── auth.ts         # Auth endpoints
│   │   └── admin*.ts       # Admin endpoints
│   ├── models/             # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Role.ts
│   │   └── Permission.ts
│   ├── routes/             # Route definitions
│   ├── middleware/         # Auth, validation
│   ├── helpers/            # Utilities
│   └── types/              # TypeScript types
├── test/                   # Jest tests
├── keys/                   # JWT keys (auto-generated)
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── app/                # Next.js pages
│   │   ├── login/
│   │   ├── admin/
│   │   └── globals.css
│   ├── components/         # UI components
│   │   ├── ui/             # Reusable components
│   │   └── ProtectedRoute.tsx
│   ├── contexts/           # React Context
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   └── lib/                # Utilities
│       ├── api.ts          # Axios client
│       ├── authToken.ts    # Token storage
│       └── constants.ts    # API endpoints
└── package.json
```

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check MongoDB is running
mongosh

# Regenerate JWT keys
cd backend
npm run keys:generate

# Check environment variables
cat .env
```

### Frontend Auth Issues

```bash
# Check API URL
cat frontend/.env.local

# Verify backend is running
curl http://localhost:3001/health

# Check browser console for errors
# Open DevTools → Console
```

### Database Connection Failed

```bash
# Local MongoDB
sudo systemctl start mongod

# Or Docker
docker run -d -p 27017:27017 mongo:6

# Or use MongoDB Atlas
# Update DATABASE_URI in .env
```

---

## 📚 Documentation

- **Backend API:** [`backend/README.md`](./backend/README.md)
- **Frontend Guide:** [`frontend/README.md`](./frontend/README.md)
- **Testing Guide:** [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and test
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

This project is private and proprietary.

---

## 👥 Team

- **Backend:** Express + MongoDB + JWT Auth
- **Frontend:** Next.js + React + TypeScript
- **Design:** Apple-inspired UI system
- **Security:** RS256 JWT + Refresh Rotation

---

## ✅ Project Status

**Current Version:** 1.0.0  
**Status:** ✅ Production Ready

- ✅ Backend: 123/123 tests passing
- ✅ Frontend: Fully implemented
- ✅ Auth: Complete with token rotation
- ✅ UI: Apple-inspired design system
- ✅ Docs: Comprehensive documentation

---

**Built with ❤️ using modern web technologies**
