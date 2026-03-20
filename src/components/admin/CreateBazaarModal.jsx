import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CreateBazaarModal({ onCreated, onClose, userEmail }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Bitte einen Namen eingeben"); return; }
    setSaving(true);
    const bazaar = await base44.entities.Bazaar.create({ name: name.trim(), location, date: date || undefined, is_active: true });
    // Automatically give the creator admin access
    await base44.entities.BazaarAccess.create({ bazaar_id: bazaar.id, user_email: userEmail, role: "admin" });
    toast.success("Basar erstellt!");
    onCreated(bazaar);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Basar erstellen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input placeholder="z.B. Frühlings-Basar 2026" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Ort (optional)</Label>
            <Input placeholder="z.B. Gemeindehaus" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Datum (optional)</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Abbrechen</Button>
            <Button onClick={handleCreate} disabled={saving} className="flex-1">
              {saving ? "Erstelle..." : "Basar erstellen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}