import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CubeIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { Card } from '@e3d/shared';
import { Button } from '@e3d/shared';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export interface ProductCardProps {
  /**
   * Product data
   */
  product: {
    id: string;
    name: string;
    slug?: string;
    sku: string;
    description?: string;
    price: number;
    images: { url: string; altText?: string }[];
    has3DModel: boolean;
    model3dId?: string;
    rating?: number;
    reviewCount?: number;
    stock: number;
    brand?: {
      name: string;
    };
    category?: {
      name: string;
    };
  };
  /**
   * Callback when user clicks on 3D preview button
   */
  on3DPreviewClick?: (productId: string, model3dId: string) => void;
  /**
   * Callback when user clicks on quick view button
   */
  onQuickViewClick?: (productId: string) => void;
  /**
   * Size variant
   * @default "default"
   */
  size?: 'small' | 'default' | 'large';
  /**
   * Layout variant
   * @default "grid"
   */
  layout?: 'grid' | 'list';
  /**
   * Additional className
   */
  className?: string;
}

/**
 * Product card component for displaying product information in a grid or list
 */
export default function ProductCard({
  product,
  on3DPreviewClick,
  onQuickViewClick,
  size = 'default',
  layout = 'grid',
  className,
}: ProductCardProps) {
  const { addItem, isItemInCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isInCart = isItemInCart(product.id);
  const isOutOfStock = product.stock <= 0;
  
  // Get product URL
  const productUrl = `/products/${product.slug || product.id}`;
  
  // Get primary image
  const primaryImage = product.images[currentImageIndex]?.url || '/images/placeholder-product.jpg';
  const imageAlt = product.images[currentImageIndex]?.altText || product.name;
  
  // Handle image navigation
  const showNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock || isInCart) return;
    
    setIsAddingToCart(true);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0]?.url,
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Handle 3D preview
  const handle3DPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.has3DModel && product.model3dId && on3DPreviewClick) {
      on3DPreviewClick(product.id, product.model3dId);
    }
  };
  
  // Handle quick view
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onQuickViewClick) {
      onQuickViewClick(product.id);
    }
  };
  
  // Determine card size classes
  const sizeClasses = {
    small: 'max-w-xs',
    default: 'max-w-sm',
    large: 'max-w-md',
  };
  
  // Determine image size based on card size
  const imageSizes = {
    small: { width: 200, height: 200 },
    default: { width: 300, height: 300 },
    large: { width: 400, height: 400 },
  };
  
  return (
    <Link href={productUrl} passHref>
      <Card
        variant="product"
        clickable
        className={cn(
          "flex flex-col transition-all duration-300",
          layout === 'list' ? 'flex-row items-start' : 'flex-col',
          sizeClasses[size],
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <div 
          className={cn(
            "relative overflow-hidden rounded-t-lg bg-neutral-100",
            layout === 'list' ? 'w-1/3' : 'w-full',
            {
              'h-48': size === 'small',
              'h-64': size === 'default',
              'h-80': size === 'large',
            }
          )}
          onClick={showNextImage}
        >
          <Image
            src={primaryImage}
            alt={imageAlt}
            fill
            sizes={`(max-width: 768px) 100vw, ${imageSizes[size].width}px`}
            className="object-cover transition-transform duration-500 ease-in-out hover:scale-105"
            priority={false}
          />
          
          {/* Image Navigation Dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentImageIndex 
                      ? "bg-primary" 
                      : "bg-neutral-300"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* 3D Model Badge */}
          {product.has3DModel && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                <CubeIcon className="h-3 w-3 mr-1" />
                3D
              </span>
            </div>
          )}
          
          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-800/80 text-white">
                Out of Stock
              </span>
            </div>
          )}
          
          {/* Action Buttons (visible on hover) */}
          <div 
            className={cn(
              "absolute inset-0 bg-black/5 flex flex-col items-center justify-center space-y-2 opacity-0 transition-opacity duration-300",
              isHovered && "opacity-100"
            )}
          >
            {product.has3DModel && product.model3dId && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CubeIcon className="h-4 w-4" />}
                onClick={handle3DPreview}
                aria-label="View 3D model"
              >
                View in 3D
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickView}
              aria-label="Quick view"
            >
              Quick View
            </Button>
          </div>
        </div>
        
        {/* Product Info */}
        <div className={cn(
          "flex flex-col flex-grow p-4",
          layout === 'list' ? 'w-2/3' : 'w-full'
        )}>
          {/* Brand (if available) */}
          {product.brand && (
            <p className="text-xs text-neutral-500 mb-1">
              {product.brand.name}
            </p>
          )}
          
          {/* Product Name */}
          <h3 className={cn(
            "font-medium text-neutral-900 line-clamp-2",
            {
              'text-sm': size === 'small',
              'text-base': size === 'default',
              'text-lg': size === 'large',
            }
          )}>
            {product.name}
          </h3>
          
          {/* Category (if available) */}
          {product.category && (
            <p className="text-xs text-neutral-500 mt-1">
              {product.category.name}
            </p>
          )}
          
          {/* Rating (if available) */}
          {product.rating !== undefined && (
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <StarIcon
                    key={rating}
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      product.rating > rating 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-neutral-300"
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              {product.reviewCount !== undefined && (
                <p className="ml-2 text-xs text-neutral-500">
                  {product.reviewCount} reviews
                </p>
              )}
            </div>
          )}
          
          {/* Description (for list view) */}
          {layout === 'list' && product.description && (
            <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {/* Price and Add to Cart */}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className={cn(
                "font-semibold text-neutral-900",
                {
                  'text-sm': size === 'small',
                  'text-base': size === 'default',
                  'text-lg': size === 'large',
                }
              )}>
                {formatCurrency(product.price)}
              </span>
              {isOutOfStock && (
                <span className="text-xs text-error">Out of stock</span>
              )}
            </div>
            
            <Button
              variant={isInCart ? "secondary" : "primary"}
              size="sm"
              leftIcon={<ShoppingCartIcon className="h-4 w-4" />}
              disabled={isOutOfStock || isAddingToCart}
              isLoading={isAddingToCart}
              onClick={handleAddToCart}
              aria-label={isInCart ? "Added to cart" : "Add to cart"}
            >
              {isInCart ? "Added" : "Add"}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
