import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

export default function CheckoutModal({ items, total, commissionRate, maxItemPrice, onConfirm, onCancel, isSubmitting }) {
  const [cashierName, setCashierName] = useState("");
  const commissionTotal = (total * commissionRate) / 100;
  const highPriceItems = items.filter((i) => i.price > maxItemPrice);

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Kauf bestätigen</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-muted rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Artikel</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gesamtbetrag</span>
              <span className="font-bold text-foreground">{total.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kindergarten-Anteil ({commissionRate}%)</span>
              <span className="font-medium text-accent">{commissionTotal.toFixed(2)} €</span>
            </div>
          </div>

          {/* High price warning */}
          {highPriceItems.length > 0 && (
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Ungewöhnlich hoher Preis</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {highPriceItems.length === 1
                    ? `1 Artikel überschreitet den Grenzwert von ${maxItemPrice.toFixed(2)} €:`
                    : `${highPriceItems.length} Artikel überschreiten den Grenzwert von ${maxItemPrice.toFixed(2)} €:`}
                </p>
                <ul className="text-xs text-yellow-700 mt-1 space-y-0.5">
                  {highPriceItems.map((i) => (
                    <li key={i.id}>Verkäufer {i.sellerNumber}: {i.price.toFixed(2)} €</li>
                  ))}
                </ul>
                <p className="text-xs text-yellow-700 mt-2">Bitte Preis prüfen, bevor Sie bestätigen.</p>
              </div>
            </div>
          )}

          {/* Cashier Name */}
          <div className="space-y-2">
            <Label htmlFor="cashier-name">Kassierer (optional)</Label>
            <Input
              id="cashier-name"
              placeholder="Name des Kassierers"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button
              onClick={() => onConfirm(cashierName || "Unbekannt")}
              className="flex-1 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Bestätigen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}