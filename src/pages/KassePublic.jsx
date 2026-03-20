import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import KasseBase from "@/components/kasse/KasseBase.jsx";
import { ShoppingCart } from "lucide-react";
import { BAZAAR_ID_MIN_LENGTH } from "@/lib/kasseConstants";

export default function KassePublic() {
  const urlParams = new URLSearchParams(window.location.search);
  const bazaarId = urlParams.get("bazaar");
  const kasseNummer = urlParams.get("kasse") || "1";

  const [bazaarData, setBazaarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!bazaarId || bazaarId.length < BAZAAR_ID_MIN_LENGTH) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await base44.functions.invoke("kassePublic", {
          action: "loadBazaar",
          bazaarId,
        });
        const { bazaars } = res.data;
        if (!bazaars.length || !bazaars[0].is_active) {
          setNotFound(true);
        } else {
          setBazaarData(bazaars[0]);
        }
      } catch (err) {
        console.error("Error loading bazaar:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bazaarId]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground">Basar nicht gefunden</h1>
          <p className="text-muted-foreground mt-2">Dieser Basar existiert nicht oder ist nicht aktiv.</p>
        </div>
      </div>
    );
  }

  const loadSettings = async () => {
    const res = await base44.functions.invoke("kassePublic", {
      action: "loadBazaar",
      bazaarId,
    });
    const { hasPassword, commissionRate, maxItemPrice } = res.data;
    return {
      hasPassword: !!hasPassword,
      commissionRate: commissionRate ?? 10,
      maxItemPrice: maxItemPrice ?? 300,
    };
  };

  return (
    <KasseBase
      bazaarId={bazaarId}
      kasseNummer={kasseNummer}
      bazaarName={bazaarData?.name || "Basar"}
      loadSettings={loadSettings}
      showLogout={false}
    />
  );
}