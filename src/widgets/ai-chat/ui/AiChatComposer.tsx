"use client";

import { ArrowUp } from "lucide-react";
import React, { useEffect, useId, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { getUnifiedAskInstructionError } from "../model/ai-unified-ask-orchestrator";

interface AiChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  currentPageId?: string;
  disabled?: boolean;
}

export function AiChatComposer({ value, onChange, onSend, currentPageId, disabled = false }: AiChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const sendingRef = useRef(false);
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const placeholder = currentPageId
    ? "Ask AI what you'd like to do with this page..."
    : "Ask AI to write, create a page, or update a page...";
  const validationError = value.length ? getUnifiedAskInstructionError(value) : null;
  const canSend = Boolean(value.trim()) && !validationError && !disabled;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const send = () => {
    if (!canSend || sendingRef.current || composingRef.current) return;
    sendingRef.current = true;
    // Same-tick event fence; the operation store owns the network lifecycle.
    queueMicrotask(() => { sendingRef.current = false; });
    onSend();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || composingRef.current ||
      event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    send();
  };

  return (
    <div className="sticky bottom-0 z-10 w-full bg-background pt-2 pb-3">
      <form onSubmit={(event) => { event.preventDefault(); send(); }}
        className="relative rounded-2xl border border-border/70 bg-card px-3.5 pt-3 pb-2.5 shadow-sm transition-colors focus-within:border-ring/60 focus-within:ring-1 focus-within:ring-ring/25">
        <label htmlFor={inputId} className="sr-only">{placeholder}</label>
        <textarea ref={textareaRef} id={inputId} value={value}
          onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={() => { composingRef.current = false; }}
          placeholder={placeholder} rows={1} disabled={disabled} aria-label={placeholder}
          aria-invalid={Boolean(validationError)} aria-describedby={validationError ? errorId : undefined}
          className="block min-h-[36px] max-h-40 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-0" />
        {validationError && <p id={errorId} role="alert" className="mt-2 text-xs text-destructive">{validationError}</p>}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground/70">{value.length.toLocaleString()} / 4,000</span>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-muted-foreground/70 sm:inline">Enter to send · Shift + Enter for new line</span>
            <Button type="submit" size="icon-xs" disabled={!canSend} aria-label="Send message"
              className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-none transition-opacity hover:bg-foreground/90 disabled:opacity-30 disabled:hover:bg-foreground">
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
