# MATRUVA Backend

E-commerce backend with advanced JWT authentication, role-based access control, and key rotation.

## Features

- **JWT Authentication** - RS256 with JWKS and key rotation
- **Role-Based Access Control** - Granular permissions system
- **Key Management** - Admin API for key lifecycle
- **Audit Logging** - Complete action tracking
- **Type-Safe** - Full TypeScript implementation

## Quick Setup

```bash
# Install dependencies
npm install

# Generate RSA keys
npm run generate-keys

# Seed database
npm run seed

# Start server
npm run dev
```

## Available Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start development server                 |
| `npm run seed`          | Seed database with roles and super admin |
| `npm run generate-keys` | Generate new RSA key pairs               |
| `npm run verify-jwks`   | Verify JWKS implementation               |
| `npm test`              | Run test suite                           |
| `npm run test:watch`    | Run tests in watch mode                  |

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration and key store
│   ├── controllers/      # Request handlers
│   ├── helpers/          # JWT and auth helpers
│   ├── middleware/       # Auth middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   │   ├── auth.ts       # Authentication endpoints
│   │   ├── jwks.ts       # JWKS endpoint
│   │   └── adminKeys.ts  # Key management API
│   ├── scripts/          # Utility scripts
│   └── tests/            # Test files
├── keys/                 # RSA key pairs (gitignored)
└── .env                  # Environment variables
```

## API Endpoints

### Public

- `GET /.well-known/jwks.json` - JWKS endpoint
- `GET /health` - Health check

### Authentication

- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `POST /v1/auth/refresh` - Refresh access token (requires X-Auth-Refresh: 1 header)
- `POST /v1/auth/logout` - Logout
- `GET /v1/auth/me` - Get current user with effective permissions ⭐ NEW

### Admin (SUPER_ADMIN only)

#### Dashboard & Monitoring

- `GET /v1/admin/dashboard` - System statistics and recent activity ⭐ NEW
- `GET /v1/admin/audit` - Query audit logs with filters and pagination ⭐ NEW

#### Role Management

- `GET /v1/admin/roles` - List all roles
- `GET /v1/admin/roles/:name` - Get role details
- `POST /v1/admin/roles` - Create new role
- `PATCH /v1/admin/roles/:name` - Update role (protected roles cannot be modified)
- `DELETE /v1/admin/roles/:name` - Delete role (protected roles cannot be deleted)

#### Permission Management

- `GET /v1/admin/permissions` - List all permissions
- `POST /v1/admin/permissions` - Create new permission
- `DELETE /v1/admin/permissions/:key` - Delete permission (protected permissions cannot be deleted)

#### User Management

- `GET /v1/admin/users` - List all users (with pagination)
- `GET /v1/admin/users/:id` - Get user details and permissions
- `PATCH /v1/admin/users/:id/role` - Assign role to user
- `PATCH /v1/admin/users/:id/permissions` - Add extra permissions to user
- `GET /v1/admin/users/:id/sessions` - View user's active sessions
- `DELETE /v1/admin/users/:id/sessions/:jti` - Revoke specific session
- `DELETE /v1/admin/users/:id/sessions` - Revoke all sessions for user

#### Key Management

- `GET /v1/admin/keys` - List all keys
- `POST /v1/admin/keys` - Add new key
- `PATCH /v1/admin/keys/:kid` - Update key status (activate/deactivate)
- `DELETE /v1/admin/keys/:kid` - Delete key

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URI=mongodb://localhost:27017/matruva

# JWT Keys
JWT_ACCESS_PRIVATE_KEY=./keys/access-private.pem
JWT_ACCESS_PUBLIC_KEY=./keys/access-public.pem
JWT_REFRESH_PRIVATE_KEY=./keys/refresh-private.pem
JWT_REFRESH_PUBLIC_KEY=./keys/refresh-public.pem

# Token Expiry
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES_DAYS=30

# Security
SALT_ROUNDS=12
REFRESH_COOKIE_NAME=refresh_token
REFRESH_COOKIE_PATH=/v1/auth

# Seed Super Admin
SUPERADMIN_EMAIL=owner@example.com
SUPERADMIN_PASSWORD=VeryStrongPassword!
```

## Security Features

- **RS256 Asymmetric Encryption** - Prevents token forgery
- **Key Rotation Support** - Zero-downtime key updates
- **JWKS Discovery** - Standard OAuth 2.0 endpoint
- **Audit Logging** - All admin actions tracked in AdminActionLog
- **Role-Based Access Control** - Fine-grained permissions system
- **Protected Roles/Permissions** - SUPER_ADMIN and system permissions cannot be deleted
- **Session Management** - View and revoke user sessions remotely
- **Rate Limiting** - DDoS protection
- **Helmet Security Headers** - XSS, clickjacking protection
- **CORS Configuration** - Cross-origin security
- **Refresh Token Rotation** - Enhanced session security

## How It Works

### JWT Authentication Flow

1. **Login**: User logs in with email/password

   - Server generates access token (15min) and refresh token (30 days)
   - Both tokens stored in httpOnly cookies
   - Access token has `kid` (key ID) in header

2. **API Requests**: Protected routes check cookies

   - Middleware reads `access_token` cookie
   - Verifies JWT using public key (looked up by `kid`)
   - Extracts user ID and role from token

3. **Token Refresh**: When access token expires

   - Client calls `/v1/auth/refresh` (uses refresh token cookie)
   - Server validates and rotates refresh token
   - Issues new access token
   - Both cookies updated

4. **JWKS Discovery**: External services can verify tokens

   - Public keys available at `/.well-known/jwks.json`
   - Keys identified by `kid` in token header
   - Standard OAuth 2.0 / OpenID format

5. **Key Rotation**: Admins can add new keys
   - Multiple keys active simultaneously (zero-downtime)
   - Old tokens still valid during transition
   - Deactivate old keys after grace period

### Admin Key Management

Super admins can manage cryptographic keys via API:

- Add new public keys for verification
- Activate/deactivate keys
- List all keys and their status
- All operations logged to audit trail

### Security

- **HttpOnly Cookies**: XSS protection, tokens not accessible to JS
- **RS256**: Asymmetric crypto prevents token forgery
- **Kid**: Each key has unique ID for rotation
- **Refresh Rotation**: New refresh token on each use
- **Token Hash**: Refresh tokens stored as bcrypt hash
- **Audit Log**: All admin actions tracked

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose
- **Authentication**: jsonwebtoken (RS256)
- **Testing**: Jest with ts-jest
- **Security**: helmet, bcrypt, rate-limit
- **Dev Tools**: tsx, ts-node

## License

ISC
