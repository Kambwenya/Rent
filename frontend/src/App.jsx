import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Admin from './pages/AdminBackend';
import SellerRegister from './pages/SellerRegister';
import SellerDashboard from './pages/SellerDashboard';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerRegister from './pages/BuyerRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Showroom from './pages/Showroom';
import ShowroomRoom from './pages/ShowroomRoom';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  const publicPaths = [
    '/',
    '/home',
    '/products',
    '/privacy',
    '/terms',
    '/login',
    '/register',
    '/register/buyer',
    '/forgot-password',
    '/reset-password',
  ];

  const isPublicRoute = (pathname) => {
    if (publicPaths.includes(pathname)) return true;
    return pathname.startsWith('/products/');
  };

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required' && !isPublicRoute(location.pathname)) {
      // Only force login for protected screens; keep public landing pages accessible.
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/buyer" element={<BuyerRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin-backend" element={<Admin />} />
      <Route path="/seller-register" element={<SellerRegister />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/showroom" element={<Showroom />} />
      <Route path="/showroom/:id" element={<ShowroomRoom />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App