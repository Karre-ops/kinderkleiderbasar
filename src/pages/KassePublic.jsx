import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ShoppingCart } from "lucide-react";
import ItemInputForm from "@/components/kasse/ItemInputForm.jsx";
import CurrentBill from "@/components/kasse/CurrentBill.jsx";
import CheckoutModal from "@/components/kasse/CheckoutModal.jsx";
import PasswordGate from "@/components/kasse/PasswordGate.jsx";
import { toast } from "sonner";

export default function KassePublic() {
  const itemCounter = useRef(0);
  const urlParams = new URLSearchParams(window.location.search);
  const bazaarId = urlParams.get("bazaar");
  const kasseNummer = urlParams.get("kasse") || "1";

  const [bazaar, setBazaar] = useState(null);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const [items, setItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!bazaarId) { setNotFound(true); setLoading(false); return; }
    const load = async () => {
      const res = await base44.functions.invoke("kassePublic", { action: "loadBazaar", bazaarId });
      const { bazaars, settings: settingsList } = res.data;
      if (!bazaars.length || !bazaars[0].is_active) { setNotFound(true); }
      else { setBazaar(bazaars[0]); setSettings(settingsList); }
      setLoading(false);
    };
    load();
  }, [bazaarId]);

  const commissionRate = parseFloat(settings?.find((s) => s.key === "commission_rate")?.value ?? "10");
  const kassePassword = settings?.find((s) => s.key === "kasse_password")?.value;
  const total = items.reduce((sum, i) => sum + i.price, 0);

  const handleAddItem = (sellerNumber, price) => {
    setItems((prev) => [...prev, { id: ++itemCounter, sellerNumber, price }]);
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleConfirmCheckout = async (cashierName) => {
    setIsSubmitting(true);
    const res = await base44.functions.invoke("kassePublic", {
      action: "checkout",
      bazaarId,
      kasseNummer,
      items,
      cashierName,
      commissionRate,
    });
    toast.success(`Transaktion ${res.data.transactionId} abgeschlossen!`);
    setItems([]);
    setShowCheckout(false);
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground">Basar nicht gefunden</h1>
          <p className="text-muted-foreground mt-2">Dieser Basar existiert nicht oder ist nicht aktiv.</p>
        </div>
      </div>
    );
  }

  if (kassePassword && !unlocked) {
    return <PasswordGate correctPassword={kassePassword} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">KindermarktKasse</h1>
            <p className="text-xs text-muted-foreground">{bazaar.name} · Kasse {kasseNummer}</p>
          </div>
        </div>
      </header>

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
          onConfirm={handleConfirmCheckout}
          onCancel={() => setShowCheckout(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}