import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ProductPage from './pages/ProductPage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistProfilePage from './pages/ArtistProfilePage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AccountPage from './pages/AccountPage';
import JournalPage from './pages/JournalPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import ArtistOrdersPage from './pages/ArtistOrdersPage';
import EarningsPage from './pages/EarningsPage';
import ReviewsPage from './pages/ReviewsPage';
import SellerProductsPage from './pages/SellerProductsPage';
import InfoPage from './pages/InfoPage';

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artist/:artistId" element={<ArtistProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/about" element={<InfoPage page="about" />} />
          <Route path="/contact" element={<InfoPage page="contact" />} />
          <Route path="/privacy" element={<InfoPage page="privacy" />} />
          <Route path="/terms" element={<InfoPage page="terms" />} />
          <Route path="/cookies" element={<InfoPage page="cookies" />} />
          <Route path="/refunds" element={<InfoPage page="refunds" />} />
          <Route path="/shipping" element={<InfoPage page="shipping" />} />
          <Route element={<ProtectedRoute roles={['ARTIST']} />}>
            <Route path="/sell" element={<SellerDashboardPage />} />
            <Route path="/sell/products/new" element={<AddProductPage />} />
            <Route path="/sell/products" element={<SellerProductsPage />} />
            <Route path="/sell/products/:productId/edit" element={<EditProductPage />} />
            <Route path="/sell/orders" element={<ArtistOrdersPage />} />
            <Route path="/sell/earnings" element={<EarningsPage />} />
            <Route path="/sell/reviews" element={<ReviewsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Routes>
      </Layout>
    </AppProvider>
  );
}
