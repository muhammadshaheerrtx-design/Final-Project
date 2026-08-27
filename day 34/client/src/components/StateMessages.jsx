export function LoadingState({ label = "Loading…" }) {
  return <p className="state-text">{label}</p>;
}

export function EmptyState({ label }) {
  return <p className="state-text muted">{label}</p>;
}

export function ErrorState({ message }) {
  return (
    <div className="error-banner" role="alert">
      {message}
    </div>
  );
}
