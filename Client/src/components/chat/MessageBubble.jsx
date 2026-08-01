// File: src/components/chat/MessageBubble.jsx

export function MessageBubble({ role, content, sources }) {
  const isUser = role === 'user';

  return (
    <div
      className={`chat-message flex animate-message-in ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'rounded-br-sm bg-accent text-white'
            : 'rounded-bl-sm border border-border bg-surface text-ink'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>

        {sources && sources.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border pt-2">
            {/* Show source chunks used for the answer */}
            {sources.map((s, i) => (
              <span
                key={i}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-ink-muted"
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