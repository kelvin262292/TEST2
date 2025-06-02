# Database Schema Design  
Modern 3D E-commerce Platform  
Author: Dennis Smith  
Last updated: 2025-06-02  

---

## 1  Entity–Relationship Diagram (text)

```
USER (1)───(N) ADDRESS
USER (1)───(N) ORDER ───(N) ORDER_ITEM ───(1) PRODUCT
USER (1)───(N) REVIEW ───(1) PRODUCT
USER (1)───(1) CART ───(N) CART_ITEM ───(1) PRODUCT

ROLE (1)───(N) USER_ROLE───(1) USER          (RBAC)

PRODUCT (N)───(1) BRAND
PRODUCT (N)───(1) CATEGORY
PRODUCT (1)───(N) PRODUCT_IMAGE
PRODUCT (1)───(1) PRODUCT_MODEL_3D           (GLTF/GLB)

CATEGORY (1)───(N) SUBCATEGORY (self-ref)    (optional)
```

Legend:  
`(1)` = one, `(N)` = many.

---

## 2  Detailed Table Schemas

### 2.1 `users`

| Field            | Type                | Constraints               |
|------------------|---------------------|---------------------------|
| id               | UUID PK             | `PRIMARY KEY`             |
| email            | VARCHAR(255)        | `UNIQUE NOT NULL`         |
| password_hash    | VARCHAR(255)        | `NOT NULL`                |
| full_name        | VARCHAR(120)        |                           |
| avatar_url       | VARCHAR(512)        |                           |
| phone            | VARCHAR(32)         |                           |
| created_at       | TIMESTAMPTZ         | `DEFAULT NOW()`           |
| updated_at       | TIMESTAMPTZ         | `DEFAULT NOW()`           |
| deleted_at       | TIMESTAMPTZ         | `NULLABLE` soft-delete    |

### 2.2 `roles`

| Field  | Type         | Constraints |
|--------|--------------|-------------|
| id     | SERIAL PK    |             |
| name   | VARCHAR(50)  | `UNIQUE`    |

### 2.3 `user_roles`

| Field  | Type  | Constraints                       |
|--------|-------|-----------------------------------|
| user_id| UUID  | `FK -> users(id)` `ON DELETE CASCADE` |
| role_id| INT   | `FK -> roles(id)` `ON DELETE CASCADE` |
| PK     | `(user_id, role_id)` composite            |

### 2.4 `addresses`

| Field          | Type          | Constraints                    |
|----------------|---------------|--------------------------------|
| id             | UUID PK       |                                |
| user_id        | UUID          | `FK -> users(id)`              |
| line1          | VARCHAR(255)  | `NOT NULL`                     |
| line2          | VARCHAR(255)  |                                |
| city           | VARCHAR(120)  | `NOT NULL`                     |
| state          | VARCHAR(120)  |                                |
| postal_code    | VARCHAR(20)   | `NOT NULL`                     |
| country        | VARCHAR(120)  | `NOT NULL`                     |
| is_default     | BOOLEAN       | `DEFAULT FALSE` (unique by user when TRUE) |
| created_at     | TIMESTAMPTZ   | `DEFAULT NOW()`                |

### 2.5 `brands`

| Field  | Type         | Constraints |
|--------|--------------|-------------|
| id     | SERIAL PK    |             |
| name   | VARCHAR(120) | `UNIQUE`    |
| logo_url|VARCHAR(512) |             |

### 2.6 `categories`

| Field       | Type        | Constraints                       |
|-------------|-------------|-----------------------------------|
| id          | SERIAL PK   |                                   |
| parent_id   | INT         | `FK -> categories(id)` nullable   |
| name        | VARCHAR(120)| `NOT NULL`                        |
| slug        | VARCHAR(120)| `UNIQUE`                          |

### 2.7 `products`

| Field            | Type            | Constraints                                |
|------------------|-----------------|--------------------------------------------|
| id               | UUID PK         |                                            |
| brand_id         | INT             | `FK -> brands(id)`                         |
| category_id      | INT             | `FK -> categories(id)`                     |
| sku              | VARCHAR(64)     | `UNIQUE`                                   |
| name             | VARCHAR(255)    | `NOT NULL`                                 |
| description      | TEXT            |                                            |
| price            | NUMERIC(12,2)   | `NOT NULL CHECK (price >= 0)`              |
| stock            | INT             | `DEFAULT 0 CHECK (stock >= 0)`             |
| model3d_id       | UUID            | `FK -> product_model_3d(id)` nullable      |
| created_at       | TIMESTAMPTZ     | `DEFAULT NOW()`                            |
| updated_at       | TIMESTAMPTZ     | `DEFAULT NOW()`                            |
| is_active        | BOOLEAN         | `DEFAULT TRUE`                             |

### 2.8 `product_images`

