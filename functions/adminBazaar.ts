import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// A3/A4: All sensitive admin mutations go through this function.
// The caller must be authenticated AND must have an admin BazaarAccess record for the given bazaarId.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, bazaarId } = body;

    if (!bazaarId) {
      return Response.json({ error: 'bazaarId required' }, { status: 400 });
    }

    // Verify caller is admin for this bazaar (or global app admin)
    const isGlobalAdmin = user.role === 'admin';
    if (!isGlobalAdmin) {
      const accessList = await base44.asServiceRole.entities.BazaarAccess.filter({
        bazaar_id: bazaarId,
        user_email: user.email,
        role: 'admin',
      });
      if (!accessList.length) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // --- Actions ---

    if (action === 'addAccess') {
      const { userEmail, role } = body;
      if (!userEmail || !['admin', 'cashier'].includes(role)) {
        return Response.json({ error: 'Invalid input' }, { status: 400 });
      }
      const created = await base44.asServiceRole.entities.BazaarAccess.create({
        bazaar_id: bazaarId,
        user_email: userEmail,
        role,
      });
      return Response.json({ ok: true, record: created });
    }

    if (action === 'removeAccess') {
      const { accessId } = body;
      if (!accessId) {
        return Response.json({ error: 'accessId required' }, { status: 400 });
      }
      // Extra guard: ensure the access record belongs to this bazaar
      const records = await base44.asServiceRole.entities.BazaarAccess.filter({ id: accessId, bazaar_id: bazaarId });
      if (!records.length) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }
      await base44.asServiceRole.entities.BazaarAccess.delete(accessId);
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});