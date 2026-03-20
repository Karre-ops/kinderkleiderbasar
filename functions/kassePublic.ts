import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, bazaarId, kasseNummer, items, cashierName, commissionRate } = body;

    if (action === "loadBazaar") {
      const [bazaars, settings] = await Promise.all([
        base44.asServiceRole.entities.Bazaar.filter({ id: bazaarId }),
        base44.asServiceRole.entities.Settings.filter({ bazaar_id: bazaarId }),
      ]);
      return Response.json({ bazaars, settings });
    }

    if (action === "checkout") {
      const transactionId = `TXN-${Date.now()}`;
      const now = new Date().toISOString();

      await Promise.all(
        items.map((item) => {
          const commissionAmount = (item.price * commissionRate) / 100;
          return base44.asServiceRole.entities.Sale.create({
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
          });
        })
      );

      return Response.json({ transactionId });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});