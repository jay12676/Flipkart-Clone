import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import CategoryStrip from './components/layout/CategoryStrip.jsx';
import Footer from './components/layout/Footer.jsx';
import Header from './components/layout/Header.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import Orders from './pages/Orders.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import ProductListing from './pages/ProductListing.jsx';
import Signup from './pages/Signup.jsx';
import Wishlist from './pages/Wishlist.jsx';

export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <CategoryStrip />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ProductListing />} />
          <Route path="/c/:slug" element={<ProductListing />} />
          <Route path="/p/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route
            path="/order/:orderNumber"
            element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>}
          />

          <Route path="*" element={<div className="p-12 text-center">Page not found</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
