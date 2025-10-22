# Cris's Organic Store - E-Commerce Platform

A full-stack e-commerce platform for selling organic barley powder products with comprehensive client-facing features and merchant console capabilities.

## 🌟 Features Overview

### Customer-Facing Pages

#### 1. **Home Page** (`/`)
- Hero section with compelling value proposition
- Feature highlights (100% Organic, Fast Shipping, Quality Assured, Customer Loved)
- Featured products showcase
- Customer testimonials section
- Call-to-action sections
- Responsive footer with links

#### 2. **Products Catalog** (`/products`)
- Grid/list view of all barley powder products
- Advanced filtering (search, price range, sorting)
- Sorting options (newest, price, rating)
- Pagination support
- Stock status display
- Quick add-to-cart functionality

#### 3. **Product Detail** (`/products/:id`)
- High-quality product images with zoom capability
- Comprehensive product information
- Pricing and stock status
- Quantity selector
- Add to cart functionality
- Add to wishlist button
- Nutritional information display
- Customer reviews section
- Review submission form
- Related products recommendations

#### 4. **Shopping Cart** (`/cart`)
- Item list with images, names, and prices
- Quantity adjustment controls
- Remove item functionality
- Promo code validation and application
- Order summary with:
  - Subtotal calculation
  - Tax calculation (10%)
  - Shipping cost (free over $50)
  - Discount application
  - Total price
- Proceed to checkout button

#### 5. **Checkout** (`/checkout`)
Multi-step checkout process:
- **Step 1: Shipping Address**
  - First/Last name
  - Street address
  - City, State, ZIP code
  - Country selection
  
- **Step 2: Payment Method**
  - Credit Card (Stripe integration ready)
  - PayPal integration ready
  - Apple Pay integration ready
  
- **Step 3: Order Review**
  - Review all order details
  - Confirm shipping address
  - Verify payment method
  - Final order summary

#### 6. **Orders Dashboard** (`/orders`)
- Order history with status indicators
- Order details (items, pricing, shipping address)
- Order status tracking (pending, processing, shipped, delivered)
- Track order functionality
- Reorder quick action
- Detailed order information

#### 7. **Blog & Resources** (`/blog`)
- Article listing with search functionality
- Category filtering (Health Benefits, Recipes, Nutrition, Wellness, How-To)
- Article cards with images, titles, and excerpts
- Responsive grid layout
- Read more functionality
- Educational content hub

#### 8. **Contact Page** (`/contact`)
- Contact form with validation
- Contact information cards (Email, Phone, Address)
- FAQ section with common questions
- Live chat support integration
- Customer support information
- Business hours display

#### 9. **Authentication** (`/auth`, `/login`, `/register`)
- Secure login form
- User registration form
- Social login options (Google, Facebook)
- Password reset functionality
- Remember me option
- Session management via Manus OAuth

### Merchant Console

#### **Merchant Dashboard** (`/merchant`)
Comprehensive seller management interface with three main sections:

**Overview Tab:**
- Total revenue display
- Total orders count
- Total products count
- Key performance metrics

**Products Tab:**
- Add new products form
- Product listing with:
  - Product name and category
  - Pricing information
  - Stock status indicators
  - Edit functionality
  - Delete functionality
  - Low stock warnings

**Orders Tab:**
- Recent orders table
- Order ID and status
- Order amount
- Order date
- View order details
- Order management actions

## 🗄️ Database Schema

### Core Tables

1. **users** - User accounts and authentication
   - id, name, email, loginMethod, role, createdAt, lastSignedIn

2. **products** - Product catalog
   - id, name, description, price, stock, category, image, rating, reviewCount, nutritionInfo, createdAt, updatedAt

3. **reviews** - Product reviews
   - id, productId, userId, rating, comment, createdAt, updatedAt

4. **cart_items** - Shopping cart management
   - id, userId, productId, quantity, createdAt, updatedAt

5. **orders** - Order records
   - id, userId, orderNumber, status, subtotal, tax, shipping, discount, total, shippingAddress, billingAddress, paymentMethod, promoCode, createdAt, updatedAt

6. **order_items** - Order line items
   - id, orderId, productId, quantity, price, createdAt, updatedAt

7. **promo_codes** - Discount codes
   - id, code, description, discountType, discountValue, minPurchaseAmount, maxUsageCount, usageCount, expiresAt, createdAt, updatedAt

