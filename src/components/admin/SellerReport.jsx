import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const num = (n) => `"${n.toFixed(2).replace(".", ",")}"`;


const downloadCSV = (content, filename) => {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function SellerReport({ sales, commissionRate }) {
  const sellerData = useMemo(() => {
    const map = {};
    sales.forEach((s) => {
      if (!map[s.seller_number]) {
        map[s.seller_number] = { sellerNumber: s.seller_number, items: 0, total: 0, commission: 0, payout: 0 };
      }
      map[s.seller_number].items += 1;
      map[s.seller_number].total += s.price || 0;
      map[s.seller_number].commission += s.commission_amount || 0;
      map[s.seller_number].payout += s.seller_payout || 0;
    });
    return Object.values(map).sort((a, b) => a.sellerNumber.localeCompare(b.sellerNumber));
  }, [sales]);

  const exportAllCSV = () => {
    const header = "Verkäufer;Artikel;Umsatz (€);Kindergarten-Anteil (€);Auszahlung (€)";
    const rows = sellerData.map(
      (s) => `${s.sellerNumber};${s.items};${num(s.total)};${num(s.commission)};${num(s.payout)}`
    );
    downloadCSV([header, ...rows].join("\n"), "verkaeuferbericht_gesamt.csv");
  };

  const exportSellerCSV = (seller) => {
    const sellerSales = sales.filter((s) => s.seller_number === seller.sellerNumber);
    const header = "Datum;Transaktion;Preis (€);Kindergarten-Anteil (€);Auszahlung (€)";
    const rows = sellerSales.map((s) =>
      `${s.transaction_completed_at ? new Date(s.transaction_completed_at).toLocaleString("de-DE") : ""};${s.transaction_id};${num(s.price || 0)};${num(s.commission_amount || 0)};${num(s.seller_payout || 0)}`
    );
    downloadCSV([header, ...rows].join("\n"), `verkaeuferbericht_${seller.sellerNumber}.csv`);
  };

  if (sellerData.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
        Noch keine Verkäufe erfasst.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Verkäufer-Abrechnung</h3>
        <Button variant="outline" size="sm" className="gap-2" onClick={exportAllCSV}>
          <Download className="w-4 h-4" />
          Gesamtübersicht exportieren
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Verkäufer</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Artikel</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Umsatz</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">
                Kindergarten ({commissionRate}%)
              </th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Auszahlung</th>
            </tr>
          </thead>
          <tbody>
            {sellerData.map((s, i) => (
              <tr key={s.sellerNumber} className={`group ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>
                <td className="px-6 py-3 font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <span>#{s.sellerNumber}</span>
                    <button
                      onClick={() => exportSellerCSV(s)}
                      title="CSV exportieren"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground">{s.items}</td>
                <td className="px-6 py-3 text-right font-medium">{s.total.toFixed(2)} €</td>
                <td className="px-6 py-3 text-right text-accent font-medium">
                  {s.commission.toFixed(2)} €
                </td>
                <td className="px-6 py-3 text-right font-bold text-foreground">
                  {s.payout.toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5 border-t border-border font-bold">
              <td className="px-6 py-3 text-foreground">Gesamt</td>
              <td className="px-6 py-3 text-right text-muted-foreground">
                {sellerData.reduce((s, r) => s + r.items, 0)}
              </td>
              <td className="px-6 py-3 text-right">
                {sellerData.reduce((s, r) => s + r.total, 0).toFixed(2)} €
              </td>
              <td className="px-6 py-3 text-right text-accent">
                {sellerData.reduce((s, r) => s + r.commission, 0).toFixed(2)} €
              </td>
              <td className="px-6 py-3 text-right">
                {sellerData.reduce((s, r) => s + r.payout, 0).toFixed(2)} €
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}