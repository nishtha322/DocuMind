// File: src/components/ui/Spinner.jsx

export function Spinner({ size = 16, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-border border-t-accent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}