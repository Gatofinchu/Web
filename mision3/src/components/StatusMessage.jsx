export default function StatusMessage({ children, error = false, onRetry }) {
  return (
    <p className={error ? 'status error' : 'status'} aria-live="polite">
      {children}
      {onRetry && <button onClick={onRetry}>Reintentar</button>}
    </p>
  )
}
