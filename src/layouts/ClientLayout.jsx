import { Outlet } from 'react-router-dom';
import Navbar from '../components/client/Navbar';
import Footer from '../components/client/Footer';

const ClientLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;