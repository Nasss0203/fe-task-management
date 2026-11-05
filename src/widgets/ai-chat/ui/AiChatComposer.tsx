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
    <div className="w-full shrink-0 bg-background pt-2 pb-4">
      <form onSubmit={(event) => { event.preventDefault(); send(); }}
        className="relative rounded-[14px] border border-input bg-card pl-3.5 pr-2.5 pt-2.5 pb-2 shadow-[0_4px_7px_rgba(0,0,0,0.06)] transition-colors focus-within:border-ring/70 dark:shadow-none">
        <label htmlFor={inputId} className="sr-only">{placeholder}</label>
        <textarea ref={textareaRef} id={inputId} value={value}
          onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={() => { composingRef.current = false; }}
          placeholder={placeholder} rows={1} disabled={disabled} aria-label={placeholder}
          aria-invalid={Boolean(validationError)} aria-describedby={validationError ? errorId : undefined}
          className="block min-h-[28px] max-h-40 w-full resize-none border-0 bg-transparent p-0 text-[14px] leading-[21px] text-foreground placeholder:text-faint outline-none focus:ring-0" />
        {validationError && <p id={errorId} role="alert" className="mt-2 text-xs text-destructive">{validationError}</p>}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-[11px] text-faint">{value.length.toLocaleString()} / 4,000</span>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-faint sm:inline">Enter to send · Shift + Enter for new line</span>
            <Button type="submit" size="icon-xs" disabled={!canSend} aria-label="Send message"
              className="flex size-[30px] items-center justify-center rounded-full bg-foreground text-background shadow-none transition-colors hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100">
              <ArrowUp className="size-[15px]" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
