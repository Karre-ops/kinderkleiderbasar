import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminStats from "@/components/admin/AdminStats";
import SellerReport from "@/components/admin/SellerReport";
import TransactionList from "@/components/admin/TransactionList";
import CommissionSettings from "@/components/admin/CommissionSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, List, Settings, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";


export default function Admin() {
  const { user } = useAuth();

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => base44.entities.Sale.list("-transaction_completed_at", 1000),
  });

  const { data: settings = [], refetch: refetchSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.Settings.list(),
  });

  const commissionRate = parseFloat(
    settings?.find((s) => s.key === "commission_rate")?.value ?? "10"
  );

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Kein Zugriff</h2>
          <p className="text-muted-foreground mb-4">Nur Admins können diese Seite sehen.</p>
          <Link to="/">
            <Button>Zur Kasse</Button>
          </Link>
        </div>
      </div>
    );
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
            <p className="text-xs text-muted-foreground">KindermarktKasse</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Zur Kasse
            </Button>
          </Link>
          <Button
            variant="outline"
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
          </TabsList>

          <TabsContent value="sellers" className="mt-6">
            <SellerReport sales={sales} commissionRate={commissionRate} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <TransactionList sales={sales} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <CommissionSettings
              settings={settings}
              onUpdate={refetchSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}