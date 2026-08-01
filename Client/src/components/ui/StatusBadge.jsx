// src/components/ui/StatusBadge.jsx

const STYLES = {
  ready: 'text-success bg-success-soft',
  failed: 'text-danger bg-danger-soft',
  // uploaded / parsing / embedding all read as "processing"
  default: 'text-warning bg-warning-soft',
};

export function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.default;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${style}`}>
      {status}
    </span>
  );
}
