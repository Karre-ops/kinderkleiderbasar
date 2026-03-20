import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, ShoppingCart, Loader2 } from "lucide-react";

export default function PasswordGate({ bazaarId, onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await base44.functions.invoke("kassePublic", {
      action: "verifyPassword",
      bazaarId,
      password: input,
    });
    setLoading(false);
    if (res.data?.ok) {
      onUnlock(input); // pass verified password back
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
              disabled={loading}
              className={error ? "border-destructive focus:border-destructive" : ""}
            />
            {error && (
              <p className="text-xs text-destructive">Falsches Passwort. Bitte erneut versuchen.</p>
            )}
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading || !input}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Zugang
          </Button>
        </form>
      </div>
    </div>
  );
}