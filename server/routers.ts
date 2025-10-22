import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== PRODUCTS ====================
  products: router({
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
          search: z.string().optional(),
          category: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          featured: z.boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        return db.getProducts(input.limit, input.offset, {
          search: input.search,
          category: input.category,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          featured: input.featured,
        });
      }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        return product;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          shortDescription: z.string().optional(),
          price: z.number(),
          originalPrice: z.number().optional(),
          sku: z.string().optional(),
          image: z.string().optional(),
          images: z.array(z.string()).optional(),
          nutritionInfo: z.record(z.string(), z.any()).optional(),
          ingredients: z.string().optional(),
          weight: z.string().optional(),
          stock: z.number().default(0),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "merchant" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createProduct({
          id,
          ...input,
          price: Math.round(input.price * 100), // Convert to cents
          originalPrice: input.originalPrice ? Math.round(input.originalPrice * 100) : undefined,
          merchantId: ctx.user.role === "merchant" ? ctx.user.id : undefined,
        });

        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          updates: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (
          ctx.user.role === "merchant" &&
          product.merchantId !== ctx.user.id
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateProduct(input.id, input.updates);
        return { success: true };
      }),
  }),

  // ==================== REVIEWS ====================
  reviews: router({
    getByProduct: publicProcedure
      .input(
        z.object({
          productId: z.string(),
          limit: z.number().default(10),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return db.getProductReviews(input.productId, input.limit, input.offset);
      }),

    create: protectedProcedure
      .input(
        z.object({
          productId: z.string(),
          rating: z.number().min(1).max(5),
          title: z.string().optional(),
          content: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createReview({
          id,
          productId: input.productId,
          userId: ctx.user.id,
          rating: input.rating,
          title: input.title,
          content: input.content,
        });

        return { id };
      }),
  }),

  // ==================== CART ====================
  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);
      // Fetch product details for each item
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const product = await db.getProductById(item.productId);
          return { ...item, product };
        })
      );
      return enrichedItems;
    }),

    addItem: protectedProcedure
      .input(
        z.object({
          productId: z.string(),
          quantity: z.number().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.addToCart(ctx.user.id, input.productId, input.quantity);
        return { success: true };
      }),

    updateItem: protectedProcedure
      .input(
        z.object({
          cartItemId: z.string(),
          quantity: z.number().min(0),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.updateCartItem(input.cartItemId, input.quantity);
        return { success: true };
      }),

    removeItem: protectedProcedure
      .input(z.object({ cartItemId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await db.removeCartItem(input.cartItemId);
        return { success: true };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ==================== ORDERS ====================
  orders: router({
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input, ctx }) => {
        return db.getUserOrders(ctx.user.id, input.limit, input.offset);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrder(input.id);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),

    create: protectedProcedure
      .input(
        z.object({
          items: z.array(
            z.object({
              productId: z.string(),
              quantity: z.number(),
              price: z.number(),
            })
          ),
          shippingAddress: z.record(z.string(), z.any()),
          billingAddress: z.record(z.string(), z.any()).optional(),
          paymentMethod: z.string() as z.ZodType<"credit_card" | "paypal" | "apple_pay" | "bank_transfer">,
          promoCode: z.string().optional(),
          subtotal: z.number(),
          tax: z.number(),
          shipping: z.number(),
          discount: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const orderNumber = `ORD-${Date.now()}`;

        const total = input.subtotal + input.tax + input.shipping - input.discount;

        await db.createOrder({
          id: orderId,
          userId: ctx.user.id,
          orderNumber,
          subtotal: Math.round(input.subtotal * 100),
          tax: Math.round(input.tax * 100),
          shipping: Math.round(input.shipping * 100),
          discount: Math.round(input.discount * 100),
          total: Math.round(total * 100),
          shippingAddress: input.shippingAddress,
          billingAddress: input.billingAddress,
          paymentMethod: input.paymentMethod,
          promoCode: input.promoCode,
        });

        // Create order items
        const orderItems = input.items.map((item) => ({
          id: `oi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          orderId,
          productId: item.productId,
          productName: "", // Will be populated from product lookup
          quantity: item.quantity,
          price: Math.round(item.price * 100),
          subtotal: Math.round(item.price * item.quantity * 100),
        }));

        await db.createOrderItems(orderItems);

        // Clear cart
        await db.clearCart(ctx.user.id);

        return { orderId, orderNumber };
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.string() as z.ZodType<"pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded">,
        })
      )
      .mutation(async ({ input, ctx }) => {
        const order = await db.getOrder(input.id);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (ctx.user.role !== "admin" && order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateOrder(input.id, { status: input.status });
        return { success: true };
      }),
  }),

  // ==================== PROMO CODES ====================
  promoCodes: router({
    validate: publicProcedure
      .input(
        z.object({
          code: z.string(),
          purchaseAmount: z.number(),
        })
      )
      .query(async ({ input }) => {
        return db.validatePromoCode(input.code, Math.round(input.purchaseAmount * 100));
      }),
  }),

  // ==================== BLOG ====================
  blog: router({
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().default(10),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return db.getBlogPosts(input.limit, input.offset);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (!post) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return post;
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          slug: z.string(),
          excerpt: z.string().optional(),
          content: z.string(),
          image: z.string().optional(),
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
          published: z.boolean().default(false),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const id = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createBlogPost({
          id,
          ...input,
          author: ctx.user.name || "Admin",
        });

        return { id };
      }),
  }),

  // ==================== CONTACT ====================
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          subject: z.string(),
          message: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createContactSubmission({
          id,
          ...input,
        });

        return { id };
      }),

    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.getContactSubmissions(input.limit, input.offset);
      }),
  }),

  // ==================== WISHLIST ====================
  wishlist: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getWishlistItems(ctx.user.id);
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const product = await db.getProductById(item.productId);
          return { ...item, product };
        })
      );
      return enrichedItems;
    }),

    addItem: protectedProcedure
      .input(z.object({ productId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await db.addToWishlist(ctx.user.id, input.productId);
        return { success: true };
      }),

    removeItem: protectedProcedure
      .input(z.object({ productId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await db.removeFromWishlist(ctx.user.id, input.productId);
        return { success: true };
      }),
  }),

  // ==================== MERCHANT ====================
  merchant: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getMerchantProfile(ctx.user.id);
      return profile || null;
    }),

    createProfile: protectedProcedure
      .input(
        z.object({
          storeName: z.string(),
          storeDescription: z.string().optional(),
          logo: z.string().optional(),
          banner: z.string().optional(),
          phone: z.string().optional(),
          address: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = `merchant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.createMerchantProfile({
          id,
          userId: ctx.user.id,
          ...input,
        });

        return { id };
      }),

    updateProfile: protectedProcedure
      .input(z.object({ updates: z.record(z.string(), z.any()) }))
      .mutation(async ({ input, ctx }) => {
        await db.updateMerchantProfile(ctx.user.id, input.updates);
        return { success: true };
      }),

    getProducts: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "merchant" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await db.getProducts(100, 0);
      const merchantProducts = result.products.filter(
        (p) => p.merchantId === ctx.user.id || ctx.user.role === "admin"
      );
      return merchantProducts;
    }),
  }),

  // ==================== NOTIFICATIONS ====================
  notifications: router({
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input, ctx }) => {
        return db.getUserNotifications(ctx.user.id, input.limit, input.offset);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

