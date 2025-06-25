"use client";
import React, { useState } from "react";

export default function Home() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdf) return setError("Please select a PDF file.");
    setError("");
    setUploading(true);
    const formData = new FormData();
    formData.append("pdf", pdf);
    if (email) formData.append("email", email);
    try {
      const res = await fetch("/api/upload_pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setSessionId(data.session_id);
      setAnswer("");
      setQuestion("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return setError("Please upload a PDF first.");
    if (!question) return setError("Please enter a question.");
    setError("");
    setAsking(true);
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("query", question);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to get answer");
      setAnswer(data.answer);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      overflowX: "hidden",
      fontFamily: "Inter, sans-serif",
      background: "linear-gradient(120deg, #e0e7ef 0%, #f8fafc 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}>
      {/* Animated Gradient Accent */}
      <div style={{
        position: "absolute",
        top: -120,
        left: -120,
        width: 400,
        height: 400,
        background: "radial-gradient(circle at 30% 30%, #6366f1 0%, #38bdf8 60%, transparent 100%)",
        opacity: 0.25,
        zIndex: 0,
        filter: "blur(32px)",
        animation: "float 8s ease-in-out infinite alternate"
      }} />
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(40px) scale(1.08); }
        }
        .glass-card {
          background: rgba(255,255,255,0.90);
          box-shadow: 0 8px 32px 0 rgba(31, 41, 55, 0.12);
          backdrop-filter: blur(16px) saturate(180%);
          border-radius: 28px;
          border: 1.5px solid rgba(200, 220, 255, 0.18);
          transition: box-shadow 0.2s, transform 0.2s;
          margin: 0 auto;
        }
        .glass-card:hover {
          box-shadow: 0 12px 40px 0 rgba(37,99,235,0.18);
          transform: translateY(-2px) scale(1.01);
        }
        .modern-btn {
          background: linear-gradient(90deg, #6366f1 0%, #38bdf8 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 18px 0;
          font-weight: 700;
          font-size: 20px;
          width: 100%;
          margin-top: 12px;
          box-shadow: 0 2px 8px 0 rgba(37,99,235,0.10);
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .modern-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .modern-btn:hover:enabled {
          background: linear-gradient(90deg, #38bdf8 0%, #6366f1 100%);
          box-shadow: 0 4px 16px 0 rgba(37,99,235,0.18);
          transform: scale(1.03);
        }
        .fade-in {
          animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .glass-card { min-width: 98vw !important; max-width: 99vw !important; padding: 18px !important; }
        }
        input[type="text"], input[type="email"] {
          color: #222 !important;
          background: #f5f7ff !important;
        }
        input[type="text"]:focus, input[type="email"]:focus {
          outline: 2px solid #6366f1;
          background: #eef2ff !important;
        }
      `}</style>
      {/* Header */}
      <header style={{ marginBottom: 48, textAlign: "center", zIndex: 1, position: "relative" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}>
          {/* Modern circular logo */}
          <div style={{
            width: 120,
            height: 80,
            borderRadius: "20%",
            background: "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: 36,
            letterSpacing: 1,
            boxShadow: "0 4px 16px 0 rgba(99,102,241,0.18)",
            border: "3px solid #e0e7ef"
          }}>
            <span style={{ fontFamily: "Inter, sans-serif", width: "100%", textAlign: "center", userSelect: "none" }}>Q&amp;A</span>
          </div>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 32, margin: 0, color: "#222", letterSpacing: -1 }}>
              PDF Q&amp;A SaaS
            </h1>
            <div style={{ color: "#64748b", fontSize: 17, marginTop: 4, fontWeight: 500 }}>
              Instantly ask questions about your PDFs using AI
            </div>
          </div>
        </div>
      </header>

      {/* Upload Card */}
      <div className="glass-card" style={{
        padding: 48,
        minWidth: 420,
        maxWidth: 650,
        width: "100%",
        marginBottom: 48,
        textAlign: "center",
        zIndex: 1,
        position: "relative",
        boxSizing: "border-box"
      }}>
        <form onSubmit={handleUpload}>
          <label style={{ fontWeight: 600, color: "#222", fontSize: 20 }}>
            PDF File
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setPdf(e.target.files?.[0] || null)}
              required
              style={{ display: "block", margin: "16px auto 24px auto" }}
            />
          </label>
          <label style={{ fontWeight: 600, color: "#222", fontSize: 20 }}>
            Email (optional)
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                display: "block",
                margin: "16px auto 24px auto",
                width: "100%",
                padding: 14,
                borderRadius: 14,
                border: "1.5px solid #e5e7eb",
                fontSize: 18,
                background: "#f5f7ff",
                fontWeight: 500
              }}
            />
          </label>
          <button
            type="submit"
            disabled={uploading}
            className="modern-btn"
          >
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
        </form>
      </div>

      {/* Q&A Card */}
      {sessionId && (
        <div className="glass-card fade-in" style={{
          padding: 48,
          minWidth: 420,
          maxWidth: 650,
          width: "100%",
          marginBottom: 48,
          textAlign: "center",
          zIndex: 1,
          position: "relative",
          boxSizing: "border-box"
        }}>
          <form onSubmit={handleAsk}>
            <label style={{ fontWeight: 600, color: "#222", fontSize: 20 }}>
              Ask a question
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                style={{
                  display: "block",
                  margin: "16px auto 24px auto",
                  width: "100%",
                  padding: 14,
                  borderRadius: 14,
                  border: "1.5px solid #e5e7eb",
                  fontSize: 18,
                  background: "#f5f7ff",
                  fontWeight: 500
                }}
                required
              />
            </label>
            <button
              type="submit"
              disabled={asking}
              className="modern-btn"
            >
              {asking ? "Getting answer..." : "Ask"}
            </button>
          </form>
          {answer && (
            <div style={{
              background: "linear-gradient(90deg, #e0e7ef 0%, #f8fafc 100%)",
              borderRadius: 22,
              padding: 40,
              marginTop: 32,
              color: "#222",
              fontSize: 22,
              textAlign: "left",
              boxShadow: "0 2px 16px 0 rgba(30,41,59,0.10)",
              fontWeight: 500,
              border: "1.5px solid #e5e7eb",
              minHeight: 120,
              lineHeight: 1.7
            }}>
              <strong style={{ color: "#2563eb", fontSize: 20 }}>Answer:</strong>
              <div style={{ marginTop: 18 }}>{answer}</div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          color: "#dc2626",
          background: "#fef2f2",
          border: "1.5px solid #fecaca",
          borderRadius: 12,
          padding: 16,
          marginBottom: 32,
          minWidth: 380,
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          fontWeight: 600,
          fontSize: 17,
          boxSizing: "border-box"
        }}>{error}</div>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: 40,
        color: "#64748b",
        fontSize: 17,
        textAlign: "center",
        fontWeight: 500,
        letterSpacing: 0.2
      }}>
        &copy; {new Date().getFullYear()} Uttkarsh Malviya &mdash; PDF Q&A SaaS
      </footer>
    </div>
  );
}
