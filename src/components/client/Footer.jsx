import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-xl font-bold mb-2">Mueblería Jose</h3>
        <p className="text-gray-400 text-sm mb-4">Calidad y estilo para tu hogar.</p>
        <div className="flex justify-center gap-4 text-gray-400">
            <i className="fab fa-facebook hover:text-white cursor-pointer"></i>
            <i className="fab fa-instagram hover:text-white cursor-pointer"></i>
            <i className="fab fa-whatsapp hover:text-white cursor-pointer"></i>
        </div>
        <div className="mt-8 text-xs text-gray-600 border-t border-gray-800 pt-4">
            &copy; {new Date().getFullYear()} Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;