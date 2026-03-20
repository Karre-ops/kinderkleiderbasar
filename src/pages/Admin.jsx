import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useBazaar } from "@/lib/BazaarContext";
import AdminStats from "@/components/admin/AdminStats";
import SellerReport from "@/components/admin/SellerReport";
import TransactionList from "@/components/admin/TransactionList";
import CommissionSettings from "@/components/admin/CommissionSettings";
import KassePasswordSettings from "@/components/admin/KassePasswordSettings";
import BazaarAccessSettings from "@/components/admin/BazaarAccessSettings.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, List, Settings, LogOut, ArrowLeft, Users } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const { selectedBazaar, selectedRole, clearBazaar } = useBazaar();
  const navigate = useNavigate();

  const { data: sales = [] } = useQuery({
    queryKey: ["sales", selectedBazaar?.id],
    queryFn: () => base44.entities.Sale.filter({ bazaar_id: selectedBazaar?.id }, "-transaction_completed_at", 1000),
    enabled: !!selectedBazaar,
  });

  const { data: settings = [], refetch: refetchSettings } = useQuery({
    queryKey: ["settings", selectedBazaar?.id],
    queryFn: () => base44.entities.Settings.filter({ bazaar_id: selectedBazaar?.id }),
    enabled: !!selectedBazaar,
  });

  const commissionRate = parseFloat(
    settings?.find((s) => s.key === "commission_rate")?.value ?? "10"
  );

  if (!user) {
    base44.auth.redirectToLogin("/admin");
    return null;
  }

  if (!selectedBazaar || selectedRole !== "admin") {
    navigate("/select");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Admin-Bereich</h1>
            <p className="text-xs text-muted-foreground">{selectedBazaar.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { clearBazaar(); navigate("/select"); }}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Basar wechseln
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.querySelector('[data-value="settings"]')?.click()}
            className="gap-2 text-muted-foreground"
          >
            <Settings className="w-4 h-4" />
            Einstellungen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.querySelector('[data-value="access"]')?.click()}
            className="gap-2 text-muted-foreground"
          >
            <Users className="w-4 h-4" />
            Zugriffsrechte
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => base44.auth.logout()}
            className="gap-2 text-muted-foreground"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </Button>
        </div>
      </header>



      <div className="p-6 max-w-7xl mx-auto">
        <AdminStats sales={sales} commissionRate={commissionRate} />

        <Tabs defaultValue="sellers" className="mt-8">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="sellers" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Verkäufer
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <List className="w-4 h-4" />
              Transaktionen
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Einstellungen
            </TabsTrigger>
            <TabsTrigger value="access" className="gap-2">
              <Users className="w-4 h-4" />
              Zugriffsrechte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sellers" className="mt-6">
            <SellerReport sales={sales} commissionRate={commissionRate} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <TransactionList sales={sales} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <CommissionSettings
                settings={settings}
                bazaarId={selectedBazaar.id}
                onUpdate={refetchSettings}
              />
              <KassePasswordSettings
                settings={settings}
                bazaarId={selectedBazaar.id}
                onUpdate={refetchSettings}
              />
            </div>
          </TabsContent>

          <TabsContent value="access" className="mt-6">
            <BazaarAccessSettings bazaarId={selectedBazaar.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}