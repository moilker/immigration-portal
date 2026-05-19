/**
 * Immigration Portal — Secure Application Tracker
 * 
 * - Looks up application by reference number
 * - Returns MASKED sensitive data (passport shows only last 3 chars)
 * - Never exposes encrypted raw values to the client
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const { reference_number } = await req.json().catch(() => ({}));

    if (!reference_number?.trim()) {
      return Response.json({ error: "reference_number is required" }, { status: 400, headers: corsHeaders });
    }

    const results = await base44.asServiceRole.entities.ImmigrationApplication.filter({
      reference_number: reference_number.trim().toUpperCase(),
    });

    if (!results || results.length === 0) {
      return Response.json({ error: "Application not found" }, { status: 404, headers: corsHeaders });
    }

    const app = results[0];

    // Return safe (masked) version — never expose encrypted fields raw
    return Response.json({
      success: true,
      application: {
        reference_number: app.reference_number,
        full_name: app.full_name,
        destination_country: app.destination_country,
        visa_type: app.visa_type,
        nationality: app.nationality,
        status: app.status,
        passport_masked: app.passport_number ? "***" + (app.passport_number.slice(-3) || "") : "N/A",
        submitted_at: app.created_date,
        updated_at: app.updated_date,
      },
    }, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
});
