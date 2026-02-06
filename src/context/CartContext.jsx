import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Creamos el contexto (la "nube")
const CartContext = createContext();

// 2. Creamos el proveedor (el componente que envuelve a la app)
export const CartProvider = ({ children }) => {
  // Inicializamos el carrito leyendo del localStorage (si hay algo guardado)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Guardar en localStorage cada vez que el carrito cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // FUNCIÓN: Agregar al carrito
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      // ¿El producto ya está en el carrito?
      const existingItem = prevCart.find(item => item.id === product.id);

      if (existingItem) {
        // Si ya existe, sumamos la cantidad
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Si es nuevo, lo agregamos
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  // FUNCIÓN: Eliminar del carrito
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // FUNCIÓN: Vaciar carrito
  const clearCart = () => setCart([]);

  // CÁLCULOS: Total de ítems y Total de precio
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      totalItems, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. Hook personalizado para usar el carrito fácil
export const useCart = () => useContext(CartContext);