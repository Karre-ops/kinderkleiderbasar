import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { BazaarProvider, useBazaar } from '@/lib/BazaarContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
// Add page imports here
import Kasse from "./pages/Kasse.jsx";
import KassePublic from "./pages/KassePublic.jsx";
import Admin from "./pages/Admin.jsx";
import BazaarSelection from "./pages/BazaarSelection.jsx";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
  const { selectedBazaar, selectedRole } = useBazaar();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to bazaar selection if no bazaar selected
  useEffect(() => {
    const path = window.location.pathname;
    if (!selectedBazaar && path !== "/select") {
      navigate("/select");
    }
  }, [selectedBazaar, navigate]);

  return (
    <Routes>
      <Route path="/select" element={<BazaarSelection />} />
      <Route path="/" element={<Kasse />} />
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