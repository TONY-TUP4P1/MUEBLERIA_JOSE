import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Creamos el contexto
const CartContext = createContext();

// 2. Hook personalizado para usar el contexto (con validación de errores)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};

// 3. Proveedor
export const CartProvider = ({ children }) => {
  // --- INICIALIZACIÓN CON PERSISTENCIA ---
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error al cargar el carrito del localStorage:", error);
      return [];
    }
  });

  // --- EFECTO PARA GUARDAR AUTOMÁTICAMENTE ---
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- AGREGAR (INCREMENTAR) ---
  const addToCart = (product, amount = 1) => {
    setCart(prevCart => {
      // Buscamos si el producto ya existe por ID
      const existingItem = prevCart.find(item => item.id === product.id);

      if (existingItem) {
        // Si existe, creamos un nuevo array actualizando solo ese item
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + amount }
            : item
        );
      } else {
        // Si es nuevo, lo agregamos al array con su cantidad inicial
        return [...prevCart, { ...product, quantity: amount }];
      }
    });
  };

  // --- RESTAR (DECREMENTAR) ---
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

  // --- ELIMINAR UN PRODUCTO ---
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // --- LIMPIAR TODO (Al finalizar compra) ---
  const clearCart = () => {
    setCart([]);
    // El useEffect se encargará de limpiar el localStorage automáticamente
  };

  // --- CÁLCULOS ---
  // Cantidad total de items (ej: 2 sillas + 1 mesa = 3 items)
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  // Precio total (ej: 2 * 100 + 1 * 50 = 250)
  const totalPrice = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      setCart, // Exportamos setCart por si acaso se necesita manual
      addToCart, 
      decreaseQuantity, 
      removeFromCart, 
      clearCart, 
      totalItems, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};