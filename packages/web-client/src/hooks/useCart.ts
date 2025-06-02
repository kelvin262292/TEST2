import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  attributes?: Record<string, string>; // For product variants like color, size, etc.
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Cart operations
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  updateItem: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  
  // Cart UI
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Cart utilities
  isItemInCart: (id: string) => boolean;
  getItem: (id: string) => CartItem | undefined;
  getItemsCount: () => number;
  getSubtotal: () => number;
}

/**
 * Custom hook for shopping cart functionality
 * Uses Zustand for state management with localStorage persistence
 */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      // Cart operations
      addItem: async (item) => {
        const { items } = get();
        const quantity = item.quantity || 1;
        
        // Check if item already exists in cart
        const existingItemIndex = items.findIndex((i) => i.id === item.id);
        
        if (existingItemIndex > -1) {
          // Update quantity if item exists
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          
          set({ items: updatedItems });
        } else {
          // Add new item to cart
          set({ 
            items: [...items, { ...item, quantity }],
            isOpen: true, // Open cart when adding new item
          });
        }
        
        // You could add API call here to sync with backend
        // try {
        //   await fetch('/api/cart', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ productId: item.id, quantity }),
        //   });
        // } catch (error) {
        //   console.error('Failed to sync cart with server:', error);
        // }
      },
      
      updateItem: (id, quantity) => {
        const { items } = get();
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          set({
            items: items.filter((item) => item.id !== id),
          });
          return;
        }
        
        // Update quantity
        set({
          items: items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },
      
      removeItem: (id) => {
        const { items } = get();
        set({
          items: items.filter((item) => item.id !== id),
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      // Cart UI
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      // Cart utilities
      isItemInCart: (id) => {
        return get().items.some((item) => item.id === id);
      },
      
      getItem: (id) => {
        return get().items.find((item) => item.id === id);
      },
      
      getItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'e3d-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
    }
  )
);

/**
 * Hook to get cart totals with additional calculations
 * (shipping, tax, discounts, etc.)
 */
export const useCartTotals = () => {
  const items = useCart((state) => state.items);
  const subtotal = useCart((state) => state.getSubtotal());
  
  // These values could come from API or config
  const shippingRate = 10; // Fixed shipping rate
  const taxRate = 0.07; // 7% tax rate
  
  // Calculate shipping (could be more complex based on weight, location, etc.)
  const shipping = items.length > 0 ? shippingRate : 0;
  
  // Calculate tax
  const tax = subtotal * taxRate;
  
  // Calculate total
  const total = subtotal + shipping + tax;
  
  return {
    subtotal,
    shipping,
    tax,
    total,
    itemsCount: useCart((state) => state.getItemsCount()),
  };
};

/**
 * Hook to get cart actions with debounce/throttle for better performance
 */
export const useCartActions = () => {
  const addItem = useCart((state) => state.addItem);
  const updateItem = useCart((state) => state.updateItem);
  const removeItem = useCart((state) => state.removeItem);
  const clearCart = useCart((state) => state.clearCart);
  
  // Example of throttled/debounced version (you could use lodash or a custom implementation)
  const debouncedUpdateItem = (id: string, quantity: number) => {
    // Simple debounce implementation
    if (window.updateItemTimeout) {
      clearTimeout(window.updateItemTimeout);
    }
    
    window.updateItemTimeout = setTimeout(() => {
      updateItem(id, quantity);
    }, 300);
  };
  
  return {
    addItem,
    updateItem,
    debouncedUpdateItem,
    removeItem,
    clearCart,
  };
};

// Declare the timeout on the window object for the debounce function
declare global {
  interface Window {
    updateItemTimeout: ReturnType<typeof setTimeout> | undefined;
  }
}
