// ========== IMPORTS ==========
// UI & Notification
import { Toaster } from "@/components/ui/toaster"
// Data Management (React Query)
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
// Routing (React Router)
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
// Error Pages
import PageNotFound from './lib/PageNotFound';
// Context Provider (Auth & Bazaar)
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { BazaarProvider, useBazaar } from '@/lib/BazaarContext';
// Error Components
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// ========== PAGE IMPORTS ==========
import KassePublic from "./pages/KassePublic.jsx"; // Öffentliche Kassen-Seite (URL-Parameter basiert)
import Admin from "./pages/Admin.jsx"; // Admin-Dashboard (nur für authentifizierte Benutzer mit Admin-Rolle)
import BazaarSelection from "./pages/BazaarSelection.jsx"; // Basar-Auswahl (Hauptseite nach Login)

/**
 * ========== PUBLIC ROUTES ==========
 * Diese Routes erfordern KEINE Authentifizierung
 * z.B. /kasse für die öffentliche Kassenseite (Verkäufer/Kunden)
 */
const PUBLIC_PATHS = ["/kasse"];

/**
 * AuthenticatedApp - Verwaltet die Authentifizierung und Route-Logik
 * 
 * Arbeitsablauf:
 * 1. Prüft ob aktuelle Route eine öffentliche Route ist → Zeigt KassePublic ohne Auth
 * 2. Wartet auf Auth-Laden und App-Einstellungen
 * 3. Prüft auf Auth-Fehler (nicht registriert, Auth erforderlich)
 * 4. Falls alles OK: Zeigt BazaarProvider mit AppRoutes (nur für Auth-Benutzer)
 */
const AuthenticatedApp = () => {
  // Auth-Context: Authentifizierungs-Status und Fehlerbehandlung
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation(); // Aktuelle Route
  const isPublic = PUBLIC_PATHS.some(p => location.pathname.startsWith(p)); // Ist dies eine öffentliche Route?

  // ========== SCHRITT 1: Öffentliche Routes ==========
  // Wenn die aktuelle Route öffentlich ist, zeige sie OHNE Auth-Überprüfung
  if (isPublic) {
    return <KassePublic />;
  }

  // ========== SCHRITT 2: Laden von Auth & App-Einstellungen ==========
  // Zeige Lade-Spinner, während Auth-Daten und App-Einstellungen geladen werden
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // ========== SCHRITT 3: Error Handling ==========
  // Prüfe auf Auth-Fehler und zeige entsprechende Fehler-Seite oder leite weiter
  if (authError) {
    if (authError.type === 'user_not_registered') {
      // Benutzer ist nicht für diese App registriert
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Auth ist erforderlich, leite zum Login weiter
      navigateToLogin();
      return null;
    }
  }

  // ========== SCHRITT 4: Authentifizierte Routes ==========
  // Wrappen die Routen mit BazaarProvider (für Basar-Context)
  return (
    <BazaarProvider>
      <AppRoutes />
    </BazaarProvider>
  );
};

/**
 * AppRoutes - Definiert alle Routes für authentifizierte Benutzer
 * 
 * Route-Übersicht:
 * /select, / → BazaarSelection (Basar auswählen)
 * /admin → Admin-Dashboard (benötigt ausgewählten Basar)
 * * → PageNotFound (404)
 * 
 * Zusätzlich: Erzwingt Basar-Auswahl
 * Wenn kein Basar ausgewählt ist, leite zu /select weiter
 */
const AppRoutes = () => {
  const { selectedBazaar } = useBazaar(); // Ist ein Basar im Context ausgewählt?
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Erzwingt Basar-Auswahl
   * Wenn Benutzer zu /admin navigiert ohne vorher einen Basar auszuwählen,
   * wird er zu /select weitergeleitet
   */
  useEffect(() => {
    if (!selectedBazaar && location.pathname !== "/select") {
      navigate("/select");
    }
  }, [selectedBazaar, navigate, location.pathname]);

  return (
    <Routes>
      {/* Basar-Auswahl (kann mit /select oder / aufgerufen werden) */}
      <Route path="/select" element={<BazaarSelection />} />
      <Route path="/" element={<BazaarSelection />} />
      
      {/* Admin-Dashboard (nur mit ausgewähltem Basar erreichbar) */}
      <Route path="/admin" element={<Admin />} />
      
      {/* 404 Fehlerseite für unbekannte Routes */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

/**
 * ========== MAIN APP COMPONENT ==========
 * Schichtet alle Provider und Wrapper in der richtigen Reihenfolge
 * 
 * Provider-Reihenfolge (von außen nach innen):
 * 1. AuthProvider → Verwaltet Authentifizierung
 * 2. QueryClientProvider → Verwaltet Server-State (React Query)
 * 3. Router → React Router für Routing
 * 4. AuthenticatedApp → Verwaltet öffentliche vs. authentifizierte Routes
 * 5. Toaster → Toast-Notifications (sonner)
 */
function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster /> {/* Toast-Notification System */}
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App