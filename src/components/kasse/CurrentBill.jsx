import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CurrentBill({ items, onRemoveItem, total, commissionRate, onCheckout }) {
  const commissionTotal = (total * commissionRate) / 100;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Aktuelle Rechnung
          </h2>
          <span className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "Artikel" : "Artikel"}
          </span>
        </div>
      </div>

      {/* Items List */}
      <ScrollArea className="flex-1 px-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Noch keine Artikel</p>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Verkäufer {item.sellerNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-foreground">
                      {item.price.toFixed(2)} €
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Footer / Totals */}
      <div className="border-t border-border p-6 space-y-4">
        {items.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Zwischensumme</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Kindergarten-Anteil ({commissionRate}%)</span>
              <span className="text-accent font-medium">− {commissionTotal.toFixed(2)} €</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-xl font-bold text-foreground">
              <span>Gesamtbetrag</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>
        )}

        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full h-14 text-base font-semibold gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <CheckCircle2 className="w-5 h-5" />
          Kauf abschließen
        </Button>
      </div>
    </div>
  );
}