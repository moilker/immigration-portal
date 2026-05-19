/**
 * Approve or Reject Reply — Immigration Portal
 *
 * Called when Mohammed clicks Approve or Reject in the approval email.
 * - approve: sends the suggested reply to the original sender via Gmail
 * - reject: marks as rejected, does nothing
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function buildMimeEmail(opts: {
  to: string; from: string; subject: string; body: string; threadId?: string;
}): string {
  const encodeSubject = (s: string) =>
    /[^\x00-\x7F]/.test(s)
      ? `=?UTF-8?B?${btoa(unescape(encodeURIComponent(s)))}?=`
      : s;

  const lines = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${encodeSubject("Re: " + opts.subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    opts.body,
  ];
  if (opts.threadId) lines.splice(3, 0, `In-Reply-To: ${opts.threadId}`);
  return lines.join("\r\n");
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token  = url.searchParams.get("token") || "";
  const action = url.searchParams.get("action") || ""; // "approve" or "reject"

  if (!token || !["approve", "reject"].includes(action)) {
    return new Response("❌ رابط غير صحيح.", { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Find the pending reply
    const results = await base44.asServiceRole.entities.PendingReply.filter({ approval_token: token });
    if (!results || results.length === 0) {
      return new Response("⚠️ الطلب مش موجود أو اتعمل فيه حاجة من قبل.", {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    const pending = results[0];

    if (pending.status !== "pending") {
      return new Response(
        `<html><body style="font-family:Arial;text-align:center;padding:60px">
          <h2>⚠️ الرد ده اتعمل فيه حاجة من قبل (${pending.status})</h2>
        </body></html>`,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    if (action === "reject") {
      await base44.asServiceRole.entities.PendingReply.update(pending.id, { status: "rejected" });
      return new Response(
        `<html><body style="font-family:Arial;text-align:center;padding:60px;background:#fff5f5">
          <div style="max-width:500px;margin:auto;border:1px solid #ddd;border-radius:12px;padding:40px">
            <div style="font-size:60px">❌</div>
            <h2 style="color:#dc3545">تم الرفض</h2>
            <p style="color:#666">الرد مش هيتبعت للعميل.</p>
          </div>
        </body></html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // APPROVE — send email
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Get sender info
    const meRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", { headers: authHeader });
    const me = await meRes.json();
    const senderEmail = me.emailAddress || "naname522@gmail.com";

    const rawEmail = buildMimeEmail({
      to: pending.original_from,
      from: `Immigration Portal Support <${senderEmail}>`,
      subject: pending.original_subject,
      body: pending.suggested_reply,
      threadId: pending.thread_id,
    });

    const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const sendPayload: any = { raw: encodedEmail };
    if (pending.thread_id) sendPayload.threadId = pending.thread_id;

    const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(sendPayload),
    });

    if (!sendRes.ok) {
      const err = await sendRes.text();
      console.error("Send failed:", err);
      throw new Error("Failed to send email: " + err);
    }

    await base44.asServiceRole.entities.PendingReply.update(pending.id, { status: "sent" });

    console.log(`✅ Reply sent to ${pending.original_from} — approved by owner`);

    return new Response(
      `<html><body style="font-family:Arial;text-align:center;padding:60px;background:#f0fff4">
        <div style="max-width:500px;margin:auto;border:1px solid #ddd;border-radius:12px;padding:40px;background:white">
          <div style="font-size:60px">✅</div>
          <h2 style="color:#28a745">تم الإرسال!</h2>
          <p style="color:#555">الرد اتبعت بنجاح لـ:</p>
          <p style="font-weight:bold;color:#333">${pending.original_from}</p>
          <p style="color:#888;font-size:13px">الموضوع: ${pending.original_subject}</p>
        </div>
      </body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

  } catch (err) {
    console.error("approveReply error:", err);
    return new Response(`<html><body style="text-align:center;padding:60px"><h2>❌ خطأ: ${err.message}</h2></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
});
