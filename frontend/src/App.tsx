
import { useState } from "react";
import QueryForm from "./components/QueryForm";
import AnswerPanel from "./components/AnswerPanel";
import { submitQuery } from "./services/api";
import "./App.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter a question.");
      return;
    }

    if (trimmedQuery.length > 2000) {
      setError("Your question must be 2000 characters or fewer.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const result = await submitQuery(trimmedQuery);
      setAnswer(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <span className="eyebrow">AI WORKSPACE</span>
        <h1>AI Query Assistant</h1>
        <p>
          Ask a question and get an AI-generated response.
        </p>
      </header>

      <div className="assistant-card">
        <QueryForm
          query={query}
          loading={loading}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
        />

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <AnswerPanel answer={answer} loading={loading} />
      </div>

      <footer className="app-footer">
        Powered by an authenticated API and an LLM service.
      </footer>
    </main>
  );
}
