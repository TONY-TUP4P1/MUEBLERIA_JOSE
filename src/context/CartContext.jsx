import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Creamos el contexto
const CartContext = createContext();

// 2. Proveedor
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- AGREGAR (INCREMENTAR) ---
  const addToCart = (product, amount = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);

      if (existingItem) {
        // Si existe, sumamos a 'quantity'
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + amount }
            : item
        );
      } else {
        // Si es nuevo, inicializamos 'quantity'
        return [...prevCart, { ...product, quantity: amount }];
      }
    });
  };

  // --- RESTAR (DECREMENTAR) --- (NUEVA FUNCIÓN)
  const decreaseQuantity = (productId) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        // Solo restamos si el ID coincide y la cantidad es mayor a 1
        if (item.id === productId && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
    });
  };

  // --- ELIMINAR COMPLETAMENTE ---
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Cálculos (Usando 'quantity')
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      decreaseQuantity, // <--- Exportamos la nueva función
      removeFromCart, 
      clearCart, 
      totalItems, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);