| Field        | Type          | Constraints                     |
|--------------|---------------|---------------------------------|
| id           | UUID PK       |                                 |
| product_id   | UUID          | `FK -> products(id)`            |
| url          | VARCHAR(512)  | `NOT NULL`                      |
| alt_text     | VARCHAR(255)  |                                 |
| sort_order   | INT           | `DEFAULT 0`                     |

### 2.9 `product_model_3d`

| Field        | Type          | Constraints                                                  |
|--------------|---------------|--------------------------------------------------------------|
| id           | UUID PK       |                                                              |
| storage_key  | VARCHAR(512)  | `UNIQUE NOT NULL` (S3 key or CDN path)                       |
| preview_url  | VARCHAR(512)  | Low-poly or thumbnail view                                   |
| size_bytes   | BIGINT        |                                                              |
| format       | VARCHAR(10)   | e.g. `glb`, `gltf`                                           |
| uploaded_at  | TIMESTAMPTZ   | `DEFAULT NOW()`                                              |
| compression  | VARCHAR(30)   | e.g. `draco`, `meshopt`                                      |

### 2.10 `orders`

| Field         | Type          | Constraints                          |
|---------------|---------------|--------------------------------------|
| id            | UUID PK       |                                      |
| user_id       | UUID          | `FK -> users(id)`                    |
| status        | VARCHAR(30)   | `NOT NULL` (enum: pending, paid …)   |
| total_amount  | NUMERIC(12,2) | `NOT NULL`                           |
| placed_at     | TIMESTAMPTZ   | `DEFAULT NOW()`                      |
| shipped_at    | TIMESTAMPTZ   |                                      |
| completed_at  | TIMESTAMPTZ   |                                      |
| cancelled_at  | TIMESTAMPTZ   |                                      |

### 2.11 `order_items`

| Field        | Type          | Constraints                           |
|--------------|---------------|---------------------------------------|
| id           | UUID PK       |                                       |
| order_id     | UUID          | `FK -> orders(id)`                    |
| product_id   | UUID          | `FK -> products(id)`                  |
| quantity     | INT           | `NOT NULL CHECK (quantity > 0)`       |
| unit_price   | NUMERIC(12,2) | Snapshot price                        |

### 2.12 `reviews`

| Field         | Type          | Constraints                          |
|---------------|---------------|--------------------------------------|
| id            | UUID PK       |                                      |
| user_id       | UUID          | `FK -> users(id)`                    |
| product_id    | UUID          | `FK -> products(id)`                 |
| rating        | INT           | `CHECK (rating BETWEEN 1 AND 5)`     |
| comment       | TEXT          |                                      |
| created_at    | TIMESTAMPTZ   | `DEFAULT NOW()`                      |

### 2.13 `carts`

| Field   | Type | Constraints |
|---------|------|-------------|
| id      | UUID PK |           |
| user_id | UUID | `FK -> users(id)` `UNIQUE` (1 cart per user) |
| updated_at | TIMESTAMPTZ | `DEFAULT NOW()` |

### 2.14 `cart_items`

| Field       | Type | Constraints                                     |
|-------------|------|-------------------------------------------------|
| id          | UUID PK |                                             |
| cart_id     | UUID | `FK -> carts(id)`                               |
| product_id  | UUID | `FK -> products(id)`                            |
| quantity    | INT  | `NOT NULL CHECK (quantity > 0)`                 |

---

## 3  Relationships & Foreign Keys

* Users → Addresses, Orders, Reviews, Cart (`ON DELETE CASCADE`)
* Products → Brand, Category, 3D Model (`SET NULL` on delete)
* Products ↔ Reviews (one-to-many)
* Orders ↔ Order Items (cascade)
* RBAC via `user_roles`

---

## 4  Indexes & Performance

| Table              | Index                                               | Purpose                       |
|--------------------|-----------------------------------------------------|-------------------------------|
| users              | `UNIQUE (email)`                                    | fast login                    |
| products           | `BTREE (category_id, price)`                        | category + price filter       |
| products           | `GIN (to_tsvector(name || ' ' || description))`     | full-text search              |
| product_images     | `BTREE (product_id, sort_order)`                    | ordered fetch                 |
| orders             | `BTREE (user_id, placed_at DESC)`                   | user order history            |
| reviews            | `BTREE (product_id, created_at DESC)`               | product review list           |
| cart_items         | `UNIQUE (cart_id, product_id)`                      | no duplicates                 |

All PKs have implicit indexes.

---

## 5  Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String       @id @default(uuid())
  email       String       @unique
  passwordHash String
  fullName    String?
  avatarUrl   String?
  phone       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?

  roles       UserRole[]
  addresses   Address[]
  orders      Order[]
  reviews     Review[]
  cart        Cart?

  @@map("users")
}

model Role {
  id    Int        @id @default(autoincrement())
  name  String     @unique
  users UserRole[]

  @@map("roles")
}

