import { useMemo } from "react";
import { Euro, Users, ShoppingCart, Heart } from "lucide-react";

export default function AdminStats({ sales, commissionRate }) {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, s) => sum + (s.price || 0), 0);
    const totalCommission = sales.reduce((sum, s) => sum + (s.commission_amount || 0), 0);
    const uniqueSellers = new Set(sales.map((s) => s.seller_number)).size;
    const uniqueTransactions = new Set(sales.map((s) => s.transaction_id)).size;
    return { totalRevenue, totalCommission, uniqueSellers, uniqueTransactions };
  }, [sales]);

  const cards = [
    {
      label: "Gesamtumsatz",
      value: `${stats.totalRevenue.toFixed(2)} €`,
      icon: Euro,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Verkäufer aktiv",
      value: stats.uniqueSellers,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Transaktionen",
      value: stats.uniqueTransactions,
      icon: ShoppingCart,
      color: "bg-violet-100 text-violet-600",
    },
    {
      label: "Kindergarten-Anteil",
      value: `${stats.totalCommission.toFixed(2)} €`,
      icon: Heart,
      color: "bg-accent/15 text-accent",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
  );
}