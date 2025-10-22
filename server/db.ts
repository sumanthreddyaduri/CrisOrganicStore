import { eq, and, desc, like, gte, lte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  products,
  reviews,
  cartItems,
  orders,
  orderItems,
  promoCodes,
  blogPosts,
  contactSubmissions,
  wishlistItems,
  merchantProfiles,
  notifications,
  Product,
  Order,
  OrderItem,
  CartItem,
  Review,
  BlogPost,
  ContactSubmission,
  WishlistItem,
  MerchantProfile,
  Notification,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER OPERATIONS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "avatar"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== PRODUCT OPERATIONS ====================

export async function getProducts(
  limit = 20,
  offset = 0,
  filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return { products: [], total: 0 };

  const conditions: any[] = [eq(products.active, true)];

  if (filters?.search) {
    conditions.push(like(products.name, `%${filters.search}%`));
  }
  if (filters?.category) {
    conditions.push(eq(products.category, filters.category));
  }
  if (filters?.minPrice !== undefined) {
    conditions.push(gte(products.price, filters.minPrice));
  }
  if (filters?.maxPrice !== undefined) {
    conditions.push(lte(products.price, filters.maxPrice));
  }
  if (filters?.featured) {
    conditions.push(eq(products.featured, true));
  }

  const result = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset);
  return { products: result, total: result.length };
}

export async function getProductById(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(products).values(product);
}

export async function updateProduct(id: string, updates: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(products).set(updates).where(eq(products.id, id));
}

// ==================== REVIEW OPERATIONS ====================

export async function getProductReviews(productId: string, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return { reviews: [], total: 0 };

  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  return { reviews: result, total: result.length };
}

export async function createReview(review: typeof reviews.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(reviews).values(review);
}

// ==================== CART OPERATIONS ====================

export async function getCartItems(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(cartItems).values({
      id,
      userId,
      productId,
      quantity,
    });
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
  }
}

export async function removeCartItem(cartItemId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
}

export async function clearCart(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ==================== ORDER OPERATIONS ====================

export async function createOrder(order: typeof orders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(orders).values(order);
}

export async function getOrder(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return { orders: [], total: 0 };

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  return { orders: result, total: result.length };
}

export async function updateOrder(id: string, updates: Partial<typeof orders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(orders).set(updates).where(eq(orders.id, id));
}

export async function createOrderItems(items: typeof orderItems.$inferInsert[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(orderItems).values(items);
}

export async function getOrderItems(orderId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ==================== PROMO CODE OPERATIONS ====================

export async function getPromoCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(promoCodes)
    .where(and(eq(promoCodes.code, code), eq(promoCodes.active, true)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function validatePromoCode(code: string, purchaseAmount: number) {
  const promoCode = await getPromoCode(code);
  if (!promoCode) return { valid: false, error: "Invalid promo code" };

  if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
    return { valid: false, error: "Promo code has expired" };
  }

  if (promoCode.maxUses && promoCode.currentUses && promoCode.currentUses >= promoCode.maxUses) {
    return { valid: false, error: "Promo code usage limit reached" };
  }

  if (promoCode.minPurchase && purchaseAmount < promoCode.minPurchase) {
    return {
      valid: false,
      error: `Minimum purchase of ${(promoCode.minPurchase || 0) / 100} is required`,
    };
  }

  return { valid: true, promoCode };
}

export async function incrementPromoCodeUsage(codeId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const code = await db.select().from(promoCodes).where(eq(promoCodes.id, codeId)).limit(1);
  if (code.length > 0) {
    await db
      .update(promoCodes)
      .set({ currentUses: (code[0].currentUses || 0) + 1 })
      .where(eq(promoCodes.id, codeId));
  }
}

// ==================== BLOG OPERATIONS ====================

export async function getBlogPosts(limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };

  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.createdAt))
    .limit(limit)
    .offset(offset);

  return { posts: result, total: result.length };
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createBlogPost(post: typeof blogPosts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(blogPosts).values(post);
}

// ==================== CONTACT OPERATIONS ====================

export async function createContactSubmission(submission: typeof contactSubmissions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(contactSubmissions).values(submission);
}

export async function getContactSubmissions(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return { submissions: [], total: 0 };

  const result = await db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(limit)
    .offset(offset);

  return { submissions: result, total: result.length };
}

// ==================== WISHLIST OPERATIONS ====================

export async function getWishlistItems(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
}

export async function addToWishlist(userId: string, productId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(wishlistItems).values({ id, userId, productId });
}

export async function removeFromWishlist(userId: string, productId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
}

// ==================== MERCHANT OPERATIONS ====================

export async function getMerchantProfile(userId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(merchantProfiles)
    .where(eq(merchantProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createMerchantProfile(profile: typeof merchantProfiles.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(merchantProfiles).values(profile);
}

export async function updateMerchantProfile(
  userId: string,
  updates: Partial<typeof merchantProfiles.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(merchantProfiles).set(updates).where(eq(merchantProfiles.userId, userId));
}

// ==================== NOTIFICATION OPERATIONS ====================

export async function createNotification(notification: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notifications).values(notification);
}

export async function getUserNotifications(userId: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return { notifications: [], total: 0 };

  const result = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  return { notifications: result, total: result.length };
}

export async function markNotificationAsRead(notificationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
}