8. **blog_posts** - Blog articles
   - id, title, excerpt, content, category, image, author, createdAt, updatedAt

9. **contact_submissions** - Customer inquiries
   - id, name, email, subject, message, status, createdAt, updatedAt

10. **wishlist_items** - Favorite products
    - id, userId, productId, createdAt, updatedAt

11. **merchant_profiles** - Seller information
    - id, userId, storeName, description, logo, createdAt, updatedAt

12. **notifications** - User alerts
    - id, userId, title, content, read, createdAt, updatedAt

## 🔌 API Endpoints (tRPC Procedures)

### Products Router
- `products.list` - Get all products with filtering
- `products.getById` - Get product details
- `products.create` - Create new product (merchant)
- `products.update` - Update product (merchant)
- `products.delete` - Delete product (merchant)

### Cart Router
- `cart.getItems` - Get user's cart items
- `cart.addItem` - Add item to cart
- `cart.updateItem` - Update item quantity
- `cart.removeItem` - Remove item from cart
- `cart.clear` - Clear entire cart

### Orders Router
- `orders.list` - Get all orders (admin/merchant)
- `orders.create` - Create new order
- `orders.getById` - Get order details
- `orders.updateStatus` - Update order status

### Reviews Router
- `reviews.getByProduct` - Get product reviews
- `reviews.create` - Submit product review

### Promo Codes Router
- `promoCodes.validate` - Validate and apply promo code
- `promoCodes.list` - Get all promo codes (admin)

### Blog Router
- `blog.list` - Get blog posts
- `blog.getById` - Get post details
- `blog.create` - Create blog post (admin)

### Contact Router
- `contact.submit` - Submit contact form
- `contact.list` - Get submissions (admin)

### Wishlist Router
- `wishlist.getItems` - Get user's wishlist
- `wishlist.addItem` - Add to wishlist
- `wishlist.removeItem` - Remove from wishlist

### Notifications Router
- `notifications.getUnread` - Get unread notifications
- `notifications.markAsRead` - Mark notification as read

## 🎨 Design System

### Color Palette
- **Primary Green**: #16a34a (brand color for organic theme)
- **Light Green**: #dcfce7 (backgrounds)
- **Dark Gray**: #1f2937 (text)
- **Light Gray**: #f3f4f6 (backgrounds)
- **White**: #ffffff

### Typography
- **Headings**: Bold, large font sizes
- **Body Text**: Regular weight, readable line height
- **Buttons**: Semibold, rounded corners

### Components
- Built with shadcn/ui components
- Tailwind CSS for styling
- Responsive design (mobile-first)
- Accessibility-focused

## 🔐 Security Features

- **Authentication**: Manus OAuth integration
- **Session Management**: Secure session cookies
- **Role-Based Access Control**: User vs. Merchant vs. Admin roles
- **Protected Procedures**: tRPC protected procedures for sensitive operations
- **Input Validation**: Zod schema validation on all inputs
- **HTTPS**: Secure communication

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly buttons and inputs
- Optimized images for different screen sizes
- Responsive navigation

## 🚀 Deployment

The application is built with:
- **Frontend**: React 19 + Vite
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Manus OAuth
- **Styling**: Tailwind CSS 4 + shadcn/ui

### Environment Variables Required
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - OAuth application ID
- `OAUTH_SERVER_URL` - OAuth server URL
- `VITE_OAUTH_PORTAL_URL` - OAuth portal URL
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Logo URL

## 📊 Performance Considerations

- Lazy loading of product images
- Pagination for large product lists
- Optimized database queries
- Caching strategies for frequently accessed data
- Minified and bundled assets
- CDN-ready static assets

## 🔄 Future Enhancements

- Payment gateway integration (Stripe, PayPal, Apple Pay)
- Email notifications for orders
- Advanced analytics dashboard
- Inventory management system
- Customer loyalty program
- Multi-language support
- Advanced product recommendations
- Video product demonstrations
- Live chat support integration
- Mobile app version

## 📝 Notes

- All prices are stored in cents (multiply by 100)
- Timestamps use UTC
- Product images should be optimized before upload
- Review ratings are on a 1-5 scale
- Order statuses: pending, confirmed, processing, shipped, delivered, cancelled, refunded

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Platform**: Cris's Organic Store

