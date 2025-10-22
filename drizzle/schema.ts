import {
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  int,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with e-commerce specific fields.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "merchant", "admin"]).default("user").notNull(),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"), // URL to avatar image
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table for barley powder variants
 */
export const products = mysqlTable("products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  price: int("price").notNull(), // Stored in cents to avoid decimal issues
  originalPrice: int("originalPrice"), // For discounts
  sku: varchar("sku", { length: 100 }).unique(),
  category: varchar("category", { length: 100 }).default("barley-powder"),
  image: text("image"), // Primary product image URL
  images: json("images"), // JSON array of image URLs
  nutritionInfo: json("nutritionInfo"), // JSON object with nutritional data
  ingredients: text("ingredients"),
  weight: varchar("weight", { length: 50 }), // e.g., "500g", "1kg"
  stock: int("stock").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"), // Average rating
  reviewCount: int("reviewCount").default(0),
  featured: boolean("featured").default(false),
  active: boolean("active").default(true),
  merchantId: varchar("merchantId", { length: 64 }), // For merchant-specific products
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product reviews table
 */
export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("productId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  content: text("content"),
  verified: boolean("verified").default(false), // Verified purchase
  helpful: int("helpful").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Shopping cart items
 */
export const cartItems = mysqlTable("cartItems", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  addedAt: timestamp("addedAt").defaultNow(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders table
 */
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).unique(),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]).default("pending"),
  subtotal: int("subtotal").notNull(), // in cents
  tax: int("tax").default(0), // in cents
  shipping: int("shipping").default(0), // in cents
  discount: int("discount").default(0), // in cents
  total: int("total").notNull(), // in cents
  promoCode: varchar("promoCode", { length: 50 }),
  paymentMethod: mysqlEnum("paymentMethod", [
    "credit_card",
    "paypal",
    "apple_pay",
    "bank_transfer",
  ]),
  paymentStatus: mysqlEnum("paymentStatus", [
    "pending",
    "completed",
    "failed",
    "refunded",
  ]).default("pending"),
  shippingAddress: json("shippingAddress").notNull(), // JSON object with address details
  billingAddress: json("billingAddress"), // JSON object with address details
  notes: text("notes"),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items (line items in an order)
 */
export const orderItems = mysqlTable("orderItems", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  price: int("price").notNull(), // Price at time of purchase (in cents)
  subtotal: int("subtotal").notNull(), // quantity * price (in cents)
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Promo codes / Discount codes
 */
export const promoCodes = mysqlTable("promoCodes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  description: text("description"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: int("discountValue").notNull(), // Percentage (0-100) or fixed amount in cents
  minPurchase: int("minPurchase").default(0), // Minimum purchase amount in cents
  maxUses: int("maxUses"), // null = unlimited
  currentUses: int("currentUses").default(0),
  active: boolean("active").default(true),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;

/**
 * Blog posts / Articles
 */
export const blogPosts = mysqlTable("blogPosts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  excerpt: varchar("excerpt", { length: 500 }),
  content: text("content"),
  image: text("image"), // Featured image URL
  category: varchar("category", { length: 100 }),
  tags: json("tags"), // JSON array of tags
  author: varchar("author", { length: 255 }),
  published: boolean("published").default(false),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Contact form submissions
 */
export const contactSubmissions = mysqlTable("contactSubmissions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "responded", "closed"]).default("new"),
  response: text("response"),
  respondedBy: varchar("respondedBy", { length: 64 }),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

/**
 * Wishlist / Favorites
 */
export const wishlistItems = mysqlTable("wishlistItems", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  addedAt: timestamp("addedAt").defaultNow(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = typeof wishlistItems.$inferInsert;

/**
 * Merchant profile / Store information
 */
export const merchantProfiles = mysqlTable("merchantProfiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().unique(),
  storeName: varchar("storeName", { length: 255 }).notNull(),
  storeDescription: text("storeDescription"),
  logo: text("logo"),
  banner: text("banner"),
  phone: varchar("phone", { length: 20 }),
  address: json("address"), // JSON object with address details
  bankDetails: json("bankDetails"), // Encrypted or hashed
  verified: boolean("verified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalSales: int("totalSales").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type MerchantProfile = typeof merchantProfiles.$inferSelect;
export type InsertMerchantProfile = typeof merchantProfiles.$inferInsert;

/**
 * Notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  type: mysqlEnum("type", [
    "order_status",
    "promotion",
    "review_request",
    "system",
    "message",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  read: boolean("read").default(false),
  actionUrl: text("actionUrl"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

