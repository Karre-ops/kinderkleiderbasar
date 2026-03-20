import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Monitor } from "lucide-react";
import { toast } from "sonner";

export default function KasseCountSettings({ settings, bazaarId, onUpdate }) {
  const [count, setCount] = useState("4");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const found = settings?.find((s) => s.key === "kasse_count");
    if (found) setCount(found.value);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const existing = settings?.find((s) => s.key === "kasse_count");
    if (existing) {
      await base44.entities.Settings.update(existing.id, { value: count });
    } else {
      await base44.entities.Settings.create({
        bazaar_id: bazaarId,
        key: "kasse_count",
        value: count,
        description: "Anzahl der Kassen",
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
          <h3 className="font-semibold text-foreground mb-1">Anzahl Kassen</h3>
          <p className="text-sm text-muted-foreground">
            Legt fest, wie viele Kassen-Links in der Basarauswahl angezeigt werden.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" />
            Anzahl Kassen
          </Label>
          <Select value={count} onValueChange={setCount}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {n === 1 ? "Kasse" : "Kassen"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
          <Save className="w-4 h-4" />
          {saving ? "Speichern..." : "Einstellungen speichern"}
        </Button>
      </div>
    </div>
  );
}