import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Trash2, ShoppingCart, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function BazaarAccessSettings({ bazaarId }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("cashier");
  const [adding, setAdding] = useState(false);

  const { data: accessList = [] } = useQuery({
    queryKey: ["bazaar-access", bazaarId],
    queryFn: () => base44.entities.BazaarAccess.filter({ bazaar_id: bazaarId }),
    enabled: !!bazaarId,
  });

  const handleAdd = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Bitte eine gültige E-Mail-Adresse eingeben");
      return;
    }
    const already = accessList.find((a) => a.user_email === email && a.role === role);
    if (already) {
      toast.error("Dieser Benutzer hat bereits diese Rolle");
      return;
    }
    setAdding(true);
    // A4: Use backend function to validate caller is admin before creating access
    await base44.functions.invoke("adminBazaar", {
      action: "addAccess",
      bazaarId,
      userEmail: email,
      role,
    });
    toast.success("Zugriff hinzugefügt");
    setEmail("");
    queryClient.invalidateQueries({ queryKey: ["bazaar-access", bazaarId] });
    setAdding(false);
  };

  const handleDelete = async (id) => {
    // A4: Use backend function to validate caller is admin before deleting access
    await base44.functions.invoke("adminBazaar", {
      action: "removeAccess",
      accessId: id,
      bazaarId,
    });
    toast.success("Zugriff entfernt");
    queryClient.invalidateQueries({ queryKey: ["bazaar-access", bazaarId] });
  };

  const roleLabel = (r) => r === "admin" ? "Admin" : "Kassierer";
  const RoleIcon = ({ r }) => r === "admin"
    ? <BarChart3 className="w-3.5 h-3.5 text-accent" />
    : <ShoppingCart className="w-3.5 h-3.5 text-primary" />;

  return (
    <div className="space-y-6">
      {/* Add new access */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Benutzer hinzufügen</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cashier">Kassierer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={adding} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Hinzufügen
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Der Benutzer muss bereits in der App registriert sein.
        </p>
      </div>

      {/* Current access list */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Zugriffsrechte</h3>
        </div>
        {accessList.length === 0 ? (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">
            Noch keine Benutzer zugewiesen.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {accessList.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <RoleIcon r={a.role} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.user_email}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel(a.role)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}