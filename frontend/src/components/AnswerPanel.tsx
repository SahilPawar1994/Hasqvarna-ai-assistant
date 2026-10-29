
interface AnswerPanelProps {
  answer: string;
  loading: boolean;
}

export default function AnswerPanel({
  answer,
  loading,
}: AnswerPanelProps) {
  return (
    <section className="answer-panel" aria-live="polite">
      <h2>AI Response</h2>

      {loading && (
        <p role="status">Generating your answer...</p>
      )}

      {!loading && !answer && (
        <p className="placeholder">
          Your answer will appear here.
        </p>
      )}

      {!loading && answer && (
        <div className="answer-content">{answer}</div>
      )}
    </section>
  );
}
