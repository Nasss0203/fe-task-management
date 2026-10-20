"use client";

import {
  AlignLeft,
  ArrowUp,
  FilePen,
  Languages,
  ListPlus,
  Maximize2,
  MessageSquareMore,
  Minimize2,
  WandSparkles,
} from "lucide-react";
import React, { useEffect, useRef } from "react";

import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import type { AiChatMode } from "../model/types";

interface AiChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  mode: AiChatMode;
  onModeChange: (mode: AiChatMode) => void;
  onSend: () => void;
  currentPageId?: string;
  disabled?: boolean;
}

function getPlaceholder(mode: AiChatMode, currentPageId?: string): string {
  switch (mode) {
    case "GENERATE_PAGE_COMPOSITION":
      return "Describe the page you want AI to create...";

    case "GENERATE_PAGE_MODIFICATION_PLAN":
      return currentPageId
        ? "Describe what you want to change on this page..."
        : "e.g. Thêm checklist QA vào page Release 2.0";

    case "writing.improve":
      return "Enter text you want to improve...";

    case "writing.shorten":
      return "Enter text you want to shorten...";

    case "writing.expand":
      return "Enter text you want to expand...";

    case "writing.summarize":
      return "Enter text you want to summarize...";

    case "writing.continue":
      return "Enter text you want AI to continue...";

    case "writing.translate":
      return "Enter text you want to translate...";

    default:
      return "Enter your text...";
  }
}

export function AiChatComposer({
  value,
  onChange,
  mode,
  onModeChange,
  onSend,
  currentPageId,
  disabled = false,
}: AiChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = getPlaceholder(mode, currentPageId);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (
      event.nativeEvent.isComposing ||
      ("keyCode" in event &&
        (event as unknown as { keyCode: number }).keyCode === 229)
    ) {
      return;
    }

    if (value.trim() && !disabled) {
      onSend();
    }
  };

  const canSend = Boolean(value.trim()) && !disabled;

  return (
    <div className="sticky bottom-0 z-10 w-full bg-background pt-2 pb-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (canSend) {
            onSend();
          }
        }}
        className="relative rounded-2xl border border-border/70 bg-card px-3.5 pt-3 pb-2.5 shadow-sm transition-colors focus-within:border-ring/60 focus-within:ring-1 focus-within:ring-ring/25"
      >
        <label htmlFor="ai-chat-input" className="sr-only">
          {placeholder}
        </label>

        <textarea
          ref={textareaRef}
          id="ai-chat-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          aria-label={placeholder}
          className="block min-h-[36px] max-h-40 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-0"
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Select
              value={mode}
              onValueChange={(value) => onModeChange(value as AiChatMode)}
            >
              <SelectTrigger
                size="sm"
                aria-label="Select AI capability"
                className="h-7 gap-1 rounded-full border border-border/60 bg-transparent px-2.5 text-xs font-medium text-muted-foreground shadow-none hover:bg-accent/50 hover:text-foreground"
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="rounded-lg border-border/60 bg-popover">
                <SelectGroup>
                  <SelectLabel className="text-[11px]">Page</SelectLabel>

                  <SelectItem value="GENERATE_PAGE_COMPOSITION">
                    <span className="flex items-center gap-1.5">
                      <ListPlus className="size-3.5 text-muted-foreground" />
                      <span>Create page</span>
                    </span>
                  </SelectItem>

                  <SelectItem value="GENERATE_PAGE_MODIFICATION_PLAN">
                    <span className="flex items-center gap-1.5">
                      <FilePen className="size-3.5 text-muted-foreground" />
                      <span>{currentPageId ? "Modify current page" : "Modify a page by name"}</span>
                    </span>
                  </SelectItem>
                </SelectGroup>

                <SelectSeparator />

                <SelectGroup>
                <SelectLabel className="text-[11px]">Writing</SelectLabel>

                <SelectItem value="writing.improve">
                  <span className="flex items-center gap-1.5">
                    <WandSparkles className="size-3.5 text-muted-foreground" />
                    <span>Improve</span>
                  </span>
                </SelectItem>

                <SelectItem value="writing.shorten">
                  <span className="flex items-center gap-1.5">
                    <Minimize2 className="size-3.5 text-muted-foreground" />
                    <span>Shorten</span>
                  </span>
                </SelectItem>

                <SelectItem value="writing.expand">
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="size-3.5 text-muted-foreground" />
                    <span>Expand</span>
                  </span>
                </SelectItem>

                <SelectItem value="writing.summarize">
                  <span className="flex items-center gap-1.5">
                    <AlignLeft className="size-3.5 text-muted-foreground" />
                    <span>Summarize</span>
                  </span>
                </SelectItem>

                <SelectItem value="writing.continue">
                  <span className="flex items-center gap-1.5">
                    <MessageSquareMore className="size-3.5 text-muted-foreground" />
                    <span>Continue</span>
                  </span>
                </SelectItem>

                <SelectItem value="writing.translate">
                  <span className="flex items-center gap-1.5">
                    <Languages className="size-3.5 text-muted-foreground" />
                    <span>Translate</span>
                  </span>
                </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-muted-foreground/70 sm:inline">
              Enter to send · Shift + Enter for new line
            </span>

            <Button
              type="submit"
              size="icon-xs"
              disabled={!canSend}
              aria-label="Send message"
              className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-none transition-opacity hover:bg-foreground/90 disabled:opacity-30 disabled:hover:bg-foreground"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
