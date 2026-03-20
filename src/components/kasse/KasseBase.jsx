import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import ItemInputForm from "@/components/kasse/ItemInputForm.jsx";
import CurrentBill from "@/components/kasse/CurrentBill.jsx";
import CheckoutModal from "@/components/kasse/CheckoutModal.jsx";
import PasswordGate from "@/components/kasse/PasswordGate.jsx";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function KasseBase({
  bazaarId,
  kasseNummer,
  bazaarName,
  loadSettings,
  showLogout = false,
  onSwitchBazaar = null,
}) {
  const itemCounter = useRef(0);
  const sessionPasswordRef = useRef(null);

  const [items, setItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [settings, setSettings] = useState(null);
  const [settingsError, setSettingsError] = useState(false);

  const loadSettingsData = async () => {
    try {
      const result = await loadSettings();
      setSettings(result);
    } catch (err) {
      console.error("Error loading settings:", err);
      setSettingsError(true);
      setSettings({ commissionRate: 10, maxItemPrice: 300, hasPassword: false });
    }
  };

  // Load settings on mount
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  if (!settingsLoaded) {
    loadSettingsData();
    setSettingsLoaded(true);
  }

  const commissionRate = settings?.commissionRate ?? 10;
  const maxItemPrice = settings?.maxItemPrice ?? 300;
  const hasPassword = settings?.hasPassword ?? false;

  if (!settings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Password gate
  if (hasPassword && !unlocked) {
    return (
      <PasswordGate
        bazaarId={bazaarId}
        onUnlock={(pw) => {
          sessionPasswordRef.current = pw;
          setUnlocked(true);
        }}
      />
    );
  }

  const total = items.reduce((sum, i) => sum + i.price, 0);

  const handleAddItem = (sellerNumber, price) => {
    setItems((prev) => [...prev, { id: ++itemCounter.current, sellerNumber, price }]);
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleConfirmCheckout = async (cashierName) => {
    setIsSubmitting(true);
    try {
      const res = await base44.functions.invoke("kassePublic", {
        action: "checkout",
        bazaarId,
        kasseNummer,
        items,
        cashierName,
        password: sessionPasswordRef.current,
      });
      toast.success(`Transaktion ${res.data.transactionId} abgeschlossen!`);
      setItems([]);
      setShowCheckout(false);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Passwort falsch. Bitte Zugang erneut durchführen.");
      } else {
        toast.error("Fehler beim Abschluss der Transaktion. Bitte erneut versuchen.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">KindermarktKasse</h1>
            <p className="text-xs text-muted-foreground">
              {bazaarName}
              {kasseNummer !== "intern" && ` · Kasse ${kasseNummer}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onSwitchBazaar && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchBazaar}
              className="gap-2 text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Basar wechseln
            </Button>
          )}
          {showLogout && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => base44.auth.logout()}
              className="gap-2 text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
              Abmelden
            </Button>
          )}
        </div>
      </header>

      {settingsError && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Einstellungen konnten nicht geladen werden. Standardwerte werden verwendet.
          </p>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
        <div className="lg:w-96 shrink-0">
          <ItemInputForm onAddItem={handleAddItem} />
        </div>
        <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
          <CurrentBill
            items={items}
            onRemoveItem={handleRemoveItem}
            total={total}
            commissionRate={commissionRate}
            onCheckout={() => setShowCheckout(true)}
          />
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          items={items}
          total={total}
          commissionRate={commissionRate}
          maxItemPrice={maxItemPrice}
          onConfirm={handleConfirmCheckout}
          onCancel={() => setShowCheckout(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}