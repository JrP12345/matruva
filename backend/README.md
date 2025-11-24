# MATRUVA Backend

Express.js API with TypeScript, MongoDB, JWT authentication, and Razorpay integration.

## Features

- RESTful API with Express.js
- MongoDB with Mongoose ODM
- JWT authentication (RS256 asymmetric encryption)
- Role-based access control (RBAC)
- Razorpay payment integration
- Order and product management
- Admin audit logs
- Comprehensive test suite

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your MongoDB URI and Razorpay keys

# Generate JWT keys
npm run generate-keys

# Seed super admin and roles
npm run seed

# Start development server
npm run dev
```

**Server runs on:** http://localhost:3001  
**Default Super Admin:** owner@example.com / VeryStrongPassword!

## Environment Variables

Create `.env` file (see `.env.example`):

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

# JWT (paths to generated keys)
JWT_ACCESS_PRIVATE_KEY=./keys/access-private.pem
JWT_ACCESS_PUBLIC_KEY=./keys/access-public.pem
JWT_REFRESH_PRIVATE_KEY=./keys/refresh-private.pem
JWT_REFRESH_PUBLIC_KEY=./keys/refresh-public.pem

# Super Admin (for seeding)
SUPERADMIN_EMAIL=owner@example.com
SUPERADMIN_PASSWORD=VeryStrongPassword!
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with tsx |
| `npm run generate-keys` | Generate RSA key pairs for JWT |
| `npm run seed` | Seed super admin and roles |
| `npm run verify-jwks` | Verify JWKS implementation |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |

**Note:** All scripts use Node's built-in `--env-file` flag (no dotenv dependency).

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration and key store
│   ├── controllers/      # Route handlers
│   │   ├── auth.ts       # Authentication
│   │   ├── orders.ts     # Order management
│   │   ├── products.ts   # Product CRUD
│   │   └── admin*.ts     # Admin endpoints
│   ├── helpers/          # JWT, permissions, audit
│   ├── middleware/       # Auth middleware
│   ├── models/           # Mongoose models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Role.ts
│   │   └── Permission.ts
│   ├── routes/           # API routes
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── payments.ts
│   │   ├── admin.ts
│   │   └── jwks.ts
│   ├── scripts/          # Setup scripts
│   └── app.ts            # Express app
├── test/                 # Jest tests
├── keys/                 # RSA key pairs (gitignored)
└── .env                  # Environment variables (gitignored)
```

## API Endpoints

### Public
- `GET  /.well-known/jwks.json` - JWKS public keys
- `GET  /v1/products` - List products (paginated)
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
- `POST /v1/admin/users` - Create user
- `GET  /v1/admin/roles` - List roles
- `POST /v1/admin/roles` - Create role
- `GET  /v1/admin/permissions` - List permissions
- `GET  /v1/admin/orders` - List all orders
- `GET  /v1/admin/orders/:id` - Get any order
- `GET  /v1/admin/products` - List all products (admin view)
- `POST /v1/admin/products` - Create product
- `PATCH /v1/admin/products/:id` - Update product
- `DELETE /v1/admin/products/:id` - Delete product

Full API documentation: See [ADMIN_API.md](./ADMIN_API.md)

## Database Models

### User
- Authentication and profile
- Role assignment
- Password hashing with bcrypt

### Role
- Name and permissions
- Inheritance support

### Permission
- Resource and action
- Wildcard support (`products:*`)

### Product
- Details, pricing, stock
- Image URLs
- Status (active, draft, archived)

### Order
- Items snapshot (prevent price changes)
- Shipping and billing info
- Payment details
- Status tracking

### AdminActionLog
- Actor, action, target
- Metadata and timestamp

## Authentication

### JWT Tokens
- **Access Token:** Short-lived (15m), stored in memory
- **Refresh Token:** Long-lived (30d), HttpOnly cookie
- **Algorithm:** RS256 (asymmetric encryption)
- **JWKS:** Public keys at `/.well-known/jwks.json`

### RBAC System
- Roles have permissions
- Permissions use `resource:action` format
- Wildcard support: `products:*`, `*:read`
- Permission checking via `userHasPermission` helper

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

Test coverage includes:
- Authentication endpoints
- Admin user management
- Admin role management
- Admin permission management
- Dashboard and audit logs
- JWKS endpoint
- Order management

## Razorpay Integration

### Setup
1. Get test keys from https://dashboard.razorpay.com
2. Add to `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   RAZORPAY_WEBHOOK_SECRET=webhook_secret
   ```

### Test Cards
- **Success:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **OTP:** Any 6 digits

### Webhook
- Endpoint: `POST /v1/payments/webhook`
- Verifies signature
- Updates order status
- Requires `RAZORPAY_WEBHOOK_SECRET`

## Security

- RS256 JWT (asymmetric encryption)
- HttpOnly cookies for refresh tokens
- CSRF protection (X-Auth-Refresh header)
- Password hashing (bcrypt, 12 rounds)
- RBAC with granular permissions
- Input validation
- Rate limiting
- Helmet.js security headers

## Deployment

### Production Setup
1. Set production environment variables
2. Generate production JWT keys
3. Use MongoDB Atlas or production MongoDB
4. Switch to Razorpay live keys
5. Configure CORS for production domain
6. Set secure cookie settings (sameSite: 'none', secure: true)
7. Configure webhook URL in Razorpay dashboard

### Build and Start
```bash
npm run build
npm start
```

## License

MIT

---

**API Documentation:** [ADMIN_API.md](./ADMIN_API.md)  
**Main README:** [../README.md](../README.md)  
**Frontend README:** [../frontend/README.md](../frontend/README.md)
