import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function KassePasswordSettings({ settings, bazaarId, onUpdate }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const found = settings?.find((s) => s.key === "kasse_password");
    if (found) setPassword(found.value);
  }, [settings]);

  const handleSave = async () => {
    if (!password) {
      toast.error("Bitte ein Passwort eingeben");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }
    setSaving(true);
    const existing = settings?.find((s) => s.key === "kasse_password");
    if (existing) {
      await base44.entities.Settings.update(existing.id, { value: password });
    } else {
      await base44.entities.Settings.create({
        bazaar_id: bazaarId,
        key: "kasse_password",
        value: password,
        description: "Passwort für den Kassen-Zugang",
      });
    }
    toast.success("Kassen-Passwort gespeichert");
    onUpdate();
    setConfirmPassword("");
    setSaving(false);
  };

  return (
    <div className="max-w-md">
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-foreground mb-1">Kassen-Passwort</h3>
          <p className="text-sm text-muted-foreground">
            Dieses Passwort wird beim Zugang zur Kassenansicht abgefragt.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kasse-password" className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Neues Passwort
          </Label>
          <div className="relative">
            <Input
              id="kasse-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kasse-password-confirm">Passwort bestätigen</Label>
          <Input
            id="kasse-password-confirm"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Passwort wiederholen"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
          <Save className="w-4 h-4" />
          {saving ? "Speichern..." : "Passwort speichern"}
        </Button>
      </div>
    </div>
  );
}