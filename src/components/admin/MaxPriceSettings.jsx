import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function MaxPriceSettings({ settings, bazaarId, onUpdate }) {
  const [maxPrice, setMaxPrice] = useState("300");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const found = settings?.find((s) => s.key === "max_item_price");
    if (found) setMaxPrice(found.value);
  }, [settings]);

  const handleSave = async () => {
    const parsed = parseFloat(maxPrice);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Bitte einen gültigen Betrag eingeben");
      return;
    }
    setSaving(true);
    const existing = settings?.find((s) => s.key === "max_item_price");
    if (existing) {
      await base44.entities.Settings.update(existing.id, { value: String(parsed) });
    } else {
      await base44.entities.Settings.create({
        bazaar_id: bazaarId,
        key: "max_item_price",
        value: String(parsed),
        description: "Maximaler Einzelpreis – bei Überschreitung erscheint eine Warnung",
      });
    }
    toast.success("Einstellungen gespeichert");
    onUpdate();
    setSaving(false);
  };

  return (
    <div className="max-w-md">
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-foreground mb-1">Maximaler Einzelpreis</h3>
          <p className="text-sm text-muted-foreground">
            Liegt ein Artikel über diesem Betrag, erscheint beim Checkout eine Warnung.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-price" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Grenzwert (€)
          </Label>
          <div className="flex gap-3">
            <Input
              id="max-price"
              type="number"
              min="1"
              step="1"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="text-xl font-bold h-12 text-center w-32"
            />
            <span className="flex items-center text-2xl font-light text-muted-foreground">€</span>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
          <Save className="w-4 h-4" />
          {saving ? "Speichern..." : "Einstellungen speichern"}
        </Button>
      </div>
    </div>
  );
}