import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from "../trpc";
import { Prisma } from "@e3d/db";

// Input validation schemas
const productIdSchema = z.object({
  id: z.string().uuid(),
});

const productFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.number().int().optional(),
  brandId: z.number().int().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  has3DModel: z.boolean().optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(["name", "price", "createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.number().int().positive().optional().default(1),
  perPage: z.number().int().positive().min(1).max(100).optional().default(20),
});

const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  sku: z.string().min(3).max(64),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  brandId: z.number().int().optional(),
  categoryId: z.number().int().optional(),
  model3dId: z.string().uuid().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        altText: z.string().optional(),
        sortOrder: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
  isActive: z.boolean().optional().default(true),
});

const updateProductSchema = createProductSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  });

// Helper function to build product queries with filters
const buildProductQuery = (input: z.infer<typeof productFilterSchema>) => {
  const {
    search,
    categoryId,
    brandId,
    minPrice,
    maxPrice,
    has3DModel,
    inStock,
  } = input;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  // Text search
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  // Category filter
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Brand filter
  if (brandId) {
    where.brandId = brandId;
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  // 3D model filter
  if (has3DModel !== undefined) {
    where.model3dId = has3DModel ? { not: null } : null;
  }

  // Stock filter
  if (inStock !== undefined) {
    where.stock = inStock ? { gt: 0 } : { equals: 0 };
  }

  return where;
};

export const productsRouter = createTRPCRouter({
  // Get all products with filtering and pagination
  getProducts: publicProcedure
    .input(productFilterSchema)
    .query(async ({ ctx, input }) => {
      const { sortBy, sortOrder, page, perPage } = input;
      const skip = (page - 1) * perPage;
      const take = perPage;

      const where = buildProductQuery(input);

      // Build sort object
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Get products with pagination
      const [products, totalCount] = await Promise.all([
        ctx.prisma.product.findMany({
          where,
          include: {
            brand: {
              select: {
                id: true,
                name: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              orderBy: {
                sortOrder: "asc",
              },
              take: 5, // Limit to 5 images per product for performance
            },
            model3d: {
              select: {
                id: true,
                previewUrl: true,
                format: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
          orderBy,
          skip,
          take,
        }),
        ctx.prisma.product.count({ where }),
      ]);

      // Calculate average rating for each product
      const productsWithRatings = await Promise.all(
        products.map(async (product) => {
          // Get average rating if reviews exist
          let avgRating = null;
          if (product._count.reviews > 0) {
            const ratingsData = await ctx.prisma.review.aggregate({
              where: { productId: product.id },
              _avg: { rating: true },
            });
            avgRating = ratingsData._avg.rating;
          }

          // Transform product data
          return {
            ...product,
            has3DModel: !!product.model3dId,
            reviewCount: product._count.reviews,
            rating: avgRating,
            _count: undefined, // Remove _count from response
          };
        })
      );

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / perPage);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        products: productsWithRatings,
        pagination: {
          page,
          perPage,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      };
    }),

  // Get a single product by ID
  getProductById: publicProcedure
    .input(productIdSchema)
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
        include: {
          brand: true,
          category: true,
          images: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          model3d: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10, // Limit to 10 reviews initially
          },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Get average rating
      const ratingsData = await ctx.prisma.review.aggregate({
        where: { productId: input.id },
        _avg: { rating: true },
        _count: true,
      });

      // Get related products (same category)
      const relatedProducts = await ctx.prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id }, // Exclude current product
          isActive: true,
        },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
          model3d: {
            select: { id: true },
          },
        },
        take: 4, // Limit to 4 related products
      });

      return {
        ...product,
        has3DModel: !!product.model3dId,
        rating: ratingsData._avg.rating || null,
        reviewCount: ratingsData._count,
        relatedProducts: relatedProducts.map(p => ({
          ...p,
          has3DModel: !!p.model3dId,
        })),
      };
    }),

  // Create a new product (admin only)
  createProduct: adminProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      // Extract images to create them separately
      const { images, ...productData } = input;

      // Create the product
      const product = await ctx.prisma.product.create({
        data: {
          ...productData,
          // Create images if provided
          ...(images && images.length > 0
            ? {
                images: {
                  create: images,
                },
              }
            : {}),
        },
        include: {
          images: true,
          brand: true,
          category: true,
          model3d: true,
        },
      });

      return product;
    }),

  // Update an existing product (admin only)
  updateProduct: adminProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, images, ...updateData } = input;

      // Check if product exists
      const existingProduct = await ctx.prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Handle images update if provided
      if (images) {
        // Delete existing images first
        await ctx.prisma.productImage.deleteMany({
          where: { productId: id },
        });

        // Create new images
        await ctx.prisma.productImage.createMany({
          data: images.map(img => ({
            ...img,
            productId: id,
          })),
        });
      }

      // Update the product
      const updatedProduct = await ctx.prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          images: true,
          brand: true,
          category: true,
          model3d: true,
        },
      });

      return updatedProduct;
    }),

  // Delete a product (admin only)
  deleteProduct: adminProcedure
    .input(productIdSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if product exists
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Delete the product
      await ctx.prisma.product.delete({
        where: { id: input.id },
      });

      return { success: true, id: input.id };
    }),

  // Get product statistics (admin only)
  getProductStats: adminProcedure.query(async ({ ctx }) => {
    const [totalProducts, lowStockProducts, outOfStockProducts, productsWithModels] =
      await Promise.all([
        ctx.prisma.product.count(),
        ctx.prisma.product.count({
          where: {
            stock: { gt: 0, lte: 5 }, // Low stock threshold
          },
        }),
        ctx.prisma.product.count({
          where: {
            stock: 0,
          },
        }),
        ctx.prisma.product.count({
          where: {
            model3dId: { not: null },
          },
        }),
      ]);

    // Get top selling products
    const topSellingProducts = await ctx.prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // Get details for top selling products
    const topProducts = await Promise.all(
      topSellingProducts.map(async (item) => {
        const product = await ctx.prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            images: {
              take: 1,
              orderBy: { sortOrder: "asc" },
            },
          },
        });
        return {
          ...product,
          salesCount: item._sum.quantity,
        };
      })
    );

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      productsWithModels,
      productsWithout3DModels: totalProducts - productsWithModels,
      topSellingProducts: topProducts,
    };
  }),

  // Get featured products for homepage
  getFeaturedProducts: publicProcedure.query(async ({ ctx }) => {
    // Get products with 3D models, good stock, and sorted by newest
    const featuredProducts = await ctx.prisma.product.findMany({
      where: {
        isActive: true,
        model3dId: { not: null }, // Has 3D model
        stock: { gt: 0 }, // In stock
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 3,
        },
        brand: {
          select: { name: true },
        },
        category: {
          select: { name: true, slug: true },
        },
        model3d: {
          select: { id: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // Get average ratings
    const productsWithRatings = await Promise.all(
      featuredProducts.map(async (product) => {
        let avgRating = null;
        if (product._count.reviews > 0) {
          const ratingsData = await ctx.prisma.review.aggregate({
            where: { productId: product.id },
            _avg: { rating: true },
          });
          avgRating = ratingsData._avg.rating;
        }

        return {
          ...product,
          has3DModel: true, // We filtered for this
          reviewCount: product._count.reviews,
          rating: avgRating,
          _count: undefined, // Remove _count from response
        };
      })
    );

    return productsWithRatings;
  }),

  // Search products with autocomplete
  searchProducts: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().int().min(1).max(10).optional().default(5),
    }))
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;

      const products = await ctx.prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          images: {
            take: 1,
            orderBy: { sortOrder: "asc" },
            select: { url: true },
          },
          model3dId: true,
        },
        take: limit,
      });

      return products.map(product => ({
        ...product,
        has3DModel: !!product.model3dId,
        image: product.images[0]?.url || null,
        images: undefined, // Remove images array
      }));
    }),
});
