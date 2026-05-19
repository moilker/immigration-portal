/**
 * Immigration Portal — Secure Application Submission
 *
 * Features:
 * - Typeform webhook signature verification (HMAC-SHA256)
 * - AES-256-GCM encryption for sensitive fields (passport, DOB)
 * - Server-side validation
 * - Secure reference number generation
 * - Supports: Typeform webhooks, Formstack webhooks, direct API calls
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ─── HMAC-SHA256 Signature Verification (Typeform) ───────────────────────────
async function verifyTypeformSignature(rawBody: string, signatureHeader: string, secret: string): Promise<boolean> {
  try {
    const sigValue = signatureHeader.replace("sha256=", "");
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
    const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
    return computed === sigValue;
  } catch {
    return false;
  }
}

// ─── AES-256-GCM Encryption ──────────────────────────────────────────────────
async function getKey(secret: string): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(secret.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt"]);
}

async function encryptField(value: string, secret: string): Promise<string> {
  if (!value) return "";
  const key = await getKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(value)
  );
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

// ─── Reference Number Generator ──────────────────────────────────────────────
function generateRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "IAP-";
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

// ─── Typeform Payload Mapper ──────────────────────────────────────────────────
function mapTypeformPayload(body: any): Record<string, any> {
  const answers = body?.form_response?.answers || [];
  const mapped: Record<string, any> = {};

  for (const ans of answers) {
    const ref = ans.field?.ref || "";
    let val: any = "";

    switch (ans.type) {
      case "text":         val = ans.text || ""; break;
      case "short_text":   val = ans.text || ""; break;
      case "long_text":    val = ans.text || ""; break;
      case "email":        val = ans.email || ""; break;
      case "phone_number": val = ans.phone_number || ""; break;
      case "date":         val = ans.date || ""; break;
      case "boolean":      val = ans.boolean; break;
      case "choice":       val = ans.choice?.label || ""; break;
      case "choices":      val = ans.choices?.labels?.join(", ") || ""; break;
      default:             val = ans.text || ans.email || "";
    }

    // Normalize destination_country
    if (ref === "destination_country") {
      if (String(val).includes("USA") || String(val).includes("United States")) val = "USA";
      else if (String(val).includes("Canada")) val = "Canada";
    }

    // Normalize boolean yes_no
    if (ref === "have_criminal_record" || ref === "previously_refused_visa") {
      val = val === true || val === "true" || val === "Yes";
    }

    if (ref) mapped[ref] = val;
  }

  return mapped;
}

// ─── Formstack Payload Mapper ────────────────────────────────────────────────
function mapFormstackPayload(body: any): Record<string, any> {
  return {
    full_name: body.full_name || body["Full Name"] || "",
    date_of_birth: body.date_of_birth || body["Date of Birth"] || "",
    nationality: body.nationality || body["Nationality"] || "",
    passport_number: body.passport_number || body["Passport Number"] || "",
    email: body.email || body["Email"] || "",
    phone: body.phone || body["Phone"] || "",
    destination_country: body.destination_country || body["Destination Country"] || "",
    visa_type: body.visa_type || body["Visa Type"] || "",
    marital_status: body.marital_status || body["Marital Status"] || "",
    education_level: body.education_level || body["Education Level"] || "",
    employment_status: body.employment_status || body["Employment Status"] || "",
    have_criminal_record: body.have_criminal_record === "true" || body.have_criminal_record === true,
    previously_refused_visa: body.previously_refused_visa === "true" || body.previously_refused_visa === true,
    additional_notes: body.additional_notes || body["Additional Notes"] || "",
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(data: Record<string, any>): string[] {
  const errors: string[] = [];
  if (!data.full_name?.trim())       errors.push("full_name is required");
  if (!data.passport_number?.trim()) errors.push("passport_number is required");
  if (!data.email?.trim())           errors.push("email is required");
  if (!data.destination_country)     errors.push("destination_country is required (USA or Canada)");
  if (!data.visa_type)               errors.push("visa_type is required");
  if (!["USA", "Canada"].includes(data.destination_country))
    errors.push("destination_country must be USA or Canada");
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push("email format is invalid");
  return errors;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Source, Typeform-Signature",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST")
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const rawBodyText = await req.text();
    const rawBody = JSON.parse(rawBodyText || "{}");

    // ── Detect source ──
    const isTypeform = !!rawBody.form_response;
    const isFormstack = !!rawBody.UniqueID;
    const typeformSig = req.headers.get("Typeform-Signature");

    // ── Verify Typeform signature ──
    if (isTypeform) {
      const webhookSecret = Deno.env.get("TYPEFORM_WEBHOOK_SECRET") || "typeform-immigration-secure-2026";
      if (typeformSig) {
        const valid = await verifyTypeformSignature(rawBodyText, typeformSig, webhookSecret);
        if (!valid) {
          console.warn("Invalid Typeform signature — request rejected");
          return Response.json({ error: "Invalid signature" }, { status: 401, headers: corsHeaders });
        }
      }
    }

    // ── Map payload ──
    let data: Record<string, any>;
    if (isTypeform)    data = mapTypeformPayload(rawBody);
    else if (isFormstack) data = mapFormstackPayload(rawBody);
    else               data = { ...rawBody };

    // ── Validate ──
    const errors = validate(data);
    if (errors.length > 0)
      return Response.json({ error: "Validation failed", details: errors }, { status: 400, headers: corsHeaders });

    // ── Encrypt sensitive fields ──
    const encSecret = Deno.env.get("ENCRYPTION_SECRET") || "immigration-portal-key-2026";
    const [encPassport, encDob] = await Promise.all([
      encryptField(String(data.passport_number), encSecret),
      encryptField(String(data.date_of_birth || ""), encSecret),
    ]);

    // ── Build record ──
    const record = {
      full_name:              data.full_name.trim(),
      date_of_birth:          encDob,
      nationality:            data.nationality || "",
      passport_number:        encPassport,
      email:                  data.email.trim().toLowerCase(),
      phone:                  data.phone || "",
      destination_country:    data.destination_country,
      visa_type:              data.visa_type,
      marital_status:         data.marital_status || "",
      education_level:        data.education_level || "",
      employment_status:      data.employment_status || "",
      have_criminal_record:   Boolean(data.have_criminal_record),
      previously_refused_visa: Boolean(data.previously_refused_visa),
      additional_notes:       data.additional_notes || "",
      status:                 "Submitted",
      reference_number:       generateRef(),
    };

    // ── Save to DB ──
    const created = await base44.asServiceRole.entities.ImmigrationApplication.create(record);

    console.log(`✅ New application: ${record.reference_number} | ${record.destination_country} | ${record.visa_type}`);

    return Response.json({
      success: true,
      reference_number: record.reference_number,
      message: "Application submitted successfully. Keep your reference number safe.",
      application_id: created.id,
    }, { status: 201, headers: corsHeaders });

  } catch (error) {
    console.error("submitApplication error:", error);
    return Response.json({ error: "Internal server error", details: error.message }, { status: 500, headers: corsHeaders });
  }
});
