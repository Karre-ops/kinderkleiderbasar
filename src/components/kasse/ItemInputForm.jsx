import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Tag, Euro } from "lucide-react";
import { toast } from "sonner";

export default function ItemInputForm({ onAddItem }) {
  const [sellerNumber, setSellerNumber] = useState("");
  const [price, setPrice] = useState("");
  const sellerRef = useRef(null);
  const priceRef = useRef(null);

  const handleSellerKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (sellerNumber.length >= 1) {
        priceRef.current?.focus();
        priceRef.current?.select();
      }
    }
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleSellerChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    setSellerNumber(val);
    // Auto-jump to price after 3 digits
    if (val.length === 3) {
      setTimeout(() => {
        priceRef.current?.focus();
        priceRef.current?.select();
      }, 50);
    }
  };

  const handlePriceChange = (e) => {
    const val = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
    setPrice(val);
  };

  const handleAdd = () => {
    const num = sellerNumber.padStart(3, "0");
    const parsedPrice = parseFloat(price);

    if (!sellerNumber || sellerNumber.length < 1) {
      toast.error("Bitte Verkäufernummer eingeben");
      sellerRef.current?.focus();
      return;
    }
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Bitte gültigen Preis eingeben");
      priceRef.current?.focus();
      return;
    }

    onAddItem(num, parsedPrice);
    setSellerNumber("");
    setPrice("");
    setTimeout(() => sellerRef.current?.focus(), 50);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h2 className="text-base font-semibold text-foreground mb-6">Artikel erfassen</h2>

      <div className="space-y-5">
        {/* Seller Number */}
        <div className="space-y-2">
          <Label htmlFor="seller" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Verkäufernummer
          </Label>
          <Input
            id="seller"
            ref={sellerRef}
            value={sellerNumber}
            onChange={handleSellerChange}
            onKeyDown={handleSellerKeyDown}
            placeholder="z.B. 042"
            maxLength={3}
            autoFocus
            className="text-2xl font-bold h-14 tracking-widest text-center border-2 focus:border-primary transition-colors"
          />
          <p className="text-xs text-muted-foreground">3-stellige Nummer (001–999) · Enter oder Tab zum Preis</p>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Euro className="w-4 h-4 text-primary" />
            Preis (€)
          </Label>
          <Input
            id="price"
            ref={priceRef}
            value={price}
            onChange={handlePriceChange}
            onKeyDown={handlePriceKeyDown}
            placeholder="0.00"
            inputMode="decimal"
            className="text-2xl font-bold h-14 text-center border-2 focus:border-primary transition-colors"
          />
          <p className="text-xs text-muted-foreground">Enter zum Hinzufügen</p>
        </div>

        {/* Add Button */}
        <Button
          onClick={handleAdd}
          className="w-full h-12 text-base font-semibold gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Artikel hinzufügen
        </Button>
      </div>

      {/* Quick tip */}
      <div className="mt-6 p-4 bg-muted rounded-xl">
        <p className="text-xs text-muted-foreground font-medium mb-1">Schnelleingabe</p>
        <p className="text-xs text-muted-foreground">
          Nummer eingeben → Enter/Tab → Preis → Enter → nächster Artikel
        </p>
      </div>
    </div>
  );
}