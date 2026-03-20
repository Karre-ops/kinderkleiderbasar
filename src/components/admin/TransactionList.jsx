import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function TransactionList({ sales }) {
  const grouped = useMemo(() => {
    const map = {};
    sales.forEach((s) => {
      const tid = s.transaction_id || "—";
      if (!map[tid]) map[tid] = { id: tid, items: [], completedAt: s.transaction_completed_at, cashier: s.cashier_name, register: s.cash_register };
      map[tid].items.push(s);
    });
    return Object.values(map).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }, [sales]);

  const num = (n) => `"${n.toFixed(2).replace(".", ",")}"`;


  const exportCSV = () => {
    const header = "Transaktions-ID;Kasse;Kassierer;Zeitpunkt;Verkäufer;Preis (€);Kindergarten (€)";
    const rows = sales.map(
      (s) =>
        `${s.transaction_id};${s.cash_register};${s.cashier_name};${s.transaction_completed_at};${s.seller_number};${num(s.price || 0)};${num(s.commission_amount || 0)}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transaktionen.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (grouped.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
        Noch keine Transaktionen vorhanden.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
          <Download className="w-4 h-4" />
          CSV Export
        </Button>
      </div>
      <div className="space-y-3">
        {grouped.map((txn) => {
          const total = txn.items.reduce((s, i) => s + (i.price || 0), 0);
          const commission = txn.items.reduce((s, i) => s + (i.commission_amount || 0), 0);
          const dateStr = txn.completedAt
            ? format(new Date(txn.completedAt), "dd.MM.yyyy HH:mm", { locale: de })
            : "—";
          return (
            <div key={txn.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Transaction Header */}
              <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-muted/30 border-b border-border gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">{txn.id}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{txn.register || "—"}</span>
                  {txn.cashier && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{txn.cashier}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{dateStr}</span>
                  <span className="text-sm font-bold text-foreground">{total.toFixed(2)} €</span>
                  <span className="text-xs text-accent font-medium">KG: {commission.toFixed(2)} €</span>
                </div>
              </div>
              {/* Items */}
              <div className="divide-y divide-border">
                {txn.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-2 text-sm">
                    <span className="text-muted-foreground">Verkäufer <span className="font-semibold text-foreground">#{item.seller_number}</span></span>
                    <span className="font-medium">{(item.price || 0).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}