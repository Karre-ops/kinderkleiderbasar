import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useBazaar } from "@/lib/BazaarContext";
import KasseBase from "@/components/kasse/KasseBase.jsx";
import { INTERNAL_KASSE_NUMBER } from "@/lib/kasseConstants";

export default function Kasse() {
  const { user } = useAuth();
  const { selectedBazaar, selectedRole, clearBazaar } = useBazaar();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      base44.auth.redirectToLogin("/");
    } else if (!selectedBazaar || selectedRole !== "cashier") {
      navigate("/select");
    }
  }, [user, selectedBazaar, selectedRole, navigate]);

  if (!user || !selectedBazaar || selectedRole !== "cashier") {
    return null;
  }

  const loadSettings = async () => {
    const res = await base44.functions.invoke("kassePublic", {
      action: "loadKasseSettings",
      bazaarId: selectedBazaar.id,
    });
    return res.data;
  };

  return (
    <KasseBase
      bazaarId={selectedBazaar.id}
      kasseNummer={INTERNAL_KASSE_NUMBER}
      bazaarName={selectedBazaar.name}
      loadSettings={loadSettings}
      showLogout={true}
      onSwitchBazaar={() => {
        clearBazaar();
        navigate("/select");
      }}
    />
  );
}