model UserRole {
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId   String
  role     Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)
  roleId   Int

  @@id([userId, roleId])
  @@map("user_roles")
}

model Address {
  id        String  @id @default(uuid())
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  line1     String
  line2     String?
  city      String
  state     String?
  postalCode String
  country   String
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())

  @@map("addresses")
}

model Brand {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  logoUrl  String?
  products Product[]

  @@map("brands")
}

model Category {
  id        Int        @id @default(autoincrement())
  parent    Category?  @relation("CategoryToParent", fields: [parentId], references: [id])
  parentId  Int?
  children  Category[] @relation("CategoryToParent")
  name      String
  slug      String     @unique
  products  Product[]

  @@map("categories")
}

model ProductModel3D {
  id          String  @id @default(uuid())
  storageKey  String  @unique
  previewUrl  String?
  sizeBytes   BigInt?
  format      String?
  compression String?
  product     Product?

  @@map("product_model_3d")
}

model Product {
  id          String           @id @default(uuid())
  brand       Brand?           @relation(fields: [brandId], references: [id])
  brandId     Int?
  category    Category?        @relation(fields: [categoryId], references: [id])
  categoryId  Int?
  sku         String           @unique
  name        String
  description String?
  price       Decimal
  stock       Int              @default(0)
  model3d     ProductModel3D?  @relation(fields: [model3dId], references: [id], onDelete: SetNull)
  model3dId   String?
  images      ProductImage[]
  reviews     Review[]
  orderItems  OrderItem[]
  cartItems   CartItem[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  isActive    Boolean          @default(true)

  @@map("products")
}

model ProductImage {
  id         String  @id @default(uuid())
  product    Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId  String
  url        String
  altText    String?
  sortOrder  Int      @default(0)

  @@map("product_images")
}

model Order {
  id          String       @id @default(uuid())
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  status      String
  totalAmount Decimal
  placedAt    DateTime     @default(now())
  shippedAt   DateTime?
  completedAt DateTime?
  cancelledAt DateTime?
  items       OrderItem[]

  @@map("orders")
}

model OrderItem {
  id        String   @id @default(uuid())
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  quantity  Int
  unitPrice Decimal

  @@map("order_items")
}

model Review {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  rating    Int
  comment   String?
  createdAt DateTime @default(now())

  @@map("reviews")
}

model Cart {
  id        String     @id @default(uuid())
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String     @unique
  items     CartItem[]
  updatedAt DateTime   @updatedAt

  @@map("carts")
}

model CartItem {
  id        String   @id @default(uuid())
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  cartId    String
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  quantity  Int

  @@unique([cartId, productId])
  @@map("cart_items")
}
```

---

## 6  Migration Strategy

1. **Version control**: Keep Prisma migrations in `packages/db/prisma/migrations`.  
2. **Branch workflow**:  
   * Generate migration in feature branch → push → CI runs `prisma migrate dev --skip-seed`.  
3. **CI verification**: `prisma migrate deploy --schema prisma/schema.prisma --preview-feature` in PR pipeline.  
4. **Production rollout**:  
   * GitHub Action `deploy` job runs `prisma migrate deploy` against prod DB.  
   * Automatic rollback if migration fails (using PG transaction).  
5. **Blue-green DB** (optional) for zero-downtime major changes.

---

## 7  Data Seeding Plan

* Located in `packages/db/seed.ts`.
* Steps:
  1. Insert default roles (`admin`, `customer`).
  2. Create sample categories, brands.
  3. Add demo products with placeholder 3D models & images (pointing to S3 `demo/` folder).
  4. Create a test user with cart and sample order.
* Seed script executed via `pnpm db:seed` (`prisma db seed`).

---

## 8  3D Model & File-Storage Considerations

| Concern            | Decision & Notes                                                        |
|--------------------|-------------------------------------------------------------------------|
| Storage            | AWS S3 bucket `e3d-models` with lifecycle rules to transition to Glacier|
| Path Convention    | `brand/<brandSlug>/product/<sku>/models/<variant>.glb`                  |
| Compression        | Pre-process GLTF with Draco / Meshopt; store both compressed + original |
| CDN                | CloudFront in front of S3 for low-latency global delivery               |
| Metadata           | Captured in `product_model_3d` table (`size_bytes`, `compression`)      |
| Versioning         | Enable S3 versioning; update `storage_key` when new model deployed      |
| Security           | Signed URLs for private models; public‐read for standard imagery        |
| Upload Workflow    | Admin uploads → API validates MIME & size → stores to S3 → saves record |
| Backup             | Daily cross-region replication & snapshots                              |

---

## 9  Next Steps

* Finalise enum values (`order.status`, etc.) in Prisma.  
* Add `pgmq` or `BullMQ` for async tasks (model processing).  
* Implement multi-tenant support (optional).  
* Stress-test indexes with synthetic data.  

