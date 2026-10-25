import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { AiChatComposer } from "@/widgets/ai-chat/ui/AiChatComposer";
import { AiChatEmptyState, QUICK_ACTIONS } from "@/widgets/ai-chat/ui/AiChatEmptyState";
import { getAiChatScope, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";

function mount(value = "Write a summary", disabled = false, page?: string) {
  const onSend = vi.fn();
  const component = render(<AiChatComposer value={value} disabled={disabled} currentPageId={page} onChange={vi.fn()} onSend={onSend} />);
  return { ...component, onSend, input: screen.getByRole("textbox"), button: screen.getByRole("button", { name: "Send message" }) };
}
describe("Natural-language Unified Composer", () => {
  it("has no capability selector and keeps the natural-language placeholders", () => {
    const { rerender } = mount();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByLabelText("Select AI capability")).toBeNull();
    expect(screen.getByPlaceholderText("Ask AI to write, create a page, or update a page...")).toBeVisible();
    rerender(<AiChatComposer value="" currentPageId="page-1" onChange={vi.fn()} onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText("Ask AI what you'd like to do with this page...")).toBeVisible();
  });
  it("sends with Enter, keeps Shift+Enter and fences same-tick double submission", async () => {
    const { input, button, onSend } = mount();
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onSend).toHaveBeenCalledTimes(1);
    await act(async () => {});
  });
  it.each(["composition", "native", "229"])("does not submit during IME %s", (kind) => {
    const { input, onSend } = mount();
    if (kind === "composition") fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "Enter", isComposing: kind === "native", keyCode: kind === "229" ? 229 : 13 });
    expect(onSend).not.toHaveBeenCalled();
    if (kind === "composition") fireEvent.compositionEnd(input);
  });
  it.each(["", "   ", "x".repeat(4001)])("blocks empty/over-limit text without truncating it", (value) => {
    const { input, button, onSend } = mount(value);
    expect(input).toHaveValue(value);
    expect(button).toBeDisabled();
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(button);
    expect(onSend).not.toHaveBeenCalled();
    if (value.length > 4000) {
      expect(screen.getByRole("alert")).toHaveTextContent("4,000");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).not.toHaveAttribute("maxlength");
    }
  });
  it("accepts exactly 4,000 characters", () => {
    const { input, onSend } = mount("x".repeat(4000));
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledTimes(1);
  });
  it("blocks disabled state on keyboard and click", () => {
    const { input, button, onSend } = mount("Request", true);
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(button);
    expect(onSend).not.toHaveBeenCalled();
    expect(input).toBeDisabled();
  });
  it("preserves controlled edits and auto-resizes", () => {
    function Controlled() {
      const [value, setValue] = useState("");
      return <AiChatComposer value={value} onChange={setValue} onSend={vi.fn()} />;
    }
    render(<Controlled />);
    const input = screen.getByRole("textbox") as HTMLTextAreaElement;
    Object.defineProperty(input, "scrollHeight", { configurable: true, value: 250 });
    fireEvent.change(input, { target: { value: "Multiple\nlines" } });
    expect(input).toHaveValue("Multiple\nlines");
    expect(input.style.height).toBe("160px");
  });
});
describe("Quick Actions are editable templates", () => {
  it.each(QUICK_ACTIONS)("fills $label without capability dispatch or sending unresolved markers", (action) => {
    const scope = getAiChatScope(undefined, "workspace", "user");
    useAiChatStore.setState({ threads: {} });
    useAiChatStore.getState().setMode(scope, "writing.translate");
    const send = vi.fn();
    function Actions() {
      const input = useAiChatStore((state) => state.threads[scope]?.input ?? "");
      return <><AiChatEmptyState onSelectQuickAction={(item) => useAiChatStore.getState().selectQuickAction(scope, item)} />
        <AiChatComposer value={input} onChange={(value) => useAiChatStore.getState().setInput(scope, value)} onSend={send} /></>;
    }
    render(<Actions />);
    fireEvent.click(screen.getByRole("button", { name: action.label }));
    expect(screen.getByRole("textbox")).toHaveValue(action.prompt);
    expect(useAiChatStore.getState().threads[scope].mode).toBe("writing.translate");
    expect(send).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Replace the template placeholders");
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(send).not.toHaveBeenCalled();
  });
});

