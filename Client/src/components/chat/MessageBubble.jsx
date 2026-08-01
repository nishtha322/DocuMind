// src/components/chat/MessageBubble.jsx

export function MessageBubble({ role, content, sources }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser ? 'bg-accent text-white' : 'border border-border bg-surface text-ink'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {sources && sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sources.map((s, i) => (
              <span
                key={i}
                className="rounded border border-border px-1.5 py-0.5 text-[10px] text-ink-muted"
              >
                chunk {s.chunkIndex}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
