// src/pages/DocumentWorkspace.jsx

import { useParams, useOutletContext } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useDocumentStatus } from '../hooks/useDocumentStatus';
import { useChatSession } from '../hooks/useChatSession';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';

export function DocumentWorkspace() {
  const { id } = useParams();
  const { documents, updateOne } = useOutletContext();
  const knownDoc = documents.find((d) => d.id === id);

  const { document, error: statusError } = useDocumentStatus(id, knownDoc, updateOne);
  const chat = useChatSession(id);

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={20} />
      </div>
    );
  }

  const isReady = document.status === 'ready';
  const isFailed = document.status === 'failed';
  const isProcessing = !isReady && !isFailed;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <h1 className="truncate font-medium text-ink">{document.original_filename}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={document.status} />
            {document.page_count && (
              <span className="text-xs text-ink-muted">{document.page_count} page(s)</span>
            )}
          </div>
        </div>
        {isReady && (
          <button
            type="button"
            onClick={chat.startNewConversation}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:border-accent hover:text-accent"
          >
            <RotateCcw size={14} />
            New conversation
          </button>
        )}
      </header>

      {isProcessing && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-ink-muted">
          <Spinner size={20} />
          <p className="text-sm">Processing document — {document.status}…</p>
        </div>
      )}

      {isFailed && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <ErrorBanner message={document.error_message || 'Processing failed.'} />
          </div>
        </div>
      )}

      {statusError && (
        <div className="px-6 pt-3">
          <ErrorBanner message={statusError} />
        </div>
      )}

      {isReady && (
        <>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {chat.isLoadingHistory ? (
              <div className="flex items-center justify-center py-10">
                <Spinner size={18} />
              </div>
            ) : chat.messages.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-muted">
                Ask a question to start the conversation.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {chat.messages.map((msg, i) => (
                  <MessageBubble key={i} role={msg.role} content={msg.content} sources={msg.sources} />
                ))}
                {chat.isSending && (
                  <div className="flex justify-start">
                    <div className="rounded-xl border border-border bg-surface px-3.5 py-2.5">
                      <Spinner size={14} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {chat.error && (
              <div className="mt-3">
                <ErrorBanner message={chat.error} />
              </div>
            )}
          </div>
          <ChatInput onSend={chat.ask} disabled={chat.isSending || chat.isLoadingHistory} />
        </>
      )}
    </div>
  );
}
