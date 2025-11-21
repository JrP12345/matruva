"use client";

import {
  Button,
  Input,
  TextArea,
  Select,
  Card,
  Container,
  Badge,
  ProductCard,
  SearchBar,
  CartItem,
  ThemeToggle,
  Navbar,
  Checkbox,
  RadioGroup,
  Combobox,
  MultiSelect,
  Modal,
  Breadcrumb,
  Pagination,
  Skeleton,
  SkeletonProductCard,
  Icons,
} from "@/components/ui";
import Table from "@/components/ui/Table";
import DataTable from "@/components/ui/DataTable";
import Spinner from "@/components/ui/Spinner";
import DatePicker from "@/components/ui/DatePicker";
import TimePicker from "@/components/ui/TimePicker";
import ColorPicker from "@/components/ui/ColorPicker";
import Carousel from "@/components/ui/Carousel";
import Form, { FormGroup, FormRow } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { useState, useEffect } from "react";

export default function Home() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCombobox, setSelectedCombobox] = useState("");
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [selectedRadio, setSelectedRadio] = useState("option1");

  // Expose toast to window for demo purposes
  useEffect(() => {
    (window as any).__showToast = showToast;
  }, [showToast]);

  // Sample data with enhanced ProductCard features
  const [favorites, setFavorites] = useState<string[]>(["1"]);

  const products = [
    {
      id: "1",
      name: "Premium Wireless Headphones",
      price: 199.99,
      originalPrice: 299.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop",
      ],
      badge: "Best Seller",
      badgeVariant: "hot" as const,
      rating: 4.5,
      reviews: 128,
      inStock: true,
      stockCount: 5,
      category: "Audio",
      isFavorite: favorites.includes("1"),
    },
    {
      id: "2",
      name: "Smart Watch Pro",
      price: 399.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop",
      ],
      badge: "New",
      badgeVariant: "new" as const,
      rating: 5,
      reviews: 89,
      inStock: true,
      stockCount: 15,
      category: "Wearables",
      isFavorite: favorites.includes("2"),
    },
    {
      id: "3",
      name: "Ultra HD Camera",
      price: 899.99,
      originalPrice: 1099.99,
      image:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
      ],
      badge: "Sale",
      badgeVariant: "sale" as const,
      rating: 4,
      reviews: 56,
      inStock: false,
      category: "Photography",
      isFavorite: favorites.includes("3"),
    },
  ];

  const cartItems = [
    {
      id: "1",
      name: "Premium Wireless Headphones",
      price: 199.99,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
      variant: "Black, Size M",
    },
  ];

  return (
    <>
      {/* Navbar */}
      <Navbar
        brandName="MATRUVA"
        navLinks={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop" },
          { name: "Categories", href: "/categories" },
          { name: "New", href: "/new", badge: "New" },
          { name: "Contact", href: "/contact" },
        ]}
        cartItemCount={2}
        onCartClick={() => alert("Cart clicked")}
        onSearch={(q) => console.log("Search:", q)}
        onLogoClick={() => console.log("Logo clicked")}
        sticky={true}
        transparent={false}
      />

      <div className="min-h-screen bg-[var(--background)] py-8 sm:py-12 lg:py-16 transition-colors duration-300">
        <Container size="xl">
          {/* Header */}
          <div className="mb-12 sm:mb-16 animate-fade-in">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Components", href: "/components" },
                { label: "Showcase" },
              ]}
              className="mb-6"
            />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-3 tracking-tight transition-colors duration-300">
              MATRUVA Design System
            </h1>
            <p className="text-base sm:text-lg text-[var(--foreground-secondary)] max-w-3xl transition-colors duration-300">
              Premium components crafted with Apple-inspired design principles •
              Tailwind v4 • Fully Responsive
            </p>
          </div>

          {/* Icons Showcase */}
          <Card
            variant="glass"
            padding="lg"
            className="mb-8 sm:mb-12 animate-slide-up"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-6 transition-colors duration-300">
              Icon Library (140+ Icons)
            </h2>
            <p className="text-[var(--foreground-secondary)] mb-6">
              E-commerce icons from Lucide React - All icons are imported from
              the centralized library
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-4">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.ShoppingCart className="w-6 h-6" />
                <span className="text-xs text-center">Cart</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.ShoppingBag className="w-6 h-6" />
                <span className="text-xs text-center">Bag</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Heart className="w-6 h-6" />
                <span className="text-xs text-center">Heart</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Star className="w-6 h-6" />
                <span className="text-xs text-center">Star</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Package className="w-6 h-6" />
                <span className="text-xs text-center">Package</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Truck className="w-6 h-6" />
                <span className="text-xs text-center">Truck</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.CreditCard className="w-6 h-6" />
                <span className="text-xs text-center">Card</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Tag className="w-6 h-6" />
                <span className="text-xs text-center">Tag</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Store className="w-6 h-6" />
                <span className="text-xs text-center">Store</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Gift className="w-6 h-6" />
                <span className="text-xs text-center">Gift</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.User className="w-6 h-6" />
                <span className="text-xs text-center">User</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Search className="w-6 h-6" />
                <span className="text-xs text-center">Search</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Filter className="w-6 h-6" />
                <span className="text-xs text-center">Filter</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Settings className="w-6 h-6" />
                <span className="text-xs text-center">Settings</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Bell className="w-6 h-6" />
                <span className="text-xs text-center">Bell</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Mail className="w-6 h-6" />
                <span className="text-xs text-center">Mail</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Phone className="w-6 h-6" />
                <span className="text-xs text-center">Phone</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.MapPin className="w-6 h-6" />
                <span className="text-xs text-center">Pin</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Home className="w-6 h-6" />
                <span className="text-xs text-center">Home</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Zap className="w-6 h-6" />
                <span className="text-xs text-center">Zap</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[var(--muted)] transition-all duration-300">
                <Icons.Home className="w-6 h-6" />
                <span className="text-xs text-center">Home</span>
              </div>
            </div>
          </Card>

          {/* Icon Usage Examples */}
          <Card
            variant="glass"
            padding="lg"
            className="mb-8 sm:mb-12 animate-slide-up"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4 transition-colors duration-300">
              Icon Usage Examples
            </h2>
            <p className="text-[var(--foreground-secondary)] mb-6">
              All components use centralized icons from{" "}
              <code className="px-2 py-1 bg-[var(--muted)] rounded">
                @/lib/icons
              </code>
            </p>

            <div className="space-y-6">
              {/* Direct Icon Usage */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Direct Icon Usage
                </h3>
                <div className="flex flex-wrap gap-4 p-4 bg-[var(--muted)] rounded-lg">
                  <Icons.ShoppingCart className="w-6 h-6 text-blue-500" />
                  <Icons.Heart className="w-6 h-6 text-red-500" />
                  <Icons.Star className="w-6 h-6 text-yellow-500" />
                  <Icons.CheckCircle className="w-6 h-6 text-green-500" />
                  <Icons.AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <code className="text-xs mt-2 block text-[var(--foreground-secondary)]">
                  {'<Icons.ShoppingCart className="w-6 h-6 text-blue-500" />'}
                </code>
              </div>

              {/* Inputs with Icons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Inputs with Icons (iconName prop)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Search..."
                    iconName="Search"
                    variant="glass"
                  />
                  <Input
                    placeholder="Email..."
                    iconName="Mail"
                    variant="glass"
                  />
                  <Input
                    placeholder="Password..."
                    type="password"
                    iconName="Lock"
                    variant="glass"
                  />
                </div>
              </div>

              {/* Buttons with Icons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Buttons with Icons
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    icon={<Icons.ShoppingCart className="w-4 h-4" />}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Icons.Heart className="w-4 h-4" />}
                  >
                    Favorite
                  </Button>
                  <Button
                    variant="ghost"
                    icon={<Icons.Share className="w-4 h-4" />}
                  >
                    Share
                  </Button>
                  <Button
                    variant="primary"
                    loading
                    loadingText="Processing..."
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Search Bar Section */}
          <Card
            variant="default"
            padding="lg"
            className="mb-8 sm:mb-12 animate-slide-up"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-6 transition-colors duration-300">
              Search Bar (with Icons)
            </h2>
            <SearchBar
              placeholder="Search for products..."
              onSearch={(query) => setSearchQuery(query)}
              variant="glass"
            />
            {searchQuery && (
              <p className="mt-2 text-sm text-[var(--foreground-secondary)] transition-colors duration-300">
                Searching for:{" "}
                <strong className="text-[var(--foreground)]">
                  {searchQuery}
                </strong>
              </p>
            )}
          </Card>

          {/* Buttons Section */}
          <Card
            variant="default"
            padding="lg"
            className="mb-8 sm:mb-12 animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-6 transition-colors duration-300">
              Buttons
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="glass">Glass Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="primary" size="sm">
                Small Button
              </Button>
              <Button variant="primary" size="lg">
                Large Button
              </Button>
              <Button variant="primary" loading>
                Loading...
              </Button>
            </div>
          </Card>

          {/* Input Fields Section */}
          <Card
            variant="default"
            padding="lg"
            className="mb-8 sm:mb-12 animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-6 transition-colors duration-300">
              Input Fields
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Search Input"
                placeholder="Search products..."
                variant="glass"
                iconName="Search"
              />
              <Input
                label="Email Input"
                placeholder="Enter your email..."
                variant="glass"
                iconName="Mail"
              />
              <Input
                label="User Input"
                placeholder="Username"
                variant="glass"
                iconName="User"
              />
              <Input
                label="Lock Input"
                placeholder="Password"
                type="password"
                variant="glass"
                iconName="Lock"
              />
              <Input
                label="Phone Input"
                placeholder="Phone number"
                variant="glass"
                iconName="Phone"
              />
              <Input
                label="Credit Card Input"
                placeholder="Card number"
                variant="glass"
                iconName="CreditCard"
              />
            </div>
            <div className="mt-6">
              <TextArea
                label="Text Area"
                placeholder="Enter your message..."
                variant="glass"
                rows={4}
              />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Select Category"
                variant="glass"
                icon="Package"
                options={[
                  { value: "", label: "Choose a category", icon: "Filter" },
                  {
                    value: "electronics",
                    label: "Electronics",
                    icon: "Laptop",
                  },
                  { value: "clothing", label: "Clothing", icon: "ShoppingBag" },
                  { value: "books", label: "Books", icon: "BookOpen" },
                ]}
              />
              <Select
                label="Select Store"
                variant="glass"
                icon="Store"
                options={[
                  { value: "", label: "Choose a store", icon: "MapPin" },
                  { value: "1", label: "New York", icon: "MapPin" },
                  { value: "2", label: "Los Angeles", icon: "MapPin" },
                  { value: "3", label: "Chicago", icon: "MapPin" },
                ]}
              />
            </div>
          </Card>

          {/* Badges Section */}
          <Card variant="glass" padding="lg" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Badges</h2>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="primary" size="sm">
                Small
              </Badge>
              <Badge variant="primary" size="lg">
                Large
              </Badge>
            </div>
          </Card>

          {/* Product Cards Section */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6 sm:mb-8">
              Product Cards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={(id) => alert(`Added product ${id} to cart!`)}
                  onQuickView={(id) => alert(`Quick view for product ${id}`)}
                  onFavoriteToggle={(id) => {
                    setFavorites((prev) =>
                      prev.includes(id)
                        ? prev.filter((fav) => fav !== id)
                        : [...prev, id]
                    );
                  }}
                  showQuickAdd={true}
                />
              ))}
            </div>
          </div>

          {/* Cart Items Section */}
          <Card variant="default" padding="lg" className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6">
              Cart Items
            </h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  {...item}
                  onQuantityChange={(id, quantity) =>
                    alert(`Changed quantity for ${id} to ${quantity}`)
                  }
                  onRemove={(id) => alert(`Removed item ${id}`)}
                />
              ))}
            </div>
          </Card>

          {/* Cards Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="default" padding="lg">
                <h3 className="text-xl font-bold mb-2">Default Card</h3>
                <p className="text-[var(--foreground-secondary)] transition-colors duration-300">
                  Standard card with border
                </p>
              </Card>
              <Card variant="glass" padding="lg" hover>
                <h3 className="text-xl font-bold mb-2">Glass Card</h3>
                <p className="text-[var(--foreground-secondary)] transition-colors duration-300">
                  Glassmorphism with hover effect
                </p>
              </Card>
              <Card variant="elevated" padding="lg">
                <h3 className="text-xl font-bold mb-2">Elevated Card</h3>
                <p className="text-[var(--foreground-secondary)] transition-colors duration-300">
                  Card with shadow elevation
                </p>
              </Card>
            </div>
          </div>

          {/* New Components Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Checkbox & Radio */}
            <Card variant="glass" padding="lg">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Checkbox & Radio
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Checkboxes</h3>
                  <div className="space-y-2">
                    <Checkbox label="Subscribe to newsletter" />
                    <Checkbox
                      label="Accept terms and conditions"
                      description="You must agree to continue"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Radio Group</h3>
                  <RadioGroup
                    name="shipping"
                    value={selectedRadio}
                    onChange={setSelectedRadio}
                    options={[
                      {
                        value: "option1",
                        label: "Standard Shipping",
                        description: "5-7 business days",
                      },
                      {
                        value: "option2",
                        label: "Express Shipping",
                        description: "2-3 business days",
                      },
                      {
                        value: "option3",
                        label: "Overnight",
                        description: "Next day delivery",
                      },
                    ]}
                  />
                </div>
              </div>
            </Card>

            {/* Combobox & MultiSelect */}
            <Card variant="glass" padding="lg">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Combobox & Multi-Select
              </h2>
              <div className="space-y-6">
                <Combobox
                  label="Select Country"
                  variant="glass"
                  icon="MapPin"
                  value={selectedCombobox}
                  onChange={setSelectedCombobox}
                  options={[
                    { value: "us", label: "United States", icon: "MapPin" },
                    { value: "uk", label: "United Kingdom", icon: "MapPin" },
                    { value: "ca", label: "Canada", icon: "MapPin" },
                    { value: "au", label: "Australia", icon: "MapPin" },
                    { value: "de", label: "Germany", icon: "MapPin" },
                  ]}
                />
                <MultiSelect
                  label="Select Categories"
                  variant="glass"
                  icon="Filter"
                  value={selectedMulti}
                  onChange={setSelectedMulti}
                  maxSelections={3}
                  options={[
                    {
                      value: "electronics",
                      label: "Electronics",
                      icon: "Laptop",
                    },
                    {
                      value: "clothing",
                      label: "Clothing",
                      icon: "ShoppingBag",
                    },
                    { value: "books", label: "Books", icon: "BookOpen" },
                    { value: "home", label: "Home & Garden", icon: "Home" },
                    { value: "sports", label: "Sports", icon: "Zap" },
                  ]}
                />
              </div>
            </Card>
          </div>

          {/* Pagination & Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <Card variant="glass" padding="lg">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Pagination
              </h2>
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
              />
            </Card>

            <Card variant="glass" padding="lg">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Loading Skeletons
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <SkeletonProductCard />
                <SkeletonProductCard />
              </div>
            </Card>
          </div>

          {/* New Components Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 sm:mb-12">
            {/* DataTable Demo */}
            <Card
              variant="glass"
              padding="lg"
              className="animate-slide-up lg:col-span-2"
              style={{ animationDelay: "300ms" }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6">
                Advanced Data Table
              </h2>
              <DataTable
                columns={[
                  { key: "id", header: "ID", sortable: true, width: "80px" },
                  { key: "name", header: "Product Name", sortable: true },
                  {
                    key: "status",
                    header: "Status",
                    sortable: true,
                    cell: (row) => (
                      <Badge
                        variant={
                          row.status === "Active"
                            ? "success"
                            : row.status === "Pending"
                            ? "warning"
                            : "default"
                        }
                      >
                        {row.status}
                      </Badge>
                    ),
                  },
                  { key: "category", header: "Category", sortable: true },
                  { key: "price", header: "Price", sortable: true },
                  { key: "stock", header: "Stock", sortable: true },
                ]}
                data={[
                  {
                    id: 1,
                    name: "Wireless Headphones",
                    status: "Active",
                    category: "Audio",
                    price: "$299",
                    stock: 45,
                  },
                  {
                    id: 2,
                    name: "Smart Watch Pro",
                    status: "Active",
                    category: "Wearables",
                    price: "$399",
                    stock: 23,
                  },
                  {
                    id: 3,
                    name: "Ultra HD Camera",
                    status: "Inactive",
                    category: "Photography",
                    price: "$899",
                    stock: 0,
                  },
                  {
                    id: 4,
                    name: "Bluetooth Speaker",
                    status: "Active",
                    category: "Audio",
                    price: "$149",
                    stock: 67,
                  },
                  {
                    id: 5,
                    name: "Laptop Stand",
                    status: "Pending",
                    category: "Accessories",
                    price: "$79",
                    stock: 12,
                  },
                  {
                    id: 6,
                    name: "USB-C Hub",
                    status: "Active",
                    category: "Accessories",
                    price: "$59",
                    stock: 89,
                  },
                  {
                    id: 7,
                    name: "Mechanical Keyboard",
                    status: "Active",
                    category: "Peripherals",
                    price: "$189",
                    stock: 34,
                  },
                  {
                    id: 8,
                    name: "Gaming Mouse",
                    status: "Active",
                    category: "Peripherals",
                    price: "$79",
                    stock: 56,
                  },
                  {
                    id: 9,
                    name: "Webcam 4K",
                    status: "Inactive",
                    category: "Photography",
                    price: "$199",
                    stock: 0,
                  },
                  {
                    id: 10,
                    name: "Desk Lamp LED",
                    status: "Active",
                    category: "Accessories",
                    price: "$45",
                    stock: 78,
                  },
                  {
                    id: 11,
                    name: "Phone Charger",
                    status: "Active",
                    category: "Accessories",
                    price: "$29",
                    stock: 120,
                  },
                  {
                    id: 12,
                    name: "Screen Protector",
                    status: "Pending",
                    category: "Accessories",
                    price: "$15",
                    stock: 5,
                  },
                ]}
                searchable
                selectable
                pagination
                pageSize={5}
                actions={[
                  {
                    label: "Bulk Edit",
                    icon: <Icons.Edit className="w-4 h-4" />,
                    variant: "secondary",
                    onClick: (rows) => {
                      const toast = (window as any).__showToast;
                      if (toast)
                        toast({
                          type: "info",
                          message: `Bulk editing ${rows.length} item(s)`,
                        });
                    },
                  },
                  {
                    label: "Bulk Delete",
                    icon: <Icons.Trash className="w-4 h-4" />,
                    variant: "danger",
                    onClick: (rows) => {
                      const toast = (window as any).__showToast;
                      if (toast)
                        toast({
                          type: "error",
                          message: `Bulk deleted ${rows.length} item(s)`,
                        });
                    },
                  },
                ]}
                rowActions={[
                  {
                    label: "View",
                    icon: <Icons.Eye className="w-4 h-4" />,
                    variant: "ghost",
                    onClick: (row) => {
                      const toast = (window as any).__showToast;
                      if (toast)
                        toast({ type: "info", message: `Viewing ${row.name}` });
                    },
                  },
                  {
                    label: "Edit",
                    icon: <Icons.Edit className="w-4 h-4" />,
                    variant: "ghost",
                    onClick: (row) => {
                      const toast = (window as any).__showToast;
                      if (toast)
                        toast({ type: "info", message: `Editing ${row.name}` });
                    },
                  },
                  {
                    label: "Delete",
                    icon: <Icons.Trash className="w-4 h-4" />,
                    variant: "ghost",
                    onClick: (row) => {
                      const toast = (window as any).__showToast;
                      if (toast)
                        toast({
                          type: "error",
                          message: `Deleted ${row.name}`,
                        });
                    },
                  },
                ]}
              />
            </Card>

            {/* Spinner Demo */}
            <Card
              variant="outlined"
              padding="lg"
              className="animate-slide-up"
              style={{ animationDelay: "320ms" }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6">
                Loading Spinner
              </h2>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-[var(--foreground-secondary)] transition-colors duration-300">
                    Small
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <span className="text-xs text-[var(--foreground-secondary)] transition-colors duration-300">
                    Medium
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-xs text-[var(--foreground-secondary)] transition-colors duration-300">
                    Large
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="xl" />
                  <span className="text-xs text-[var(--foreground-secondary)] transition-colors duration-300">
                    X-Large
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Date & Time Pickers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 sm:mb-12">
            <Card
              variant="glass"
              padding="lg"
              className="animate-slide-up"
              style={{ animationDelay: "340ms" }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6">
                Date Picker
              </h2>
              <DatePicker label="Select Date" placeholder="Choose a date..." />
            </Card>

            <Card
              variant="outlined"
              padding="lg"
              className="animate-slide-up"
              style={{ animationDelay: "360ms" }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6">
                Time Picker
              </h2>
              <TimePicker
                label="Select Time"
                placeholder="Choose a time..."
                format="12"
              />
            </Card>
          </div>

          {/* Color Picker */}
          <Card
            variant="glass"
            padding="lg"
            className="mb-8 sm:mb-12 animate-slide-up"
            style={{ animationDelay: "380ms" }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6">
              Color Picker
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPicker label="Primary Color" value="#3b82f6" />
              <ColorPicker label="Accent Color" value="#ec4899" />
            </div>
          </Card>

          {/* Carousel Demo */}
          <Card
            variant="outlined"
            padding="lg"
            className="mb-8 sm:mb-12 animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6">
              Image Carousel
            </h2>
            <Carousel
              autoPlay
              interval={3500}
              items={[
                <div
                  key="1"
                  className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex flex-col items-center justify-center text-white p-8"
                >
                  <div className="text-5xl mb-4">🚀</div>
                  <h3 className="text-3xl font-bold mb-2">Fast Performance</h3>
                  <p className="text-blue-100 text-lg">
                    Lightning-fast load times
                  </p>
                </div>,
                <div
                  key="2"
                  className="w-full h-full bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex flex-col items-center justify-center text-white p-8"
                >
                  <div className="text-5xl mb-4">🎨</div>
                  <h3 className="text-3xl font-bold mb-2">Beautiful Design</h3>
                  <p className="text-emerald-100 text-lg">
                    Apple-inspired aesthetics
                  </p>
                </div>,
                <div
                  key="3"
                  className="w-full h-full bg-gradient-to-br from-orange-500 via-pink-600 to-rose-600 flex flex-col items-center justify-center text-white p-8"
                >
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-3xl font-bold mb-2">Smooth Animations</h3>
                  <p className="text-orange-100 text-lg">
                    Buttery 60fps transitions
                  </p>
                </div>,
              ]}
            />
          </Card>

          {/* Form Demo */}
          <Card
            variant="glass"
            padding="lg"
            className="mb-8 sm:mb-12 animate-slide-up"
            style={{ animationDelay: "420ms" }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6">
              Form Components
            </h2>
            <Form
              onSubmit={(e) => {
                const toast = (window as any).__showToast;
                if (toast)
                  toast({
                    type: "success",
                    message: "Form submitted successfully!",
                  });
              }}
            >
              <FormRow columns={2}>
                <FormGroup>
                  <Input label="First Name" placeholder="John" />
                </FormGroup>
                <FormGroup>
                  <Input label="Last Name" placeholder="Doe" />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                />
              </FormGroup>
              <FormGroup>
                <TextArea
                  label="Message"
                  placeholder="Your message here..."
                  rows={4}
                />
              </FormGroup>
              <Button variant="primary" type="submit">
                Submit Form
              </Button>
            </Form>
          </Card>

          {/* Toast Demo */}
          <Card
            variant="outlined"
            padding="lg"
            className="mb-8 sm:mb-12 animate-slide-up"
            style={{ animationDelay: "440ms" }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6">
              Toast Notifications
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  const toast = (window as any).__showToast;
                  if (toast)
                    toast({
                      type: "success",
                      title: "Success!",
                      message: "Operation completed successfully",
                    });
                }}
              >
                Show Success
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const toast = (window as any).__showToast;
                  if (toast)
                    toast({
                      type: "error",
                      title: "Error!",
                      message: "Something went wrong",
                    });
                }}
              >
                Show Error
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const toast = (window as any).__showToast;
                  if (toast)
                    toast({
                      type: "warning",
                      title: "Warning!",
                      message: "Please check your inputs",
                    });
                }}
              >
                Show Warning
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const toast = (window as any).__showToast;
                  if (toast)
                    toast({
                      type: "info",
                      title: "Info",
                      message: "Here is some information",
                    });
                }}
              >
                Show Info
              </Button>
            </div>
          </Card>

          {/* Modal Demo */}
          <Card
            variant="glass"
            padding="lg"
            className="mb-12 animate-slide-up"
            style={{ animationDelay: "460ms" }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] transition-colors duration-300 mb-6">
              Modal Dialog
            </h2>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </Card>
        </Container>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-[var(--foreground-secondary)] transition-colors duration-300">
              This is a responsive modal with backdrop blur and smooth
              animations.
            </p>
            <Input
              label="Email"
              variant="glass"
              placeholder="Enter your email..."
            />
            <div className="flex gap-3">
              <Button variant="primary" fullWidth>
                Submit
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
