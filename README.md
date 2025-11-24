# MATRUVA E-Commerce Platform

Full-stack e-commerce platform with Next.js 16, Express, MongoDB, and Razorpay.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Express.js, TypeScript, MongoDB, Mongoose
- **Payment:** Razorpay (UPI, Cards, NetBanking, Wallets)
- **Auth:** JWT (RS256 asymmetric), RBAC, HttpOnly refresh tokens

## Features

### Customer Features

- Product catalog with search, filters, and sorting
- Shopping cart with localStorage persistence
- Razorpay payment integration (all payment methods)
- Order history and tracking
- JWT-based authentication
- Dark/light theme toggle
- Responsive design (mobile-first)
- Full-width auto-playing carousel

### Admin Features

- Dashboard with analytics
- Product management (CRUD operations)
- Order management (view, update status)
- User and role management (RBAC)
- Permission system with wildcard support
- Audit logs for all admin actions
- Context-aware navigation

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Razorpay account (https://dashboard.razorpay.com)

### 1. Clone Repository

```bash
git clone https://github.com/JrP12345/matruva.git
cd matruva
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and Razorpay keys

# Generate JWT RSA keys
npm run generate-keys

# Seed database with roles and super admin
npm run seed

# Start backend server
npm run dev
```

Backend runs on: http://localhost:3001  
Default super admin: `owner@example.com` / `VeryStrongPassword!`

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Copy and configure environment
cp .env.local.example .env.local
# Edit .env.local with API URL and Razorpay key

# Start frontend dev server
npm run dev
```

Frontend runs on: http://localhost:3000

### 4. Test Payment

Use Razorpay test cards:

- **Card:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **OTP:** Any 6 digits

## Project Structure

```
matruva/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/          # Configuration and KeyStore
│   │   ├── controllers/     # Route handlers
│   │   ├── helpers/         # JWT, permissions, audit
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Setup and seed scripts
│   │   └── app.ts           # Express app entry
│   ├── test/                # Jest tests
│   ├── keys/                # RSA key pairs (gitignored)
│   └── .env                 # Environment variables (gitignored)
│
├── frontend/                # Next.js app
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   │   └── ui/          # 40+ reusable UI components
│   │   ├── contexts/        # Auth, Cart, Theme contexts
│   │   ├── examples/        # Component examples
│   │   └── lib/             # Utilities and icons
│   ├── public/              # Static assets
│   └── .env.local           # Environment variables (gitignored)
│
└── README.md                # This file
```

## Documentation

- **Root README:** [README.md](./README.md) (this file)
- **Backend README:** [backend/README.md](./backend/README.md)
- **Frontend README:** [frontend/README.md](./frontend/README.md)
- **Admin API:** [backend/ADMIN_API.md](./backend/ADMIN_API.md)

## Environment Variables

### Backend (`.env`)

```env
# Database
DATABASE_URI=mongodb://localhost:27017/matruva

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=webhook_secret

# Server
PORT=3001
NODE_ENV=development

# JWT Keys
JWT_ACCESS_PRIVATE_KEY=./keys/access-private.pem
JWT_ACCESS_PUBLIC_KEY=./keys/access-public.pem
JWT_REFRESH_PRIVATE_KEY=./keys/refresh-private.pem
JWT_REFRESH_PUBLIC_KEY=./keys/refresh-public.pem

# Super Admin (for seeding)
SUPERADMIN_EMAIL=owner@example.com
SUPERADMIN_PASSWORD=VeryStrongPassword!
```

### Frontend (`.env.local`)

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Razorpay Key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

## Available Scripts

### Backend

```bash
npm run dev              # Start development server
npm run generate-keys    # Generate RSA key pairs for JWT
npm run seed             # Seed super admin and roles
npm run verify-jwks      # Verify JWKS implementation
npm test                 # Run Jest tests
```

### Frontend

```bash
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

## API Endpoints

### Public

- `GET  /.well-known/jwks.json` - JWKS public keys
- `GET  /v1/products` - List products
- `GET  /v1/products/:id` - Get product details

### Authentication

- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout
- `GET  /v1/auth/me` - Get current user with permissions

### Orders

- `POST /v1/orders` - Create order
- `GET  /v1/orders` - List user's orders
- `GET  /v1/orders/:id` - Get order details

### Payments

- `POST /v1/payments/create` - Create Razorpay order
- `POST /v1/payments/verify` - Verify payment
- `POST /v1/payments/webhook` - Razorpay webhook

### Admin (RBAC Protected)

- `GET  /v1/admin/dashboard` - Dashboard stats
- `GET  /v1/admin/audit` - Audit logs
- `GET  /v1/admin/users` - List users
- `GET  /v1/admin/roles` - List roles
- `GET  /v1/admin/permissions` - List permissions
- `GET  /v1/admin/orders` - List all orders
- `GET  /v1/admin/products` - List all products
- `POST /v1/admin/products` - Create product
- `PATCH /v1/admin/products/:id` - Update product
- `DELETE /v1/admin/products/:id` - Delete product

Full API documentation: [backend/ADMIN_API.md](./backend/ADMIN_API.md)

## Key Technologies

### Authentication

- **JWT Tokens:** RS256 asymmetric encryption
- **Access Token:** 15 minutes, stored in memory
- **Refresh Token:** 30 days, HttpOnly cookie
- **JWKS Endpoint:** Public keys for token verification
- **CSRF Protection:** Custom header for refresh endpoint

### Authorization

- **RBAC:** Role-based access control
- **Permissions:** `resource:action` format (e.g., `products:create`)
- **Wildcards:** `products:*`, `*:read`, `*` (super admin)
- **Audit Logs:** All admin actions tracked

### Payment Integration

- **Provider:** Razorpay
- **Methods:** UPI, Cards, NetBanking, Wallets
- **Webhook:** Automatic order status updates
- **Security:** Signature verification

### Frontend Architecture

- **App Router:** Next.js 16 with Server Components
- **State Management:** React Context (Auth, Cart, Theme)
- **Styling:** Tailwind CSS 4 with custom theme
- **Components:** 40+ reusable UI components
- **Loading States:** Prevents flash on refresh
- **Responsive:** Mobile-first design

## Deployment Checklist

- [ ] Set production MongoDB URI (MongoDB Atlas)
- [ ] Generate new JWT keys for production
- [ ] Switch to Razorpay live keys
- [ ] Update CORS settings for production domain
- [ ] Set secure cookie flags (`sameSite: 'none'`, `secure: true`)
- [ ] Configure Razorpay webhook URL
- [ ] Set `NODE_ENV=production`
- [ ] Build frontend (`npm run build`)
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Enable rate limiting
- [ ] Set up SSL certificates
- [ ] Configure backup strategy
- [ ] Set up monitoring (logs, errors)

## Testing

### Backend

```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm test -- --coverage      # With coverage
```

Test coverage includes:

- Authentication endpoints
- Admin CRUD operations
- RBAC and permissions
- Order management
- JWKS endpoint

## Security Features

- RS256 JWT (asymmetric encryption)
- HttpOnly cookies for refresh tokens
- CSRF protection
- Password hashing (bcrypt, 12 rounds)
- RBAC with granular permissions
- Input validation
- Helmet.js security headers
- Rate limiting (planned)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For issues and questions:

- Open an issue on GitHub
- Email: support@example.com

---

**Built with ❤️ using Next.js, Express, and MongoDB**
