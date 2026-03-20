import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useBazaar } from "@/lib/BazaarContext";
import ItemInputForm from "@/components/kasse/ItemInputForm.jsx";
import CurrentBill from "@/components/kasse/CurrentBill.jsx";
import CheckoutModal from "@/components/kasse/CheckoutModal.jsx";
import PasswordGate from "@/components/kasse/PasswordGate.jsx";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Kasse() {
  const { user } = useAuth();
  const { selectedBazaar, selectedRole, clearBazaar } = useBazaar();
  const navigate = useNavigate();
  const itemCounter = useRef(0);

  const [items, setItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const { data: settings = [] } = useQuery({
    queryKey: ["settings", selectedBazaar?.id],
    queryFn: () => base44.entities.Settings.filter({ bazaar_id: selectedBazaar?.id }),
    enabled: !!selectedBazaar,
  });

  const commissionRate = parseFloat(
    settings?.find((s) => s.key === "commission_rate")?.value ?? "10"
  );
  const kassePassword = settings?.find((s) => s.key === "kasse_password")?.value;

  if (!user) {
    base44.auth.redirectToLogin("/");
    return null;
  }

  if (!selectedBazaar || selectedRole !== "cashier") {
    navigate("/select");
    return null;
  }

  // Password gate
  if (kassePassword && !unlocked) {
    return <PasswordGate correctPassword={kassePassword} onUnlock={() => setUnlocked(true)} />;
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
        bazaarId: selectedBazaar.id,
        kasseNummer: "intern",
        items,
        cashierName,
        commissionRate,
      });
      toast.success(`Transaktion ${res.data.transactionId} abgeschlossen!`);
      setItems([]);
      setShowCheckout(false);
    } catch (err) {
      toast.error("Fehler beim Abschluss der Transaktion. Bitte erneut versuchen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">KindermarktKasse</h1>
            <p className="text-xs text-muted-foreground">{selectedBazaar.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { clearBazaar(); navigate("/select"); }}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Basar wechseln
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => base44.auth.logout()}
            className="gap-2 text-muted-foreground"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
        {/* Left: Input Form */}
        <div className="lg:w-96 shrink-0">
          <ItemInputForm onAddItem={handleAddItem} />
        </div>

        {/* Right: Current Bill */}
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

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          items={items}
          total={total}
          commissionRate={commissionRate}
          onConfirm={handleConfirmCheckout}
          onCancel={() => setShowCheckout(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}