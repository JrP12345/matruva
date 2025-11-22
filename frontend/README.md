# 🎨 MATRUVA Frontend - Next.js Application

**Modern React application with Next.js 16, TypeScript, and Apple-inspired design system.**

---

## ✨ Features

- ✅ **Next.js 16** - Latest App Router with Turbopack
- ✅ **React 19** - Concurrent rendering + Server Components
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS 4** - Utility-first styling
- ✅ **JWT Authentication** - Silent auth + auto-refresh
- ✅ **Apple-Inspired Design** - SF Pro typography + smooth animations
- ✅ **30+ UI Components** - Fully reusable component library
- ✅ **Dark/Light Theme** - System preference + manual toggle
- ✅ **Protected Routes** - Permission-based access control
- ✅ **Responsive Design** - Mobile-first approach

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running (port 3001)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:3000
```

### Default Credentials

```
Email:    owner@example.com
Password: VeryStrongPassword!
```

---

## 📜 Available Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start development server (port 3000)  |
| `npm run build` | Build production bundle               |
| `npm start`     | Start production server               |
| `npm run lint`  | Run ESLint                            |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js pages (App Router)
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── admin/
│   │       └── dashboard/
│   │           └── page.tsx      # Admin dashboard
│   ├── components/
│   │   ├── ProtectedRoute.tsx    # Route guard component
│   │   └── ui/                   # Reusable UI components
│   │       ├── Badge.tsx
│   │       ├── Breadcrumb.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Carousel.tsx
│   │       ├── CartItem.tsx
│   │       ├── Checkbox.tsx
│   │       ├── ColorPicker.tsx
│   │       ├── Combobox.tsx
│   │       ├── Container.tsx
│   │       ├── DataTable.tsx
│   │       ├── DatePicker.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── Form.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── MultiSelect.tsx
│   │       ├── Navbar.tsx
│   │       ├── Pagination.tsx
│   │       ├── Portal.tsx
│   │       ├── ProductCard.tsx
│   │       ├── RadioGroup.tsx
│   │       ├── SearchBar.tsx
│   │       ├── Select.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Spinner.tsx
│   │       ├── Table.tsx
│   │       ├── TextArea.tsx
│   │       ├── ThemeToggle.tsx
│   │       ├── TimePicker.tsx
│   │       ├── Toast.tsx
│   │       └── index.ts          # Component exports
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Authentication state
│   │   └── ThemeContext.tsx      # Theme state
│   ├── lib/
│   │   ├── api.ts                # Axios client
│   │   ├── authToken.ts          # Token storage (in-memory)
│   │   ├── constants.ts          # API endpoints + config
│   │   ├── icons.ts              # Icon utilities
│   │   └── utils.ts              # Helper functions
│   └── examples/
│       ├── CheckoutFormExample.tsx
│       └── ProductListingExample.tsx
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json
```

---

## 🔐 Authentication

### How It Works

1. **Login**
   - User enters credentials
   - POST to `/v1/auth/login`
   - Backend sets `refresh_token` cookie (HttpOnly)
   - Frontend stores `accessToken` in-memory only
   - Redirect to dashboard

2. **Page Reload**
   - Frontend calls POST `/v1/auth/refresh` on mount
   - Backend validates refresh cookie
   - Returns new access token
   - User stays logged in (silent authentication)

3. **Token Expiry**
   - Access token expires (15 minutes)
   - API returns 401
   - Axios interceptor auto-refreshes token
   - Original request retried
   - User never notices

4. **Logout**
   - Call POST `/v1/auth/logout`
   - Clear cookies + in-memory token
   - Redirect to login

### Security Features

- ✅ **In-Memory Token Storage** - No localStorage/sessionStorage
- ✅ **HttpOnly Cookies** - Refresh token safe from XSS
- ✅ **CSRF Protection** - Custom `X-Auth-Refresh` header
- ✅ **Automatic Refresh** - Seamless token renewal
- ✅ **Request Queuing** - Prevents duplicate refresh calls
- ✅ **Silent Authentication** - Page reloads don't log out user

### Implementation Files

- **`lib/api.ts`** - Axios client with interceptors
- **`lib/authToken.ts`** - In-memory token storage
- **`lib/constants.ts`** - API endpoints
- **`contexts/AuthContext.tsx`** - Auth state management
- **`components/ProtectedRoute.tsx`** - Route guard

---

## 🎨 Design System

### Typography

**Font Stack:** SF Pro Display/Text style
```
-apple-system, BlinkMacSystemFont, "SF Pro Display", 
"SF Pro Text", "Helvetica Neue", "Segoe UI", Roboto, 
Arial, sans-serif
```

**Type Scale:**
| Size  | Weight         | Use Case          |
| ----- | -------------- | ----------------- |
| 40px  | 600 (Semibold) | Hero numbers      |
| 34px  | 600 (Semibold) | Page titles       |
| 24px  | 600 (Semibold) | Section headers   |
| 17px  | 400 (Regular)  | Body text         |
| 15px  | 400 (Regular)  | Secondary text    |
| 13px  | 300 (Light)    | Captions          |

**Font Weights:**
- Light (300) - Captions, metadata
- Regular (400) - Body text
- Medium (500) - Buttons, emphasis
- Semibold (600) - Headings, titles

**Letter Spacing:**
- `-0.022em` - Headings
- `-0.011em` - Body text
- `tracking-wide` - Captions

