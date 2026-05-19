import { useState, useEffect } from "react";
import { PendingReply } from "@/api/entities";

const statusColors = {
  pending:  { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-400", label: "معلق" },
  approved: { bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-400",  label: "موافق عليه" },
  rejected: { bg: "bg-red-100",    text: "text-red-800",    dot: "bg-red-400",    label: "مرفوض" },
  sent:     { bg: "bg-blue-100",   text: "text-blue-800",   dot: "bg-blue-400",   label: "تم الإرسال" },
};

export default function ApprovalsPage() {
  const [replies, setReplies]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState("pending");
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]         = useState(null);

  const APPROVE_BASE = "https://app.base44.com/api/apps/6a08052b4bda806d077bcc68/functions/approveReply";

  useEffect(() => { loadReplies(); }, [filter]);

  async function loadReplies() {
    setLoading(true);
    try {
      const all = await PendingReply.list();
      const filtered = filter === "all"
        ? all
        : all.filter(r => r.status === filter);
      filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setReplies(filtered);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAction(reply, action) {
    setActionLoading(reply.id + action);
    try {
      const res = await fetch(`${APPROVE_BASE}?token=${reply.approval_token}&action=${action}`);
      if (res.ok) {
        showToast(
          action === "approve" ? "✅ تم إرسال الرد للعميل!" : "❌ تم رفض الرد.",
          action === "approve" ? "success" : "error"
        );
        await loadReplies();
        if (selected?.id === reply.id) setSelected(null);
      } else {
        showToast("حصل خطأ، حاول تاني.", "error");
      }
    } catch {
      showToast("حصل خطأ في الاتصال.", "error");
    }
    setActionLoading(null);
  }

  const counts = {
    all:      replies.length,
    pending:  replies.filter(r => r.status === "pending").length,
    sent:     replies.filter(r => r.status === "sent").length,
    rejected: replies.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-bold text-sm transition-all
          ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-l from-[#1a3a6b] to-[#0f2447] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📬</span>
            <div>
              <h1 className="text-xl font-bold">مركز الموافقة على الردود</h1>
              <p className="text-sm opacity-70">راجع ووافق على الردود المقترحة قبل إرسالها للعملاء</p>
            </div>
          </div>
          <a href="/admin" className="text-sm opacity-70 hover:opacity-100 underline">← لوحة التحكم</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: "pending",  label: "معلقة",        icon: "⏳", color: "border-yellow-400 bg-yellow-50" },
            { key: "sent",     label: "تم إرسالها",   icon: "✅", color: "border-green-400 bg-green-50" },
            { key: "rejected", label: "مرفوضة",       icon: "❌", color: "border-red-400 bg-red-50" },
            { key: "all",      label: "الكل",          icon: "📋", color: "border-blue-400 bg-blue-50" },
          ].map(s => (
            <button key={s.key}
              onClick={() => setFilter(s.key)}
              className={`border-2 rounded-xl p-4 text-center cursor-pointer transition-all hover:shadow-md
                ${filter === s.key ? s.color + " shadow-md scale-105" : "border-gray-200 bg-white hover:border-gray-300"}`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{
                s.key === "all"
                  ? replies.length + (filter !== "all" ? "+" : "")
                  : replies.filter(r => r.status === s.key).length
              }</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex gap-6">

          {/* List */}
          <div className="w-full md:w-2/5 space-y-3">
            {loading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3 animate-spin">⏳</div>
                <p>جاري التحميل...</p>
              </div>
            ) : replies.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="text-5xl mb-3">🎉</div>
                <p className="text-gray-500 font-medium">
                  {filter === "pending" ? "مفيش ردود معلقة دلوقتي!" : "مفيش ردود في هذه الفئة"}
                </p>
              </div>
            ) : replies.map(reply => {
              const st = statusColors[reply.status] || statusColors.pending;
              const isSelected = selected?.id === reply.id;
              return (
                <div key={reply.id}
                  onClick={() => setSelected(reply)}
                  className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md
                    ${isSelected ? "border-[#1a3a6b] shadow-md" : "border-gray-100 hover:border-gray-300"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{reply.original_from}</p>
                      <p className="text-gray-500 text-xs truncate mt-0.5">{reply.original_subject}</p>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{reply.suggested_reply?.slice(0, 80)}...</p>
                    </div>
                    <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs mt-2">
                    {new Date(reply.created_date).toLocaleString("ar-EG")}
                  </p>

                  {/* Quick actions for pending */}
                  {reply.status === "pending" && (
                    <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleAction(reply, "approve")}
                        disabled={!!actionLoading}
                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                        {actionLoading === reply.id + "approve" ? "⏳" : "✅ وافق وأرسل"}
                      </button>
                      <button
                        onClick={() => handleAction(reply, "reject")}
                        disabled={!!actionLoading}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                        {actionLoading === reply.id + "reject" ? "⏳" : "❌ ارفض"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="hidden md:block flex-1">
            {selected ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sticky top-6">
                {/* Panel Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg">تفاصيل الرد</h2>
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(selected.created_date).toLocaleString("ar-EG")}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-xl">✕</button>
                </div>

                <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* Sender */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1 font-medium">من العميل</p>
                    <p className="font-bold text-gray-800 text-sm">{selected.original_from}</p>
                    <p className="text-gray-500 text-sm mt-1">📌 {selected.original_subject}</p>
                  </div>

                  {/* Original message */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1">
                      <span>📩</span> رسالة العميل الأصلية
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                      {selected.original_body || "—"}
                    </div>
                  </div>

                  {/* Suggested reply */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1">
                      <span>🤖</span> الرد المقترح من المساعد
                    </p>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {selected.suggested_reply || "—"}
                    </div>
                  </div>

                  {/* Status badge */}
                  {selected.status !== "pending" && (
                    <div className={`rounded-xl p-3 text-center font-bold text-sm ${statusColors[selected.status]?.bg} ${statusColors[selected.status]?.text}`}>
                      {selected.status === "sent" ? "✅ تم إرسال هذا الرد للعميل" : "❌ تم رفض هذا الرد"}
                    </div>
                  )}

                  {/* Action buttons */}
                  {selected.status === "pending" && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleAction(selected, "approve")}
                        disabled={!!actionLoading}
                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-sm">
                        {actionLoading === selected.id + "approve" ? "⏳ جاري الإرسال..." : "✅ وافق وأرسل للعميل"}
                      </button>
                      <button
                        onClick={() => handleAction(selected, "reject")}
                        disabled={!!actionLoading}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-sm">
                        {actionLoading === selected.id + "reject" ? "⏳..." : "❌ ارفض"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 h-64 flex items-center justify-center text-gray-300">
                <div className="text-center">
                  <div className="text-5xl mb-3">👈</div>
                  <p className="text-sm">اختار رد من القائمة عشان تشوف التفاصيل</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
