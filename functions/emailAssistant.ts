/**
 * Email Assistant — Immigration Portal
 *
 * Flow:
 * 1. Receives new Gmail message (via connector automation)
 * 2. Reads the full email content
 * 3. Generates a smart reply using AI
 * 4. Saves as PendingReply with unique approval_token
 * 5. Sends approval email to Mohammed with [APPROVE] / [REJECT] links
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const OWNER_EMAIL = "naname522@gmail.com";
const APPROVAL_BASE_URL = "https://app.base44.com/api/apps/6a08052b4bda806d077bcc68/functions/approveReply";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateToken(): string {
  const arr = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...arr)).replace(/[+/=]/g, "").slice(0, 32);
}

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
}

function extractBody(payload: any): string {
  if (!payload) return "";
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data)
        return decodeBase64Url(part.body.data);
    }
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        const html = decodeBase64Url(part.body.data);
        return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
  }
  return "";
}

function getHeader(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

function buildMimeEmail(opts: { to: string; from: string; subject: string; body: string }): string {
  const encodeSubject = (s: string) =>
    /[^\x00-\x7F]/.test(s)
      ? `=?UTF-8?B?${btoa(unescape(encodeURIComponent(s)))}?=`
      : s;
  return [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${encodeSubject(opts.subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    opts.body,
  ].join("\r\n");
}

// ─── AI Reply Generator (via Base44 AI proxy) ─────────────────────────────────
async function generateReply(base44: any, from: string, subject: string, emailBody: string): Promise<string> {
  const prompt = `You are a professional assistant for an immigration portal that helps people apply for USA and Canada visas and residency.

A client sent this email:
FROM: ${from}
SUBJECT: ${subject}
BODY:
${emailBody}

Write a professional, helpful, and concise reply in the SAME LANGUAGE as the client's email.
Rules:
- Be warm but formal
- Address each question specifically
- For documents: mention passport, photos, financial statements, employment letter as common requirements
- For processing time: mention 6-12 months for PR, varies by visa type
- For fees: mention government fees vary, encourage them to apply through the portal for accurate info
- For status inquiries: direct them to use the tracking system with their reference number at the portal
- Sign off as: "Immigration Portal Support Team"
- Write ONLY the email body, no subject line`;

  try {
    // Use Base44's built-in AI via the SDK
    const result = await base44.asServiceRole.ai?.generateText?.({ prompt, maxTokens: 500 });
    if (result?.text) return result.text.trim();
  } catch (_) { /* fallback */ }

  // Smart rule-based fallback
  const isArabic = /[\u0600-\u06FF]/.test(emailBody + subject);

  if (isArabic) {
    return `شكراً لتواصلك مع بوابة الهجرة،

يسعدنا الإجابة على استفساراتك:

**المستندات المطلوبة عادةً:**
- جواز سفر ساري المفعول
- صور شخصية حديثة
- كشف حساب بنكي (آخر 6 أشهر)
- خطاب عمل أو إثبات الوضع المهني
- شهادات دراسية (حسب نوع التأشيرة)

**مدة المعالجة:**
تتفاوت حسب نوع الطلب — الإقامة الدائمة عادةً من 6 إلى 12 شهراً.

**الرسوم:**
تختلف الرسوم الحكومية حسب نوع التأشيرة والدولة. يمكنك تقديم طلبك عبر البوابة للحصول على معلومات دقيقة.

لمتابعة طلبك، يرجى استخدام نظام التتبع على موقعنا بإدخال رقم المرجع الخاص بك.

مع تحياتنا،
فريق دعم بوابة الهجرة`;
  }

  return `Dear Applicant,

Thank you for reaching out to the Immigration Portal. We're happy to assist you.

**Required Documents (typically):**
- Valid passport (minimum 6 months validity)
- Recent passport-sized photos
- Bank statements (last 6 months)
- Employment letter or proof of profession
- Educational certificates (depending on visa type)

**Processing Time:**
Processing times vary by application type. Permanent Residence applications typically take 6–12 months.

**Fees:**
Government fees vary based on visa category and destination country. We recommend submitting your application through our portal for accurate, up-to-date fee information.

To track your application status, please use our tracking system on the portal with your reference number.

Best regards,
Immigration Portal Support Team`;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const messageIds: string[] = body.data?.new_message_ids ?? [];
    if (messageIds.length === 0) {
      return Response.json({ ok: true, skipped: "no new messages" });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    for (const messageId of messageIds) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        { headers: authHeader }
      );
      if (!msgRes.ok) continue;
      const message = await msgRes.json();

      const headers = message.payload?.headers || [];
      const from    = getHeader(headers, "From");
      const subject = getHeader(headers, "Subject");
      const threadId = message.threadId || "";

      // Skip owner's own emails (avoid loop)
      if (from.includes(OWNER_EMAIL)) continue;
      // Skip no-reply and automated emails
      if (from.includes("no-reply") || from.includes("noreply") || from.includes("mailer-daemon")) continue;

      const emailBody = extractBody(message.payload).slice(0, 3000);
      if (!emailBody.trim()) continue;

      // Generate reply
      const suggestedReply = await generateReply(base44, from, subject, emailBody);

      // Save PendingReply
      const token = generateToken();
      await base44.asServiceRole.entities.PendingReply.create({
        original_message_id: messageId,
        original_from: from,
        original_subject: subject,
        original_body: emailBody,
        suggested_reply: suggestedReply,
        approval_token: token,
        status: "pending",
        thread_id: threadId,
      });

      // Build approval email
      const approveUrl = `${APPROVAL_BASE_URL}?token=${token}&action=approve`;
      const rejectUrl  = `${APPROVAL_BASE_URL}?token=${token}&action=reject`;

      const approvalHtml = `
<div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #ddd;border-radius:8px;overflow:hidden">
  <div style="background:#1a3a6b;padding:20px;color:white">
    <h2 style="margin:0">📬 رد مقترح — يحتاج موافقتك</h2>
    <p style="margin:4px 0 0;opacity:0.8;font-size:13px">Immigration Portal Assistant</p>
  </div>
  <div style="padding:24px">
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:6px;color:#666;width:80px"><strong>من:</strong></td><td style="padding:6px">${from}</td></tr>
      <tr><td style="padding:6px;color:#666"><strong>الموضوع:</strong></td><td style="padding:6px">${subject}</td></tr>
    </table>

    <div style="background:#f8f9fa;border-right:4px solid #1a3a6b;padding:16px;margin-bottom:20px;border-radius:4px">
      <p style="margin:0 0 8px;font-weight:bold;color:#333">📩 رسالة العميل:</p>
      <p style="margin:0;color:#555;white-space:pre-wrap;font-size:14px">${emailBody.slice(0, 500)}${emailBody.length > 500 ? "..." : ""}</p>
    </div>

    <div style="background:#e8f4e8;border-right:4px solid #28a745;padding:16px;margin-bottom:24px;border-radius:4px">
      <p style="margin:0 0 8px;font-weight:bold;color:#333">🤖 الرد المقترح من المساعد:</p>
      <p style="margin:0;color:#333;white-space:pre-wrap;font-size:14px">${suggestedReply}</p>
    </div>

    <div style="text-align:center;margin-top:24px">
      <a href="${approveUrl}" style="background:#28a745;color:white;padding:14px 36px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;margin-left:12px">✅ وافق وأرسل</a>
      <a href="${rejectUrl}" style="background:#dc3545;color:white;padding:14px 36px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold">❌ ارفض</a>
    </div>

    <p style="text-align:center;color:#999;font-size:12px;margin-top:20px">
      لو وافقت، الرد هيتبعت مباشرة للعميل. لو رفضت، مش هيتبعت أي حاجة.
    </p>
  </div>
</div>`;

      const rawEmail = buildMimeEmail({
        to: OWNER_EMAIL,
        from: `Immigration Assistant <${OWNER_EMAIL}>`,
        subject: `[موافقة مطلوبة] رد على: ${subject}`,
        body: approvalHtml,
      });

      const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

      await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ raw: encodedEmail }),
      });

      console.log(`📧 Approval email sent to ${OWNER_EMAIL} for message from ${from}`);
    }

    return Response.json({ ok: true });

  } catch (err) {
    console.error("emailAssistant error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
