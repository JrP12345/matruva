# MATRUVA Frontend

Modern e-commerce UI built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Features

- Next.js 16 with App Router and Turbopack
- React 19 with Server Components
- TypeScript for type safety
- Tailwind CSS 4 for styling
- 40+ reusable UI components
- Responsive design (mobile-first)
- Dark mode support
- JWT authentication
- Razorpay payment integration
- Shopping cart
- Order management
- Product browsing

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
# Edit .env.local with your API URL and Razorpay key

# Start development server
npm run dev
```

**Frontend runs on:** http://localhost:3000  
**Backend API:** http://localhost:3001

## Environment Variables

Create `.env.local` file (see `.env.local.example`):

```env
# API URL (backend server)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Razorpay Key (from https://dashboard.razorpay.com)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
frontend/
├── src/
│   ├── app/              # App Router pages
│   │   ├── layout.tsx    # Root layout (global navbar/footer)
│   │   ├── page.tsx      # Homepage
│   │   ├── products/     # Product pages
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout flow
│   │   ├── orders/       # Order history
│   │   └── admin/        # Admin dashboard
│   ├── components/       # React components
│   │   └── ui/           # 40+ reusable components
│   ├── contexts/         # React Context
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── ThemeContext.tsx
│   ├── examples/         # Component examples
│   ├── lib/              # Utilities
│   │   ├── utils.ts      # Helper functions
│   │   └── icons.ts      # Icon components
│   └── types/            # TypeScript types
├── public/               # Static assets
└── .env.local            # Environment variables (gitignored)
```

## UI Components

### Layout Components
- `Container` - Responsive container with size variants
- `Navbar` - Global navigation with auth state
- `Footer` - Footer with social links
- `Breadcrumb` - Navigation breadcrumbs

### Form Components
- `Input` - Text input with validation states
- `TextArea` - Multi-line text input
- `Select` - Dropdown select
- `Checkbox` - Checkbox input
- `RadioGroup` - Radio button group
- `Button` - Button with variants (primary, secondary, outline, ghost)
- `Form` - Form wrapper with validation

### Data Display
- `Card` - Content card with header/footer
- `Badge` - Status badges
- `ProductCard` - Product display card
- `CartItem` - Shopping cart item
- `DataTable` - Table with sorting and pagination
- `Table` - Basic table component
- `Pagination` - Page navigation

### Feedback
- `Toast` - Notification toasts
- `Modal` - Dialog/modal overlay
- `Spinner` - Loading spinner
- `Skeleton` - Loading placeholder
- `ErrorBoundary` - Error handling boundary

### Interactive
- `Carousel` - Image carousel (full-width responsive)
- `ColorPicker` - Color selection
- `DatePicker` - Date selection
- `TimePicker` - Time selection
- `Combobox` - Searchable select
- `MultiSelect` - Multiple selection
- `SearchBar` - Search input

### Navigation
- `ThemeToggle` - Dark/light mode toggle
- `Portal` - React portal utility

## Contexts

### AuthContext
- User authentication state
- Login/logout functions
- JWT token management (access + refresh)
- Loading states
- Prevents flash on refresh

### CartContext
- Shopping cart state
- Add/remove items
- Update quantities
- Cart persistence (localStorage)

### ThemeContext
- Dark/light mode
- Theme persistence
- System preference detection

## Key Features

### Authentication
- JWT-based authentication
- Access tokens (in-memory)
- Refresh tokens (HttpOnly cookies)
- Protected routes with redirects
- Automatic token refresh
- User profile management

### Shopping Experience
- Product browsing with filters
- Product details
- Shopping cart (persistent)
- Checkout flow
- Order confirmation
- Order history

### Payments
- Razorpay integration
- Secure payment flow
- Order status tracking
- Payment verification

### Admin Dashboard
- User management
- Role and permission management
- Product CRUD
- Order management
- Dashboard analytics
- Audit logs

### Responsive Design
- Mobile-first approach
- Tailwind breakpoints (sm, md, lg, xl)
- Touch-friendly controls
- Full-width carousel on mobile
- Persistent navbar/footer
- Optimized loading states

## Layouts

### Root Layout (`app/layout.tsx`)
Global layout with:
- PublicLayout wrapper (navbar + footer)
- AuthProvider
- CartProvider
- ThemeProvider
- Toast notifications

**No duplicate navbars** - Single navbar instance at root level.

### Loading States
- Initial loading: Full-screen overlay below navbar
- Page transitions: Skeleton screens
- Component loading: Spinner inside containers
- No flash on refresh: AuthContext starts with loading=true

## Styling

### Tailwind CSS 4
- Utility-first CSS
- Custom color palette
- Responsive breakpoints
- Dark mode support
- Component classes

### Theme Colors
- Primary: Brand colors
- Secondary: Accent colors
- Muted: Background colors
- Success/Error/Warning: Status colors

### Responsive Breakpoints
```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

## Best Practices

### Component Usage
```tsx
import { Button, Card, Input } from "@/components/ui";

<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>
    <Input label="Name" />
    <Button variant="primary">Submit</Button>
  </Card.Content>
</Card>
```

### Protected Routes
```tsx
// Automatic redirection if not authenticated
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}
```

### API Calls
```tsx
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/products`);
const data = await response.json();
```

### Cart Operations
```tsx
import { useCart } from "@/contexts/CartContext";

const { cart, addToCart, removeFromCart } = useCart();

addToCart(product, quantity);
removeFromCart(productId);
```

## Development

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Component modularity
- Reusable hooks
- Consistent naming conventions

### Performance
- Server Components by default
- Client Components only when needed
- Image optimization (next/image)
- Code splitting
- Lazy loading

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

## Deployment

### Production Build
```bash
# Build optimized bundle
npm run build

# Start production server
npm start
```

### Environment Setup
1. Set `NEXT_PUBLIC_API_URL` to production backend URL
2. Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` to live Razorpay key
3. Configure CORS on backend for production domain
4. Test payment flow with Razorpay live mode

### Deployment Platforms
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Custom server** (npm start)

### Build Output
```
.next/               # Next.js build output
.next/static/        # Static assets
.next/server/        # Server-side code
out/                 # Static export (if using)
```

## Troubleshooting

### Common Issues

**Issue:** Navbar flickering or duplicates  
**Solution:** Check that PublicLayout is only in root layout.tsx

**Issue:** Loading flash on refresh  
**Solution:** Verified - AuthContext starts with loading=true

**Issue:** Carousel not full width  
**Solution:** Already fixed - Removed Container wrapper, responsive margins

**Issue:** Environment variables not loading  
**Solution:** Restart dev server after changing .env.local

**Issue:** Payment not working  
**Solution:** Check Razorpay key is correct and test mode is enabled

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

---

**Main README:** [../README.md](../README.md)  
**Backend README:** [../backend/README.md](../backend/README.md)
