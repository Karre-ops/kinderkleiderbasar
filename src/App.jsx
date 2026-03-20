import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { BazaarProvider, useBazaar } from '@/lib/BazaarContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
// Add page imports here
import KassePublic from "./pages/KassePublic.jsx";
import Admin from "./pages/Admin.jsx";
import BazaarSelection from "./pages/BazaarSelection.jsx";

// Public routes that don't require auth
const PUBLIC_PATHS = ["/kasse"];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const isPublic = PUBLIC_PATHS.includes(location.pathname);

  // Public routes: render directly without auth
  if (isPublic) {
    return <KassePublic />;
  }

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <BazaarProvider>
      <AppRoutes />
    </BazaarProvider>
  );
};

const AppRoutes = () => {
  const { selectedBazaar } = useBazaar();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!selectedBazaar && location.pathname !== "/select") {
      navigate("/select");
    }
  }, [selectedBazaar, navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/select" element={<BazaarSelection />} />
      <Route path="/" element={<BazaarSelection />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App