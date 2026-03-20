import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, bazaarId, kasseNummer, items, cashierName, password } = body;

    if (action === "loadBazaar") {
      if (!bazaarId || typeof bazaarId !== "string" || bazaarId.length < 3) {
        return Response.json({ bazaars: [], hasPassword: false, commissionRate: 10 });
      }
      let bazaars = [], settings = [];
      try {
        [bazaars, settings] = await Promise.all([
          base44.asServiceRole.entities.Bazaar.filter({ id: bazaarId }),
          base44.asServiceRole.entities.Settings.filter({ bazaar_id: bazaarId }),
        ]);
      } catch (_) {
        return Response.json({ bazaars: [], hasPassword: false, commissionRate: 10 });
      }

      // K1: Never send the password to the client – only send a flag
      const hasPassword = settings.some((s) => s.key === "kasse_password");
      // A1: Send commissionRate from server so client never needs to read settings directly
      const commissionRate = parseFloat(settings.find((s) => s.key === "commission_rate")?.value ?? "10");
      const maxItemPrice = parseFloat(settings.find((s) => s.key === "max_item_price")?.value ?? "300");

      return Response.json({ bazaars, hasPassword, commissionRate, maxItemPrice });
    }

    if (action === "verifyPassword") {
      // K1: Password verification happens server-side
      const settings = await base44.asServiceRole.entities.Settings.filter({ bazaar_id: bazaarId });
      const stored = settings.find((s) => s.key === "kasse_password")?.value;
      // A2: Only grant access if stored password exists AND matches
      if (stored && stored === password) {
        return Response.json({ ok: true });
      }
      return Response.json({ ok: false }, { status: 401 });
    }

    if (action === "checkout") {
      // K1: Verify password before checkout if one is set
      const settings = await base44.asServiceRole.entities.Settings.filter({ bazaar_id: bazaarId });
      const storedPassword = settings.find((s) => s.key === "kasse_password")?.value;
      if (storedPassword && storedPassword !== password) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      // K2: Load commissionRate from DB, never trust the client
      const commissionRateSetting = settings.find((s) => s.key === "commission_rate");
      const commissionRate = parseFloat(commissionRateSetting?.value ?? "10");

      // M2: Basic input validation
      if (!Array.isArray(items) || items.length === 0) {
        return Response.json({ error: "No items" }, { status: 400 });
      }
      for (const item of items) {
        if (typeof item.price !== "number" || item.price <= 0 || item.price > 10000) {
          return Response.json({ error: "Invalid item price" }, { status: 400 });
        }
        const snStr = String(item.sellerNumber);
        // A6: Must be 1-3 digits, and not all zeros
        if (!/^\d{1,3}$/.test(snStr) || parseInt(snStr, 10) === 0) {
          return Response.json({ error: "Invalid seller number" }, { status: 400 });
        }
      }

      const transactionId = `TXN-${Date.now()}`;
      const now = new Date().toISOString();

      const saleRecords = items.map((item) => {
        const commissionAmount = (item.price * commissionRate) / 100;
        return {
          bazaar_id: bazaarId,
          transaction_id: transactionId,
          cash_register: kasseNummer,
          seller_number: item.sellerNumber,
          price: item.price,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          seller_payout: item.price - commissionAmount,
          transaction_completed_at: now,
          cashier_name: cashierName,
        };
      });
      await base44.asServiceRole.entities.Sale.bulkCreate(saleRecords);

      return Response.json({ transactionId });
    }

    if (action === "loadKasseSettings") {
      // K3: Load settings for internal kasse – server-side verified
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const settings = await base44.asServiceRole.entities.Settings.filter({ bazaar_id: bazaarId });
      const commissionRate = parseFloat(settings.find((s) => s.key === "commission_rate")?.value ?? "10");
      const maxItemPrice = parseFloat(settings.find((s) => s.key === "max_item_price")?.value ?? "300");
      const hasPassword = settings.some((s) => s.key === "kasse_password");
      return Response.json({ commissionRate, maxItemPrice, hasPassword });
    }

    // Admin: get settings for a bazaar (requires authenticated user with admin access)
    if (action === "getAdminSettings") {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const isGlobalAdmin = user.role === "admin";
      if (!isGlobalAdmin) {
        const accessList = await base44.asServiceRole.entities.BazaarAccess.filter({
          bazaar_id: bazaarId,
          user_email: user.email,
          role: "admin",
        });
        if (!accessList.length) return Response.json({ error: "Forbidden" }, { status: 403 });
      }
      const settings = await base44.asServiceRole.entities.Settings.filter({ bazaar_id: bazaarId });
      // Never send kasse_password value to client
      const safeSettings = settings.map((s) =>
        s.key === "kasse_password" ? { ...s, value: "***" } : s
      );
      return Response.json({ settings: safeSettings });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});