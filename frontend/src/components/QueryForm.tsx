interface QueryFormProps {
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
}

export default function QueryForm({
  query,
  loading,
  onQueryChange,
  onSubmit,
}: QueryFormProps) {
  return (
    <form
      className="query-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="query">What would you like to know?</label>

      <textarea
        id="query"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Ask a question..."
        maxLength={2000}
        rows={5}
        required
        disabled={loading}
      />

      <div className="form-footer">
        <span>{query.length}/2000 characters</span>

        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>
    </form>
  );
}
