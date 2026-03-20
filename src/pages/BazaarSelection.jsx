import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useBazaar } from "@/lib/BazaarContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, BarChart3, LogOut, MapPin, Calendar, Store, Plus, Link2 } from "lucide-react";
import CreateBazaarModal from "@/components/admin/CreateBazaarModal";
import { toast } from "sonner";

export default function BazaarSelection() {
  const { user } = useAuth();
  const { selectBazaar } = useBazaar();
  const navigate = useNavigate();

  const [bazaars, setBazaars] = useState([]);
  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBazaarId, setSelectedBazaarId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    if (!user) return;
    const [allBazaars, allAccess] = await Promise.all([
      base44.entities.Bazaar.filter({ is_active: true }),
      base44.entities.BazaarAccess.filter({ user_email: user.email }),
    ]);
    if (user.role === "admin") {
      setBazaars(allBazaars);
      setAccessList(allBazaars.map((b) => ({ bazaar_id: b.id, role: "admin" })));
    } else {
      const accessibleIds = allAccess.map((a) => a.bazaar_id);
      setBazaars(allBazaars.filter((b) => accessibleIds.includes(b.id)));
      setAccessList(allAccess);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const getRolesForBazaar = (bazaarId) => {
    if (user?.role === "admin") return ["admin", "cashier"];
    return accessList.filter((a) => a.bazaar_id === bazaarId).map((a) => a.role);
  };

  const handleSelect = (bazaar, role) => {
    selectBazaar({ id: bazaar.id, name: bazaar.name }, role);
    if (role === "admin") navigate("/admin");
    else navigate("/");
  };

  const handleCopyLink = (bazaar, kasseNummer) => {
    const url = `${window.location.origin}/kasse?bazaar=${bazaar.id}&kasse=${kasseNummer}`;
    navigator.clipboard.writeText(url);
    toast.success(`Kassen-Link ${kasseNummer} kopiert!`);
  };

  const handleBazaarCreated = (bazaar) => {
    setShowCreate(false);
    load();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Willkommen, {user.full_name}!</h2>
              <p className="text-muted-foreground mt-1">Wähle einen Basar oder erstelle einen neuen</p>
            </div>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Neuer Basar
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
          ) : bazaars.length === 0 ? (
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
            <div className="space-y-4">
              {bazaars.map((bazaar) => {
                const roles = getRolesForBazaar(bazaar.id);
                const isSelected = selectedBazaarId === bazaar.id;
                return (
                  <div key={bazaar.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                    <button
                      className="w-full text-left px-6 py-4 hover:bg-muted/30 transition-colors"
                      onClick={() => setSelectedBazaarId(isSelected ? null : bazaar.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{bazaar.name}</h3>
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
                        <div className="text-muted-foreground text-sm">{isSelected ? "▲" : "▼"}</div>
                      </div>
                    </button>

                    {isSelected && (
                      <div className="border-t border-border px-6 py-4 bg-muted/20 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                          {roles.includes("cashier") && (
                            <Button
                              className="flex-1 h-14 text-base gap-2 bg-primary hover:bg-primary/90"
                              onClick={() => handleSelect(bazaar, "cashier")}
                            >
                              <ShoppingCart className="w-5 h-5" />
                              Als Kasse anmelden
                            </Button>
                          )}
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
                        {roles.includes("admin") && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Kassen-Links kopieren:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {[1, 2, 3, 4].map((nr) => (
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