import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Percent } from "lucide-react";
import { toast } from "sonner";

export default function CommissionSettings({ settings, onUpdate }) {
  const [rate, setRate] = useState("10");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const found = settings?.find((s) => s.key === "commission_rate");
    if (found) setRate(found.value);
  }, [settings]);

  const handleSave = async () => {
    const parsed = parseFloat(rate);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast.error("Bitte einen Wert zwischen 0 und 100 eingeben");
      return;
    }
    setSaving(true);
    const existing = settings?.find((s) => s.key === "commission_rate");
    if (existing) {
      await base44.entities.Settings.update(existing.id, { value: String(parsed) });
    } else {
      await base44.entities.Settings.create({
        key: "commission_rate",
        value: String(parsed),
        description: "Prozentualer Anteil für den Kindergarten",
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
          <h3 className="font-semibold text-foreground mb-1">Kindergarten-Provision</h3>
          <p className="text-sm text-muted-foreground">
            Dieser Prozentsatz wird vom Verkaufspreis als Spende für den Kindergarten einbehalten.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commission" className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-primary" />
            Provisionssatz (%)
          </Label>
          <div className="flex gap-3">
            <Input
              id="commission"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="text-xl font-bold h-12 text-center w-32"
            />
            <span className="flex items-center text-2xl font-light text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Beispiel: Bei 10% und 5,00 € Verkaufspreis gehen 0,50 € an den Kindergarten.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
          <Save className="w-4 h-4" />
          {saving ? "Speichern..." : "Einstellungen speichern"}
        </Button>
      </div>
    </div>
  );
}