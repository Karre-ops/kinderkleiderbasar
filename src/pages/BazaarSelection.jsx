// Importe für React Hooks, Base44 SDK, Context-Provider, Routing und UI-Komponenten
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useBazaar } from "@/lib/BazaarContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, BarChart3, LogOut, MapPin, Calendar, Store, Plus, Link2 } from "lucide-react";
import CreateBazaarModal from "@/components/admin/CreateBazaarModal";
import { toast } from "sonner";

/**
 * BazaarSelection - Hauptseite zur Auswahl eines Basars
 * Diese Seite wird nach dem Login angezeigt und ermöglicht Benutzern:
 * - Einen Basar aus der Liste auszuwählen und zum Admin-Bereich zu navigieren
 * - Als Admin: Kassen-Links zu kopieren und neue Bazare zu erstellen
 * - Den Basar und die Rolle im lokalen BazaarContext zu speichern
 */
export default function BazaarSelection() {
  // ========== CONTEXT & ROUTING ==========
  const { user } = useAuth(); // Aktueller authentifizierter Benutzer
  const { selectBazaar } = useBazaar(); // Speichert den ausgewählten Basar im globalen Context
  const navigate = useNavigate(); // React Router Navigation

  // ========== STATE MANAGEMENT ==========
  const [bazaars, setBazaars] = useState([]); // Liste aller aktiven Bazare (gefiltert nach Zugriff)
  const [accessList, setAccessList] = useState([]); // Liste der Benutzer-Zugriffe (BazaarAccess-Records)
  const [bazaarSettings, setBazaarSettings] = useState({}); // Settings pro Basar (z.B. Anzahl der Kassen)
  const [loading, setLoading] = useState(true); // Loading-State während des initialen Datenfetching
  const [selectedBazaarId, setSelectedBazaarId] = useState(null); // ID des gerade expandierten Basars
  const [showCreate, setShowCreate] = useState(false); // Zeigt/verbirgt das Create-Basar-Modal

  /**
   * load() - Lädt alle relevanten Daten für die Basar-Auswahl
   * 1. Holt alle aktiven Bazare
   * 2. Holt die Zugriffe des aktuellen Benutzers
   * 3. Holt alle Einstellungen (z.B. Kassen-Anzahl)
   * 4. Filtert Bazare basierend auf Benutzerrolle:
   *    - Admin: Sieht ALLE Bazare
   *    - Regular User: Sieht nur Bazare mit explizitem Zugriff
   */
  const load = async () => {
    if (!user) return;
    
    // Paralleles Laden aller benötigten Daten (für bessere Performance)
    const [allBazaars, allAccess, allSettings] = await Promise.all([
      base44.entities.Bazaar.filter({ is_active: true }), // Nur aktive Bazare
      base44.entities.BazaarAccess.filter({ user_email: user.email }), // Zugriffe des Benutzers
      base44.entities.Settings.filter({ key: "kasse_count" }), // Kassen-Einstellungen
    ]);
    
    // Konvertiert Settings-Array in ein Objekt für schnelle Lookups (bazaarId -> Wert)
    const settingsMap = {};
    allSettings.forEach((s) => { settingsMap[s.bazaar_id] = s.value; });
    setBazaarSettings(settingsMap);

    // Rollenbasierte Filterung der Bazare
    if (user.role === "admin") {
      // Admins sehen ALLE Bazare und haben automatisch admin-Rolle überall
      setBazaars(allBazaars);
      setAccessList(allBazaars.map((b) => ({ bazaar_id: b.id, role: "admin" })));
    } else {
      // Reguläre Benutzer sehen nur Bazare mit explizitem Zugriff
      const accessibleIds = allAccess.map((a) => a.bazaar_id);
      setBazaars(allBazaars.filter((b) => accessibleIds.includes(b.id)));
      setAccessList(allAccess);
    }
    
    setLoading(false);
  };

  // Ladet Daten neu, wenn sich der Benutzer ändert (z.B. nach dem Login)
  useEffect(() => { load(); }, [user]);

  /**
   * getRolesForBazaar() - Bestimmt, welche Rollen der Benutzer für einen bestimmten Basar hat
   * - Admins: Haben überall die "admin"-Rolle
   * - Reguläre Benutzer: Rollen aus der BazaarAccess-Liste
   */
  const getRolesForBazaar = (bazaarId) => {
    if (user?.role === "admin") return ["admin", "cashier"];
    return accessList.filter((a) => a.bazaar_id === bazaarId).map((a) => a.role);
  };

  /**
   * handleSelect() - Verarbeitet die Auswahl eines Basars
   * 1. Speichert den Basar und die Rolle im globalen BazaarContext
   * 2. Navigiert zur Admin-Seite
   */
  const handleSelect = (bazaar, role) => {
    selectBazaar({ id: bazaar.id, name: bazaar.name }, role);
    navigate("/admin");
  };

  /**
   * handleCopyLink() - Kopiert den öffentlichen Kassen-Link in die Zwischenablage
   * Der Link führt zur öffentlichen KassePublic-Seite mit Basar- und Kassen-ID
   * (z.B. /kasse?bazaar=abc123&kasse=1)
   */
  const handleCopyLink = (bazaar, kasseNummer) => {
    const url = `${window.location.origin}/kasse?bazaar=${bazaar.id}&kasse=${kasseNummer}`;
    navigator.clipboard.writeText(url); // Kopiert URL in Zwischenablage
    toast.success(`Kassen-Link ${kasseNummer} kopiert!`); // Toast-Benachrichtigung
  };

  /**
   * handleBazaarCreated() - Callback nach erfolgreicher Basar-Erstellung
   * Schließt das Modal und lädt die Basar-Liste neu
   */
  const handleBazaarCreated = (bazaar) => {
    setShowCreate(false); // Modal schließen
    load(); // Daten neu laden
  };

  // Zeige nichts, bis der Benutzer geladen ist
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ========== HEADER ==========
          Zeigt Logo, App-Name und Abmelden-Button */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">KindermarktKasse</h1>
            <p className="text-xs text-muted-foreground">Basar auswählen</p>
          </div>
        </div>
        {/* Abmelden-Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => base44.auth.logout()}
          className="gap-2 text-muted-foreground"
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </Button>
      </header>

      {/* ========== MAIN CONTENT AREA ========== */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Willkommens-Bereich mit Benutzer-Name und "Neuer Basar"-Button */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Willkommen, {user.full_name}!</h2>
              <p className="text-muted-foreground mt-1">Wähle einen Basar oder erstelle einen neuen</p>
            </div>
            {/* Button zum Öffnen des Create-Basar-Modals (nur für Admins sichtbar) */}
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Neuer Basar
            </Button>
          </div>

          {/* ========== LOADING STATE ========== */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
          ) : bazaars.length === 0 ? (
            /* ========== EMPTY STATE ========== */
            <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
              <Store className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Noch kein Basar vorhanden</p>
              <p className="text-sm mt-1">Erstelle deinen ersten Basar!</p>
              <Button onClick={() => setShowCreate(true)} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Basar erstellen
              </Button>
            </div>
          ) : (
            /* ========== BAZAAR LISTE ========== */
            <div className="space-y-4">
              {bazaars.map((bazaar) => {
                const roles = getRolesForBazaar(bazaar.id); // Rollen des Benutzers für diesen Basar
                const isSelected = selectedBazaarId === bazaar.id; // Ist dieser Basar gerade expandiert?
                return (
                  <div key={bazaar.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                    {/* Basar-Header (anklickbar zum Expandieren) */}
                    <button
                      className="w-full text-left px-6 py-4 hover:bg-muted/30 transition-colors"
                      onClick={() => setSelectedBazaarId(isSelected ? null : bazaar.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{bazaar.name}</h3>
                          {/* Ort und Datum des Basars (falls vorhanden) */}
                          <div className="flex items-center gap-4 mt-1">
                            {bazaar.location && (
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {bazaar.location}
                              </span>
                            )}
                            {bazaar.date && (
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(bazaar.date).toLocaleDateString("de-DE")}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Expand/Collapse-Pfeil */}
                        <div className="text-muted-foreground text-sm">{isSelected ? "▲" : "▼"}</div>
                      </div>
                    </button>

                    {/* Expandierter Bereich mit Aktionen (nur sichtbar wenn isSelected = true) */}
                    {isSelected && (
                      <div className="border-t border-border px-6 py-4 bg-muted/20 space-y-3">
                        {/* Action-Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                           {/* Admin-Button (nur sichtbar wenn Benutzer Admin-Zugriff hat) */}
                           {roles.includes("admin") && (
                             <Button
                               className="flex-1 h-14 text-base gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                               onClick={() => handleSelect(bazaar, "admin")}
                             >
                               <BarChart3 className="w-5 h-5" />
                               Admin-Bereich
                             </Button>
                           )}
                         </div>
                        {/* Kassen-Links Sektion (nur für Admins) */}
                        {roles.includes("admin") && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Kassen-Links kopieren:</p>
                            {/* Generiert Buttons für jede Kasse basierend auf der kasse_count-Einstellung */}
                            <div className="grid grid-cols-2 gap-2">
                              {Array.from({ length: Math.max(1, parseInt(bazaarSettings[bazaar.id] ?? "4") || 4) }, (_, i) => i + 1).map((nr) => (
                                <Button
                                  key={nr}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 text-muted-foreground"
                                  onClick={() => handleCopyLink(bazaar, nr)}
                                >
                                  <Link2 className="w-4 h-4" />
                                  Kasse {nr}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========== CREATE BAZAAR MODAL ========== */}
      {/* Modal wird angezeigt, wenn showCreate = true */}
      {showCreate && (
        <CreateBazaarModal
          userEmail={user.email}
          onCreated={handleBazaarCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}