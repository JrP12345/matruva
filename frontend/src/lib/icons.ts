/**
 * Centralized Icon Library
 *
 * All icons used across the application are exported from here.
 * Using Lucide React - a beautiful, consistent icon library.
 *
 * Usage:
 * import { Icons } from '@/lib/icons';
 * <Icons.ShoppingCart className="w-5 h-5" />
 */

import {
  // E-commerce Icons
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Heart,
  Star,
  StarHalf,
  Package,
  Truck,
  DollarSign,
  Tag,
  Gift,
  Percent,
  Receipt,
  Wallet,
  Store,
  Barcode,
  Laptop,
  Smartphone,
  Tablet,
  Watch,
  BookOpen,
  Book,
  Zap,

  // Navigation Icons
  Home,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,

  // User & Account Icons
  User,
  Users,
  UserPlus,
  UserCheck,
  LogIn,
  LogOut,
  Settings,
  Bell,
  BellRing,
  Mail,
  Phone,
  MapPin,

  // UI & Interaction Icons
  Search,
  Filter,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Edit,
  Edit2,
  Trash,
  Trash2,
  Plus,
  Minus,
  Check,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,

  // Media & Files
  Image,
  Upload,
  Download,
  File,
  FileText,
  Folder,
  Camera,
  Video,

  // Social & Sharing
  Share,
  Share2,
  Copy,
  Link,
  Link2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,

  // Actions & Controls
  Loader,
  Loader2,
  RefreshCw,
  RotateCw,
  Save,
  Send,
  Clock,
  Calendar,
  MapPinned,

  // Layout & View
  Grid,
  List,
  Columns,
  LayoutGrid,
  LayoutList,
  LayoutDashboard,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,

  // Status & Feedback
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessageSquare,

  // Theme
  Sun,
  Moon,
  Monitor,

  // Additional E-commerce
  Box,
  Boxes,
  Archive,
  Bookmark,
  Flag,
  Shield,
  Lock,
  Unlock,
  Key,

  // More useful icons
  MoreVertical,
  MoreHorizontal,
  Dot,
  Circle,
  Square,
  Triangle,
  type LucideIcon,
  Sparkle,
  Youtube,
} from "lucide-react";

// Export all icons in a single object
export const Icons = {
  // E-commerce
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Heart,
  Star,
  StarHalf,
  Package,
  Truck,
  DollarSign,
  Tag,
  Gift,
  Percent,
  Receipt,
  Wallet,
  Store,
  Barcode,
  Laptop,
  Smartphone,
  Tablet,
  Watch,
  BookOpen,
  Book,
  Zap,

  // Navigation
  Home,
  Menu,
  X,
  Close: X, // Alias
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,

  // User & Account
  User,
  Users,
  UserPlus,
  UserCheck,
  LogIn,
  LogOut,
  Settings,
  Bell,
  BellRing,
  Mail,
  Phone,
  MapPin,
  Location: MapPin, // Alias

  // UI & Interaction
  Search,
  Filter,
  SlidersHorizontal,
  Sliders: SlidersHorizontal, // Alias
  Eye,
  EyeOff,
  Edit,
  Edit2,
  Trash,
  Trash2,
  Delete: Trash2, // Alias
  Plus,
  Minus,
  Check,
  CheckCircle,
  CheckCircle2,
  Success: CheckCircle2, // Alias
  XCircle,
  Error: XCircle, // Alias
  AlertCircle,
  AlertTriangle,
  Warning: AlertTriangle, // Alias
  Info,
  HelpCircle,
  Help: HelpCircle, // Alias

  // Media & Files
  Image,
  Upload,
  Download,
  File,
  FileText,
  Folder,
  Camera,
  Video,

  // Social & Sharing
  Share,
  Share2,
  Copy,
  Link,
  Link2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,

  // Actions & Controls
  Loader,
  Loader2,
  Loading: Loader2, // Alias
  RefreshCw,
  Refresh: RefreshCw, // Alias
  RotateCw,
  Save,
  Send,
  Clock,
  Calendar,
  MapPinned,

  // Layout & View
  Grid,
  List,
  Columns,
  LayoutGrid,
  LayoutList,
  LayoutDashboard,
  Dashboard: LayoutDashboard, // Alias
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,

  // Status & Feedback
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessageSquare,
  Message: MessageCircle, // Alias

  // Theme
  Sun,
  Moon,
  Monitor,

  // Additional E-commerce
  Box,
  Boxes,
  Archive,
  Bookmark,
  Flag,
  Shield,
  Lock,
  Unlock,
  Key,

  // More
  MoreVertical,
  MoreHorizontal,
  More: MoreVertical, // Alias
  Dot,
  Circle,
  Square,
  Triangle,
  Sparkle,
} as const;

// Export the Icon type
export type Icon = LucideIcon;

// Default icon props for consistent styling
export const defaultIconProps = {
  size: 20,
  strokeWidth: 2,
  className: "transition-colors duration-300",
} as const;

// Icon size presets
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  "2xl": 32,
} as const;

// Helper function to get icon by name (useful for dynamic icons)
export const getIcon = (name: keyof typeof Icons): LucideIcon => {
  return Icons[name];
};

// Type for icon names
export type IconName = keyof typeof Icons;
