"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type User = { id: string; name: string; title: string };
type Citation = { id: string; name: string };

export default function MeridianPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/users`)
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) {
          throw new Error(`GET /api/users failed: HTTP ${r.status} ${text}`);
        }
        return JSON.parse(text) as User[];
      })
      .then((list) => {
        setUsers(list);
        setUserId(list[0]?.id ?? "");
      })
      .catch((err) =>
        setAnswer(
          `Could not reach the backend at ${API}: ${err instanceof Error ? err.message : String(err)}`
        )
      );
  }, []);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnswer("");
    setCitations([]);
    try {
      const r = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, question }),
      });
      const text = await r.text();
      if (!r.ok) {
        throw new Error(`POST /api/ask failed: HTTP ${r.status} ${text}`);
      }
      const data = JSON.parse(text);
      setAnswer(data.answer);
      setCitations(data.citations ?? []);
    } catch (err) {
      setAnswer(
        `Error: ${err instanceof Error ? err.message : String(err)} (backend: ${API})`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="font-semibold text-xl">Meridian Group Entity Assistant</h1>

      <form className="space-y-3" onSubmit={ask}>
        <select
          className="w-full rounded border p-2"
          onChange={(e) => {
            setUserId(e.target.value);
            setAnswer("");
            setCitations([]);
          }}
          value={userId}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.title})
            </option>
          ))}
        </select>

        <textarea
          className="w-full rounded border p-2"
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your entities"
          rows={3}
          value={question}
        />

        <button
          className="rounded border px-4 py-2 disabled:opacity-50"
          disabled={loading || !userId || !question.trim()}
          type="submit"
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </form>

      {answer && (
        <section className="space-y-2 rounded border p-4">
          <p className="whitespace-pre-wrap">{answer}</p>
          {citations.length > 0 && (
            <p className="text-sm opacity-70">
              Sources: {citations.map((c) => `${c.id} ${c.name}`).join(", ")}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
