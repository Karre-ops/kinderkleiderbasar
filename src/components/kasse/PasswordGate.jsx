import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, ShoppingCart } from "lucide-react";

export default function PasswordGate({ correctPassword, onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === correctPassword) {
      onUnlock();
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-lg p-8 w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">KindermarktKasse</h1>
          <p className="text-sm text-muted-foreground text-center">Bitte Kassen-Passwort eingeben</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gate-password" className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Passwort
            </Label>
            <Input
              id="gate-password"
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className={error ? "border-destructive focus:border-destructive" : ""}
            />
            {error && (
              <p className="text-xs text-destructive">Falsches Passwort. Bitte erneut versuchen.</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Zugang
          </Button>
        </form>
      </div>
    </div>
  );
}