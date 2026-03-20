import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function CheckoutModal({ items, total, commissionRate, onConfirm, onCancel, isSubmitting }) {
  const commissionTotal = (total * commissionRate) / 100;

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

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button
              onClick={() => onConfirm("Unbekannt")}
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