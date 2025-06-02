import React, { useState, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  ShareIcon, 
  StarIcon, 
  CubeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button, Card } from '@e3d/shared';
import ProductViewer from '../../components/3d/ProductViewer';
import ProductCard from '../../components/products/ProductCard';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import { trpc } from '../../utils/trpc';
import { cn } from '../../utils/cn';

// Types
interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
}

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[];
  brand?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  model3d?: {
    id: string;
    storageKey: string;
    previewUrl?: string;
  };
  has3DModel: boolean;
  rating?: number | null;
  reviewCount: number;
  reviews: Review[];
  relatedProducts: any[];
}

// Image Gallery Component
const ImageGallery = ({ 
  images, 
  productName 
}: { 
  images: ProductImage[]; 
  productName: string 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative overflow-hidden bg-neutral-100 rounded-lg aspect-square">
        <Image
          src={images[currentIndex]?.url || '/images/placeholder-product.jpg'}
          alt={images[currentIndex]?.altText || productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover cursor-pointer"
          onClick={toggleFullscreen}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-5 w-5 text-neutral-700" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-5 w-5 text-neutral-700" />
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex mt-4 space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              className={cn(
                "relative w-16 h-16 rounded-md overflow-hidden border-2",
                currentIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-neutral-300"
              )}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.altText || `${productName} - Image ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <button
            className="absolute top-4 right-4 bg-white/10 rounded-full p-2 hover:bg-white/20"
            onClick={toggleFullscreen}
            aria-label="Close fullscreen"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
          
          <div className="relative w-full max-w-4xl h-full max-h-screen p-8">
            <Image
              src={images[currentIndex]?.url || '/images/placeholder-product.jpg'}
              alt={images[currentIndex]?.altText || productName}
              fill
              sizes="100vw"
              className="object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 rounded-full p-3 hover:bg-white/20"
                  onClick={handlePrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-white" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 rounded-full p-3 hover:bg-white/20"
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="h-6 w-6 text-white" />
                </button>
              </>
            )}
            
            {/* Thumbnails in fullscreen */}
            {images.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-3 h-3 rounded-full",
                      currentIndex === index
                        ? "bg-white"
                        : "bg-white/30 hover:bg-white/50"
                    )}
                    onClick={() => handleThumbnailClick(index)}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Reviews Component
const ReviewsSection = ({ 
  reviews, 
  rating, 
  reviewCount 
}: { 
  reviews: Review[]; 
  rating: number | null; 
  reviewCount: number 
}) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Show only first 3 reviews initially
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-neutral-900 mb-4">
        Customer Reviews
      </h2>
      
      {/* Overall Rating */}
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          {[0, 1, 2, 3, 4].map((star) => (
            <StarIconSolid
              key={star}
              className={cn(
                "h-5 w-5 flex-shrink-0",
                rating && rating > star
                  ? "text-yellow-400"
                  : "text-neutral-300"
              )}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="ml-2 text-sm text-neutral-700">
          {rating ? rating.toFixed(1) : "No ratings"} out of 5 ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </p>
      </div>
      
      {/* Reviews List */}
      {reviewCount > 0 ? (
        <div className="space-y-6">
          {displayedReviews.map((review) => (
            <div key={review.id} className="border-b border-neutral-200 pb-6">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        review.rating > star
                          ? "text-yellow-400"
                          : "text-neutral-300"
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium text-neutral-700">
                  {review.user.fullName}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-2 text-neutral-700">{review.comment}</p>
            </div>
          ))}
          
          {reviews.length > 3 && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? "Show Less" : `Show All ${reviewCount} Reviews`}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-neutral-600">No reviews yet.</p>
      )}
    </div>
  );
};

// Related Products Component
const RelatedProducts = ({ products }: { products: any[] }) => {
  return (
    <div className="mt-16">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        You May Also Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              sku: product.sku,
              price: product.price,
              images: product.images,
              has3DModel: product.has3DModel,
              model3dId: product.model3dId,
              stock: product.stock,
            }}
            size="small"
          />
        ))}
      </div>
    </div>
  );
};

// Main Product Detail Page
export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem, isItemInCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Fetch product data
  const { data, isLoading, error } = trpc.products.getProductById.useQuery(
    { id: id as string },
    {
      enabled: !!id,
      retry: 1,
    }
  );
  
  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (data?.stock || 10)) {
      setQuantity(value);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = async () => {
    if (!data || isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await addItem({
        id: data.id,
        name: data.name,
        price: data.price,
        quantity,
        image: data.images[0]?.url,
        sku: data.sku,
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Handle 3D viewer toggle
  const toggle3DViewer = () => {
    setIs3DViewerOpen(!is3DViewerOpen);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-neutral-200 rounded-lg aspect-square"></div>
            <div className="space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
              <div className="h-10 bg-neutral-200 rounded w-1/3"></div>
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-12 bg-neutral-200 rounded w-full mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
          Product Not Found
        </h1>
        <p className="text-neutral-600 mb-6">
          Sorry, we couldn't find the product you're looking for.
        </p>
        <Button
          variant="primary"
          onClick={() => router.push('/products')}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }
  
  // Get product data
  const product = data;
  const isInCart = isItemInCart(product.id);
  const isOutOfStock = product.stock <= 0;
  
  // Get model URL for 3D viewer
  const modelUrl = product.model3d?.storageKey 
    ? `/api/models/${product.model3d.storageKey}` 
    : '';
  
  return (
    <>
      <Head>
        <title>{product.name} | 3D E-commerce</title>
        <meta name="description" content={product.description?.slice(0, 160) || `Buy ${product.name}`} />
        <meta property="og:title" content={`${product.name} | 3D E-commerce`} />
        <meta property="og:description" content={product.description?.slice(0, 160) || `Buy ${product.name}`} />
        {product.images[0]?.url && (
          <meta property="og:image" content={product.images[0].url} />
        )}
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="text-neutral-500 hover:text-primary">
                Home
              </a>
            </li>
            <li className="text-neutral-500">/</li>
            {product.category && (
              <>
                <li>
                  <a href={`/categories/${product.category.slug}`} className="text-neutral-500 hover:text-primary">
                    {product.category.name}
                  </a>
                </li>
                <li className="text-neutral-500">/</li>
              </>
            )}
            <li className="text-neutral-900 font-medium truncate">
              {product.name}
            </li>
          </ol>
        </nav>
        
        {/* Product Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <ImageGallery 
              images={product.images} 
              productName={product.name} 
            />
            
            {/* 3D Model Button */}
            {product.has3DModel && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  leftIcon={<CubeIcon className="h-5 w-5" />}
                  onClick={toggle3DViewer}
                >
                  View in 3D
                </Button>
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            {/* Brand */}
            {product.brand && (
              <div className="mb-2">
                <span className="text-sm text-neutral-500">
                  {product.brand.name}
                </span>
              </div>
            )}
            
            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((star) => (
                  <StarIconSolid
                    key={star}
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      product.rating && product.rating > star
                        ? "text-yellow-400"
                        : "text-neutral-300"
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="ml-2 text-sm text-neutral-600">
                {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            
            {/* Price */}
            <div className="mb-6">
              <p className="text-3xl font-bold text-neutral-900">
                {formatCurrency(product.price)}
              </p>
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                Description
              </h2>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700">{product.description}</p>
              </div>
            </div>
            
            {/* Stock Status */}
            <div className="mb-6">
              <p className={cn(
                "text-sm font-medium",
                isOutOfStock ? "text-error" : "text-success"
              )}>
                {isOutOfStock 
                  ? "Out of Stock" 
                  : product.stock < 5 
                    ? `Only ${product.stock} left in stock!` 
                    : "In Stock"}
              </p>
            </div>
            
            {/* Add to Cart */}
            <div className="flex flex-col space-y-4">
              {!isOutOfStock && (
                <div className="flex items-center space-x-4">
                  <label htmlFor="quantity" className="sr-only">
                    Quantity
                  </label>
                  <div className="relative flex items-center max-w-[8rem]">
                    <button
                      type="button"
                      className="w-10 h-10 flex items-center justify-center border border-r-0 border-neutral-300 rounded-l-md bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      className="w-12 h-10 border-y border-neutral-300 text-center text-neutral-900 text-sm focus:outline-none"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={handleQuantityChange}
                    />
                    <button
                      type="button"
                      className="w-10 h-10 flex items-center justify-center border border-l-0 border-neutral-300 rounded-r-md bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                      onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button
                  variant={isInCart ? "secondary" : "primary"}
                  size="lg"
                  className="flex-1"
                  leftIcon={<ShoppingCartIcon className="h-5 w-5" />}
                  disabled={isOutOfStock || isAddingToCart}
                  isLoading={isAddingToCart}
                  onClick={handleAddToCart}
                >
                  {isInCart ? "Added to Cart" : "Add to Cart"}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-12 flex items-center justify-center"
                  aria-label="Add to wishlist"
                >
                  <HeartIcon className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-12 flex items-center justify-center"
                  aria-label="Share product"
                >
                  <ShareIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-neutral-500">SKU</dt>
                  <dd className="mt-1 text-sm text-neutral-900">{product.sku}</dd>
                </div>
                {product.category && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Category</dt>
                    <dd className="mt-1 text-sm text-neutral-900">
                      <a 
                        href={`/categories/${product.category.slug}`} 
                        className="text-primary hover:underline"
                      >
                        {product.category.name}
                      </a>
                    </dd>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Brand</dt>
                    <dd className="mt-1 text-sm text-neutral-900">
                      <a 
                        href={`/brands/${product.brand.id}`} 
                        className="text-primary hover:underline"
                      >
                        {product.brand.name}
                      </a>
                    </dd>
                  </div>
                )}
                {product.has3DModel && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">3D Preview</dt>
                    <dd className="mt-1 text-sm text-neutral-900">
                      <button 
                        className="text-primary hover:underline flex items-center"
                        onClick={toggle3DViewer}
                      >
                        <CubeIcon className="h-4 w-4 mr-1" />
                        Available
                      </button>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
        
        {/* 3D Viewer Modal */}
        {is3DViewerOpen && product.has3DModel && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <h3 className="text-lg font-medium text-neutral-900">
                  3D Preview: {product.name}
                </h3>
                <button
                  className="text-neutral-500 hover:text-neutral-700"
                  onClick={toggle3DViewer}
                  aria-label="Close 3D viewer"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 min-h-[400px] p-4">
                <ProductViewer
                  modelUrl={modelUrl}
                  autoRotate={true}
                  showStats={false}
                  enableFullscreen={true}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Reviews Section */}
        <ReviewsSection 
          reviews={product.reviews} 
          rating={product.rating} 
          reviewCount={product.reviewCount} 
        />
        
        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <RelatedProducts products={product.relatedProducts} />
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // You can add server-side data fetching here if needed
  // This is useful for SEO and initial loading performance
  return {
    props: {}, // Will be passed to the page component as props
  };
};
