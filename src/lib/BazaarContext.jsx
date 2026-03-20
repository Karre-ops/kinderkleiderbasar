import { createContext, useContext, useState, useEffect } from "react";

const BazaarContext = createContext(null);

export function BazaarProvider({ children }) {
  const [selectedBazaar, setSelectedBazaar] = useState(null); // { id, name }
  const [selectedRole, setSelectedRole] = useState(null); // "admin" | "cashier"

  useEffect(() => {
    const stored = localStorage.getItem("bazaar_session");
    if (stored) {
      try {
        const { bazaar, role } = JSON.parse(stored);
        setSelectedBazaar(bazaar);
        setSelectedRole(role);
      } catch {
        localStorage.removeItem("bazaar_session");
      }
    }
  }, []);

  const selectBazaar = (bazaar, role) => {
    setSelectedBazaar(bazaar);
    setSelectedRole(role);
    localStorage.setItem("bazaar_session", JSON.stringify({ bazaar, role }));
  };

  const clearBazaar = () => {
    setSelectedBazaar(null);
    setSelectedRole(null);
    localStorage.removeItem("bazaar_session");
  };

  return (
    <BazaarContext.Provider value={{ selectedBazaar, selectedRole, selectBazaar, clearBazaar }}>
      {children}
    </BazaarContext.Provider>
  );
}

export function useBazaar() {
  const ctx = useContext(BazaarContext);
  if (!ctx) throw new Error("useBazaar must be used within BazaarProvider");
  return ctx;
}