**Line Height:**
- `1.2` - Headings
- `1.47` - Body text

### Colors

**Semantic:**
- Primary: `#3b82f6` (blue-500)
- Success: `#10b981` (green-500)
- Warning: `#f59e0b` (amber-500)
- Error: `#ef4444` (red-500)
- Info: `#0ea5e9` (sky-500)

**Text:**
- Foreground: Primary text
- Foreground Secondary: Secondary text
- Foreground Tertiary: Tertiary text
- Foreground Muted: Disabled text

### Components

#### Core Components
- **Badge** - Status indicators
- **Button** - All button variants
- **Card** - Container component
- **Input** - Text inputs
- **Spinner** - Loading indicators
- **Table** - Data tables
- **Container** - Layout wrapper
- **Navbar** - Navigation bar

#### Form Components
- **Checkbox** - Checkboxes
- **RadioGroup** - Radio buttons
- **Select** - Dropdowns
- **TextArea** - Multi-line input
- **DatePicker** - Date selection
- **TimePicker** - Time selection
- **ColorPicker** - Color selection

#### Advanced Components
- **DataTable** - Sortable tables
- **Pagination** - Page navigation
- **Modal** - Dialog boxes
- **Toast** - Notifications
- **Breadcrumb** - Navigation breadcrumbs
- **SearchBar** - Search input
- **Carousel** - Image carousel

All components support:
- ✅ Dark/Light themes
- ✅ TypeScript
- ✅ Accessibility (ARIA)
- ✅ Responsive design
- ✅ Smooth animations

---

## 🎭 Loading States

### Spinner Component

```tsx
import { Spinner } from '@/components/ui';

<Spinner size="lg" variant="primary" />
```

**Sizes:** `sm` (16px), `md` (32px), `lg` (48px), `xl` (64px)  
**Variants:** `primary`, `white`, `gray`

### Usage Patterns

**Initial Auth Check:**
```tsx
if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <Spinner size="lg" variant="primary" />
        <p className="mt-4 text-[15px] text-[var(--foreground-secondary)]">
          Loading...
        </p>
      </div>
    </div>
  );
}
```

**Dashboard Loading:**
```tsx
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" variant="primary" />
    </div>
  );
}
```

---

## 🎬 Animations

### Built-in Animations

**Fade In:**
```tsx
<div className="animate-fade-in">
  {/* Content */}
</div>
```

**Slide Up:**
```tsx
<div className="animate-slide-up">
  {/* Content */}
</div>
```

**Scale In:**
```tsx
<div className="animate-scale-in">
  {/* Content */}
</div>
```

**Button Press:**
```tsx
<button className="active:scale-98 transition-transform">
  Click me
</button>
```

All animations use `cubic-bezier(0.25, 0.1, 0.25, 1)` for smooth, natural motion.

**Reduced Motion Support:**
- Animations respect `prefers-reduced-motion`
- Automatically disabled for users who prefer less motion

---

## 🛡️ Protected Routes

### Implementation

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboard() {
  return (
    <ProtectedRoute 
      requireAuth 
      requireRole="SUPER_ADMIN"
      fallback="/login"
    >
      {/* Protected content */}
    </ProtectedRoute>
  );
}
```

**Props:**
- `requireAuth` - Requires logged-in user
- `requireRole` - Requires specific role
- `requirePermission` - Requires specific permission
- `fallback` - Redirect URL if unauthorized

---

## 🌐 Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## 📱 Responsive Design

### Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Grid System

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Responsive grid items */}
</div>
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with correct credentials → Success
- [ ] Login with wrong credentials → Error message
- [ ] Page reload → User stays logged in
- [ ] Token expiry → Auto-refresh works
- [ ] Logout → Clears session
- [ ] Protected routes → Redirect if not authenticated
- [ ] Theme toggle → Works without logging out
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop

---

## 🐛 Troubleshooting

### Backend Not Connected
```bash
# Check backend is running
curl http://localhost:3001/health

# Start backend
cd ../backend
npm run dev
```

### Authentication Issues
```bash
# Clear browser cookies
# DevTools → Application → Cookies → Delete all

# Check API URL in .env.local
cat .env.local

# Verify backend CORS allows localhost:3000
```

### TypeScript Errors
```bash
# Restart TypeScript server
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 🚀 Deployment

### Build for Production

```bash
# Build optimized bundle
npm run build

# Test production build locally
npm start

# Deploy to Vercel (recommended)
vercel deploy
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 📚 Documentation

- **Main README:** [`../README.md`](../README.md) - Project overview
- **Backend Docs:** [`../backend/README.md`](../backend/README.md) - API documentation

---

## ✅ Status

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Framework:** Next.js 16.0.3  
**React:** 19  
**TypeScript:** 5

---

## 🎯 Key Features Implemented

- ✅ Secure JWT authentication
- ✅ Silent authentication on reload
- ✅ Automatic token refresh
- ✅ Protected routes with guards
- ✅ Admin dashboard with stats
- ✅ Apple-inspired UI design
- ✅ 30+ reusable components
- ✅ Dark/Light theme support
- ✅ Smooth animations
- ✅ Fully responsive
- ✅ TypeScript coverage
- ✅ No console errors
- ✅ Production ready

---

**Built with ❤️ using Next.js + React + TypeScript + Tailwind CSS**
