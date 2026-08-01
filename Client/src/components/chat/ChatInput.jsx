// File: src/components/chat/ChatInput.jsx

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

export function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    const question = value.trim();

    if (!question || disabled) return;

    setValue('');
    onSend(question);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t border-border bg-surface p-4"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask a question about this document…"
        disabled={disabled}
        className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft disabled:opacity-60"
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
      >
        {disabled ? (
          <Spinner size={16} className="border-white/40 border-t-white" />
        ) : (
          <Send size={16} />
        )}
      </button>
    </form>
  );
}