import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';


export interface CartItem {
  id: string; // This is the menu_item_id
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  restaurantId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCartTotal(newTotal);

    if (cart.length > 0) {
      setRestaurantId(cart[0].restaurantId);
    } else {
      setRestaurantId(null);
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    // Check if cart is empty or if item is from the same restaurant
    if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
      Alert.alert(
        'Start New Order?',
        'Your cart contains items from a different restaurant. Would you like to clear the cart and start a new order?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Start New Order',
            style: 'destructive',
            onPress: () => {
              setCart([{ ...item, quantity }]);
            },
          },
        ]
      );
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity }];
      }
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prevCart =>
        prevCart.map(item => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
      );
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    restaurantId,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 