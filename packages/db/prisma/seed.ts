import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding...`);
  const startTime = Date.now();

  // Clear existing data (optional, comment out if not needed)
  await prisma.$transaction([
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.review.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.productModel3D.deleteMany(),
    prisma.category.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.address.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.role.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // 1. Create roles
  const roles = await Promise.all([
    prisma.role.create({
      data: { name: "admin" },
    }),
    prisma.role.create({
      data: { name: "customer" },
    }),
  ]);

  console.log(`Created ${roles.length} roles`);

  // 2. Create users
  const adminPassword = await hash("admin123", 10);
  const customerPassword = await hash("customer123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash: adminPassword,
      fullName: "Admin User",
      phone: "+1234567890",
      roles: {
        create: {
          roleId: roles[0].id, // admin role
        },
      },
      addresses: {
        create: {
          line1: "123 Admin Street",
          city: "San Francisco",
          postalCode: "94105",
          country: "USA",
          isDefault: true,
        },
      },
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      passwordHash: customerPassword,
      fullName: "John Customer",
      phone: "+9876543210",
      roles: {
        create: {
          roleId: roles[1].id, // customer role
        },
      },
      addresses: {
        create: [
          {
            line1: "456 Customer Ave",
            line2: "Apt 101",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "USA",
            isDefault: true,
          },
          {
            line1: "789 Work Blvd",
            city: "New York",
            state: "NY",
            postalCode: "10002",
            country: "USA",
            isDefault: false,
          },
        ],
      },
    },
  });

  console.log(`Created ${2} users`);

  // 3. Create brands
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: "Modern Designs",
        logoUrl: "https://example.com/logos/modern-designs.png",
      },
    }),
    prisma.brand.create({
      data: {
        name: "Comfort Living",
        logoUrl: "https://example.com/logos/comfort-living.png",
      },
    }),
    prisma.brand.create({
      data: {
        name: "Tech Innovations",
        logoUrl: "https://example.com/logos/tech-innovations.png",
      },
    }),
    prisma.brand.create({
      data: {
        name: "Luxury Collections",
        logoUrl: "https://example.com/logos/luxury-collections.png",
      },
    }),
  ]);

  console.log(`Created ${brands.length} brands`);

  // 4. Create categories
  const furnitureCategory = await prisma.category.create({
    data: {
      name: "Furniture",
      slug: "furniture",
    },
  });

  const electronicsCategory = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
    },
  });

  const subcategories = await Promise.all([
    // Furniture subcategories
    prisma.category.create({
      data: {
        name: "Sofas",
        slug: "sofas",
        parentId: furnitureCategory.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Chairs",
        slug: "chairs",
        parentId: furnitureCategory.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Tables",
        slug: "tables",
        parentId: furnitureCategory.id,
      },
    }),
    // Electronics subcategories
    prisma.category.create({
      data: {
        name: "Smartphones",
        slug: "smartphones",
        parentId: electronicsCategory.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Laptops",
        slug: "laptops",
        parentId: electronicsCategory.id,
      },
    }),
  ]);

  console.log(`Created ${2} main categories and ${subcategories.length} subcategories`);

  // 5. Create 3D models
  const models3D = await Promise.all([
    prisma.productModel3D.create({
      data: {
        storageKey: "furniture/sofas/modern-sofa.glb",
        previewUrl: "https://example.com/previews/modern-sofa.jpg",
        sizeBytes: 2500000n,
        format: "glb",
        compression: "draco",
      },
    }),
    prisma.productModel3D.create({
      data: {
        storageKey: "furniture/chairs/ergonomic-chair.glb",
        previewUrl: "https://example.com/previews/ergonomic-chair.jpg",
        sizeBytes: 1800000n,
        format: "glb",
        compression: "draco",
      },
    }),
    prisma.productModel3D.create({
      data: {
        storageKey: "furniture/tables/coffee-table.glb",
        previewUrl: "https://example.com/previews/coffee-table.jpg",
        sizeBytes: 2200000n,
        format: "glb",
        compression: "draco",
      },
    }),
    prisma.productModel3D.create({
      data: {
        storageKey: "electronics/smartphones/smartphone-x.glb",
        previewUrl: "https://example.com/previews/smartphone-x.jpg",
        sizeBytes: 1500000n,
        format: "glb",
        compression: "meshopt",
      },
    }),
    prisma.productModel3D.create({
      data: {
        storageKey: "electronics/laptops/ultrabook-pro.glb",
        previewUrl: "https://example.com/previews/ultrabook-pro.jpg",
        sizeBytes: 3000000n,
        format: "glb",
        compression: "meshopt",
      },
    }),
  ]);

  console.log(`Created ${models3D.length} 3D models`);

  // 6. Create products
  const products = await Promise.all([
    // Furniture products
    prisma.product.create({
      data: {
        name: "Modern Comfort Sofa",
        sku: "SOFA-001",
        description: "A luxurious 3-seater sofa with premium fabric and modern design.",
        price: 1299.99,
        stock: 10,
        brandId: brands[0].id, // Modern Designs
        categoryId: subcategories[0].id, // Sofas
        model3dId: models3D[0].id,
        images: {
          create: [
            {
              url: "https://example.com/images/modern-sofa-1.jpg",
              altText: "Modern Comfort Sofa - Front View",
              sortOrder: 1,
            },
            {
              url: "https://example.com/images/modern-sofa-2.jpg",
              altText: "Modern Comfort Sofa - Side View",
              sortOrder: 2,
            },
            {
              url: "https://example.com/images/modern-sofa-3.jpg",
              altText: "Modern Comfort Sofa - Detail View",
              sortOrder: 3,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Ergonomic Office Chair",
        sku: "CHAIR-001",
        description: "Adjustable ergonomic chair with lumbar support and breathable mesh.",
        price: 349.99,
        stock: 25,
        brandId: brands[1].id, // Comfort Living
        categoryId: subcategories[1].id, // Chairs
        model3dId: models3D[1].id,
        images: {
          create: [
            {
              url: "https://example.com/images/ergonomic-chair-1.jpg",
              altText: "Ergonomic Office Chair - Front View",
              sortOrder: 1,
            },
            {
              url: "https://example.com/images/ergonomic-chair-2.jpg",
              altText: "Ergonomic Office Chair - Side View",
              sortOrder: 2,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Minimalist Coffee Table",
        sku: "TABLE-001",
        description: "Sleek coffee table with tempered glass top and solid wood legs.",
        price: 249.99,
        stock: 15,
        brandId: brands[0].id, // Modern Designs
        categoryId: subcategories[2].id, // Tables
        model3dId: models3D[2].id,
        images: {
          create: [
            {
              url: "https://example.com/images/coffee-table-1.jpg",
              altText: "Minimalist Coffee Table - Top View",
              sortOrder: 1,
            },
            {
              url: "https://example.com/images/coffee-table-2.jpg",
              altText: "Minimalist Coffee Table - Side View",
              sortOrder: 2,
            },
          ],
        },
      },
    }),
    // Electronics products
    prisma.product.create({
      data: {
        name: "Smartphone X Pro",
        sku: "PHONE-001",
        description: "Latest flagship smartphone with 6.7-inch OLED display and 108MP camera.",
        price: 999.99,
        stock: 50,
        brandId: brands[2].id, // Tech Innovations
        categoryId: subcategories[3].id, // Smartphones
        model3dId: models3D[3].id,
        images: {
          create: [
            {
              url: "https://example.com/images/smartphone-x-1.jpg",
              altText: "Smartphone X Pro - Front View",
              sortOrder: 1,
            },
            {
              url: "https://example.com/images/smartphone-x-2.jpg",
              altText: "Smartphone X Pro - Back View",
              sortOrder: 2,
            },
            {
              url: "https://example.com/images/smartphone-x-3.jpg",
              altText: "Smartphone X Pro - Side View",
              sortOrder: 3,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Ultrabook Pro 15",
        sku: "LAPTOP-001",
        description: "Powerful ultrabook with 15-inch 4K display, 32GB RAM, and 1TB SSD.",
        price: 1899.99,
        stock: 20,
        brandId: brands[2].id, // Tech Innovations
        categoryId: subcategories[4].id, // Laptops
        model3dId: models3D[4].id,
        images: {
          create: [
            {
              url: "https://example.com/images/ultrabook-pro-1.jpg",
              altText: "Ultrabook Pro 15 - Front View",
              sortOrder: 1,
            },
            {
              url: "https://example.com/images/ultrabook-pro-2.jpg",
              altText: "Ultrabook Pro 15 - Side View",
              sortOrder: 2,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // 7. Create customer cart
  const cart = await prisma.cart.create({
    data: {
      userId: customer.id,
      items: {
        create: [
          {
            productId: products[1].id, // Ergonomic Office Chair
            quantity: 1,
          },
          {
            productId: products[4].id, // Ultrabook Pro 15
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log(`Created cart with ${2} items`);

  // 8. Create sample orders
  const completedOrder = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "completed",
      totalAmount: 1249.98, // chair + table
      placedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      shippedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      items: {
        create: [
          {
            productId: products[1].id, // Ergonomic Office Chair
            quantity: 1,
            unitPrice: 349.99,
          },
          {
            productId: products[2].id, // Minimalist Coffee Table
            quantity: 1,
            unitPrice: 249.99,
          },
        ],
      },
    },
  });

  const processingOrder = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "processing",
      totalAmount: 999.99, // smartphone
      placedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      shippedAt: null,
      completedAt: null,
      items: {
        create: [
          {
            productId: products[3].id, // Smartphone X Pro
            quantity: 1,
            unitPrice: 999.99,
          },
        ],
      },
    },
  });

  console.log(`Created ${2} orders`);

  // 9. Create product reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: customer.id,
        productId: products[1].id, // Ergonomic Office Chair
        rating: 5,
        comment: "Excellent chair! Very comfortable for long working hours.",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
    }),
    prisma.review.create({
      data: {
        userId: customer.id,
        productId: products[2].id, // Minimalist Coffee Table
        rating: 4,
        comment: "Beautiful table, but assembly was a bit challenging.",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
    }),
  ]);

  console.log(`Created ${reviews.length} reviews`);

  const endTime = Date.now();
  console.log(`Seeding finished in ${(endTime - startTime) / 1000}s`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
