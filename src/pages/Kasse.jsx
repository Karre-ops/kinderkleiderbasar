import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ItemInputForm from "@/components/kasse/ItemInputForm";
import CurrentBill from "@/components/kasse/CurrentBill";
import CheckoutModal from "@/components/kasse/CheckoutModal";
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Kasse() {
  const [items, setItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.Settings.list(),
    initialData: [],
  });

  const commissionRate = parseFloat(
    settingsData?.find((s) => s.key === "commission_rate")?.value ?? "10"
  );

  const addItem = (sellerNumber, price) => {
    setItems((prev) => [...prev, { sellerNumber, price, id: Date.now() }]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Keine Artikel im Warenkorb");
      return;
    }
    setShowCheckout(true);
  };

  const confirmCheckout = async (cashierName, registerName) => {
    setIsSubmitting(true);
    const transactionId = `TXN-${Date.now()}`;
    const completedAt = new Date().toISOString();

    try {
      const salesData = items.map((item) => {
        const commissionAmount = (item.price * commissionRate) / 100;
        return {
          transaction_id: transactionId,
          cash_register: registerName,
          seller_number: item.sellerNumber,
          price: item.price,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          seller_payout: item.price - commissionAmount,
          transaction_completed_at: completedAt,
          cashier_name: cashierName,
        };
      });

      await base44.entities.Sale.bulkCreate(salesData);
      toast.success(`Kauf abgeschlossen! ${items.length} Artikel gespeichert.`);
      setItems([]);
      setShowCheckout(false);
    } catch (e) {
      toast.error("Fehler beim Speichern: " + e.message);
      setShowCheckout(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">KindermarktKasse</h1>
            <p className="text-xs text-muted-foreground">Kassierer-Ansicht</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Provision: <span className="font-medium text-foreground">{commissionRate}%</span>
          </span>
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

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-73px)]">
        {/* Left: Input Form */}
        <div className="lg:w-1/2 p-6 flex flex-col gap-6">
          <ItemInputForm onAddItem={addItem} />
        </div>

        {/* Right: Current Bill */}
        <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col">
          <CurrentBill
            items={items}
            onRemoveItem={removeItem}
            total={total}
            commissionRate={commissionRate}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          items={items}
          total={total}
          commissionRate={commissionRate}
          onConfirm={confirmCheckout}
          onCancel={() => setShowCheckout(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}