// src/components/chat/ChatInput.jsx

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
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask a question about this document…"
        disabled={disabled}
        className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {disabled ? <Spinner size={16} className="border-white/40 border-t-white" /> : <Send size={16} />}
      </button>
    </form>
  );
}
