"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  Plus, 
  MessageSquare, 
  Bot, 
  User as UserIcon, 
  Check, 
  Clock, 
  ChevronDown,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { useQueries } from "@tanstack/react-query";
import { findProjectByWorkspaceIdApi } from "@/services/project/project.service";
import { useAiAssistant } from "@/features/ai-assistant/hooks/useAiAssistant";
import { AiMessage } from "@/services/ai-assistant/type";

export default function AiAssistantPage() {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useProjectSelectionStore();
  const { workspaceFindAll } = useWorkspace();
  const workspaces = workspaceFindAll?.data?.data ?? [];

  // Fetch projects of the active workspace
  const projectQueries = useQueries({
    queries: workspaces.map((workspace) => ({
      queryKey: ["projects", workspace.id],
      queryFn: () => findProjectByWorkspaceIdApi(workspace.id),
      enabled: !!workspace.id,
    })),
  });

  const activeWorkspaceProjects = currentWorkspaceId 
    ? (projectQueries[workspaces.findIndex(w => w.id === currentWorkspaceId)]?.data?.data ?? [])
    : [];

  const [hasStartedChatting, setHasStartedChatting] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [inputMsg, setInputMsg] = useState("");
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [autoApply, setAutoApply] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<AiMessage[]>([]);

  // AI Assistant React Query hooks
  const {
    conversationsQuery,
    conversationDetailQuery,
    createConversation,
    sendAiMessage,
    applyGeneration,
    discardGeneration,
  } = useAiAssistant(activeConvId || undefined);

  const conversations = conversationsQuery.data ?? [];
  const activeConversation = conversationDetailQuery.data;
  const messages = activeConversation?.messages ?? [];

  const displayedMessages = [
    ...messages,
    ...optimisticMessages.filter((temp) => {
      if (activeConvId) {
        if (temp.conversationId !== "temp" && temp.conversationId !== activeConvId) return false;
        return !messages.some((m) => m.content === temp.content);
      } else {
        return temp.conversationId === "temp";
      }
    }),
  ];

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [displayedMessages.length, sendAiMessage.isPending, createConversation.isPending]);

  React.useEffect(() => {
    if (messages.length > 0 && optimisticMessages.length > 0) {
      setOptimisticMessages((prev) =>
        prev.filter((temp) => !messages.some((m) => m.content === temp.content))
      );
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;

    setHasStartedChatting(true);
    const textToSend = inputMsg;
    setInputMsg("");

    // Detect Workspace and Project from text (UUID or Name)
    const normalizedMsg = textToSend.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let detectedWorkspaceId: string | undefined = undefined;
    let detectedProjectId: string | undefined = undefined;

    // 1. Try to find and match UUIDs in user input
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const uuidsInText = textToSend.match(uuidRegex) || [];

    for (const uuid of uuidsInText) {
      const matchingWs = workspaces.find(w => w.id.toLowerCase() === uuid.toLowerCase());
      if (matchingWs) {
        detectedWorkspaceId = matchingWs.id;
        continue;
      }
      
      const allProjects = projectQueries.flatMap(q => q.data?.data ?? []);
      const matchingProj = allProjects.find(p => p.id && p.id.toLowerCase() === uuid.toLowerCase());
      if (matchingProj) {
        detectedProjectId = matchingProj.id;
        detectedWorkspaceId = matchingProj.workspace_id;
      }
    }

    // 2. Fall back to name-based detection if no UUID was found/matched
    if (!detectedWorkspaceId && !detectedProjectId) {
      for (const ws of workspaces) {
        const normalizedWsName = (ws.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const escapedName = normalizedWsName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(?:^|\\s|\\b)${escapedName}(?:$|\\s|\\b)`, 'i');
        if (regex.test(normalizedMsg)) {
          detectedWorkspaceId = ws.id;
          break;
        }
      }

      let targetWsId = detectedWorkspaceId || currentWorkspaceId;
      if (targetWsId) {
        const wsIdx = workspaces.findIndex(w => w.id === targetWsId);
        const projects = wsIdx !== -1 ? (projectQueries[wsIdx]?.data?.data ?? []) : [];
        for (const proj of projects) {
          const normalizedProjName = (proj.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const escapedProjName = normalizedProjName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const projRegex = new RegExp(`(?:^|\\s|\\b)${escapedProjName}(?:$|\\s|\\b)`, 'i');
          if (projRegex.test(normalizedMsg)) {
            detectedProjectId = proj.id;
            break;
          }
        }
      }
    }

    // Update selectors in UI if detected
    if (detectedWorkspaceId) {
      setCurrentWorkspaceId(detectedWorkspaceId);
      setSelectedProjectId(detectedProjectId || "");
    } else if (detectedProjectId) {
      setSelectedProjectId(detectedProjectId);
    }

    const finalWorkspaceId = detectedWorkspaceId || currentWorkspaceId || undefined;
    const finalProjectId = detectedProjectId || selectedProjectId || undefined;

    const tempMsg: AiMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConvId || "temp",
      senderRole: "USER",
      role: "USER",
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    setOptimisticMessages((prev) => [...prev, tempMsg]);

    try {
      let targetConvId = activeConvId;

      if (!targetConvId) {
        // Create new room if none selected
        const newConv = await createConversation.mutateAsync({
          title: textToSend.substring(0, 30),
          workspaceId: finalWorkspaceId,
        });
        targetConvId = newConv.id;
        setActiveConvId(newConv.id);

        setOptimisticMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? { ...m, conversationId: newConv.id } : m))
        );
      }

      const res = await sendAiMessage.mutateAsync({
        convId: targetConvId,
        data: {
          message: textToSend,
          workspaceId: finalWorkspaceId,
          projectId: finalProjectId,
          autoApply: autoApply,
        },
      });

      if (!res.assistantMessage) {
        toast.warning("Trợ lý không nhận diện được yêu cầu tạo Workspace/Project/Task. Vui lòng mô tả rõ hơn (ví dụ: 'tạo workspace...', 'tạo 3 task...').");
      } else {
        toast.success("AI đã nhận diện và xử lý câu hỏi!");
      }
    } catch (error: any) {
      console.error(error);
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));

      const errMsg = error.response?.data?.message || error.message || "";
      if (errMsg.includes("Workspace and Project context are required") || error.response?.status === 409) {
        toast.warning("Vui lòng chọn Dự án (Project) cần tạo công việc ở phía trên bên phải trước khi yêu cầu AI!");
      } else {
        toast.error("Không thể xử lý tin nhắn của bạn.");
      }
    }
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
    setHasStartedChatting(true);
    setOptimisticMessages([]);
  };

  const handleApplyDraft = async (generationId: string) => {
    try {
      await applyGeneration.mutateAsync(generationId);
      toast.success("Đã áp dụng bản nháp! Các công việc mới đã được tạo thành công.");
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || "";
      if (errMsg.includes("Workspace and Project context are required")) {
        toast.warning("Không thể áp dụng: Vui lòng chọn Dự án (Project) ở phía trên bên phải trước!");
      } else {
        toast.error("Không thể áp dụng bản nháp.");
      }
    }
  };

  const handleDiscardDraft = async (generationId: string) => {
    try {
      await discardGeneration.mutateAsync(generationId);
      toast.info("Đã hủy bỏ bản nháp.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể hủy bản nháp.");
    }
  };

  const selectedProjectName = activeWorkspaceProjects.find(p => p.id === selectedProjectId)?.name || "Select Project";
  const selectedWorkspaceName = workspaces.find(w => w.id === currentWorkspaceId)?.name || "Select Workspace";

  const handleWorkspaceChange = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId || null);
    setSelectedProjectId("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] w-full relative overflow-hidden bg-background">
      
      {/* TRẠNG THÁI 1: GIAO DIỆN CHỜ (TRUNG TÂM) */}
      {!hasStartedChatting ? (
        <div className="flex flex-col items-center justify-center flex-1 max-w-3xl mx-auto w-full px-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
          
          {/* Centered Input Box */}
          <div className="w-full bg-card/30 border border-border/60 rounded-xl p-3 shadow-lg backdrop-blur-md mb-6 hover:border-border/80 transition-all duration-300">
            <textarea
              placeholder="Ask anything, @ to mention, / for actions"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={2}
              className="w-full bg-transparent border-none outline-none text-xs resize-none text-foreground placeholder:text-muted-foreground/50"
            />
            <div className="flex items-center justify-between border-t border-border/20 pt-2.5 mt-1.5">
              <div className="flex items-center gap-1.5">
                {/* Select Workspace Button */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 px-2.5 text-left truncate max-w-[140px]">
                    <span className="truncate">{selectedWorkspaceName}</span>
                    <ChevronDown className="size-2.5 ml-1 shrink-0" />
                  </Button>
                  
                  {workspaces.length > 0 && (
                    <select 
                      value={currentWorkspaceId || ""}
                      onChange={(e) => handleWorkspaceChange(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer text-[10px]"
                    >
                      <option value="">Select Workspace</option>
                      {workspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Select Project Button inside input toolbar */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 px-2.5 text-left truncate max-w-[120px]">
                    <span className="truncate">{selectedProjectName}</span>
                    <ChevronDown className="size-2.5 ml-1 shrink-0" />
                  </Button>
                  
                  {activeWorkspaceProjects.length > 0 && (
                    <select 
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer text-[10px]"
                    >
                      <option value="">Select Project</option>
                      {activeWorkspaceProjects.map((proj) => (
                        <option key={proj.id} value={proj.id}>{proj.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <Button variant="ghost" size="sm" className="h-6 text-[10px] rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 px-2.5">
                  <Plus className="size-2.5 mr-1" /> Context
                </Button>
                
                {/* Auto Apply Toggle */}
                <div 
                  className="flex items-center gap-1.5 ml-1.5 cursor-pointer hover:opacity-85 select-none" 
                  onClick={() => setAutoApply(!autoApply)}
                >
                  <input 
                    type="checkbox" 
                    checked={autoApply} 
                    onChange={() => {}} 
                    className="size-3 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  />
                  <span className="text-[10px] text-muted-foreground">Auto Apply</span>
                </div>
              </div>
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!inputMsg.trim()}
                className="h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
              >
                <Send className="size-3" />
              </Button>
            </div>
          </div>

          {/* Recent Conversations (Đoạn chat cũ) dưới Input */}
          <div className="w-full max-w-3xl space-y-2 mt-2 animate-in fade-in delay-150 duration-300">
            <h3 className="text-[10px] font-semibold text-muted-foreground/70 tracking-wider uppercase pl-1">Phiên hội thoại gần đây</h3>
            <div className="max-h-[240px] w-full pr-1.5 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-1.5 pb-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="p-2.5 px-3 rounded-xl border border-border/30 bg-card/10 hover:bg-accent/30 hover:border-border/60 text-left transition-all duration-150 group flex items-center justify-between gap-3 text-xs w-full"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className="size-3.5 text-blue-500/70 shrink-0" />
                      <p className="font-medium text-foreground truncate group-hover:text-blue-500 transition-colors">{conv.title}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground/50 shrink-0 font-mono">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        
        // TRẠNG THÁI 2: KHI ĐÃ BẮT ĐẦU CHAT (INPUT CHUYỂN XUỐNG DƯỚI, HIỂN THỊ LỊCH SỬ CHAT)
        <div className="flex-1 flex flex-col min-h-0 w-full bg-background animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="h-14 border-b border-border/40 px-4 flex items-center justify-between bg-card/10 backdrop-blur shrink-0">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-accent" 
                onClick={() => {
                  setHasStartedChatting(false);
                  setActiveConvId(null);
                  setOptimisticMessages([]);
                }}
              >
                <ArrowLeft className="size-4 text-muted-foreground" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-blue-600/10 p-1.5 rounded-lg">
                  <Bot className="size-3.5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold">AI Assistant</h2>
                  <p className="text-[9px] text-emerald-500 flex items-center gap-1">
                    <span className="size-1 rounded-full bg-emerald-500 animate-pulse"></span> Online
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Select Workspace Button */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 px-2.5 text-left truncate max-w-[140px]">
                  <span className="truncate">{selectedWorkspaceName}</span>
                  <ChevronDown className="size-2.5 ml-1 shrink-0" />
                </Button>
                
                {workspaces.length > 0 && (
                  <select 
                    value={currentWorkspaceId || ""}
                    onChange={(e) => handleWorkspaceChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer text-[10px]"
                  >
                    <option value="">Select Workspace</option>
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>{ws.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Select Project Button */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 px-2.5 text-left truncate max-w-[120px]">
                  <span className="truncate">{selectedProjectName}</span>
                  <ChevronDown className="size-2.5 ml-1 shrink-0" />
                </Button>
                
                {activeWorkspaceProjects.length > 0 && (
                  <select 
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer text-[10px]"
                  >
                    <option value="">Select Project</option>
                    {activeWorkspaceProjects.map((proj) => (
                      <option key={proj.id} value={proj.id}>{proj.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setHasStartedChatting(false);
                  setActiveConvId(null);
                  setOptimisticMessages([]);
                }}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Danh sách Message chính */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 custom-scrollbar">
            <div className="space-y-6 max-w-3xl mx-auto pb-4">
              {displayedMessages.map((msg) => {
                const isAi = msg.senderRole === "ASSISTANT" || msg.role === "ASSISTANT";
                const draftData = msg.generation?.outputData;
                const draftTasks = draftData?.tasks ?? [];

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-4 ${isAi ? "justify-start" : "justify-end"}`}
                  >
                    {isAi && (
                      <div className="size-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Bot className="size-4 text-blue-500" />
                      </div>
                    )}

                    <div className={`space-y-2 max-w-[85%] ${isAi ? "order-2" : "order-1"}`}>
                      <div
                        className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed border ${
                          isAi
                            ? "bg-card/45 border-border/30 text-foreground"
                            : "bg-blue-600 text-white border-blue-500/10"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Draft Card preview */}
                      {isAi && msg.generation && (
                        <div className="mt-3">
                          <div className="border border-border/30 bg-card/70 rounded-2xl p-4 shadow-lg backdrop-blur relative overflow-hidden">
                            <div className="flex items-center justify-between border-b border-border/30 pb-3.5 mb-3.5">
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-3.5 text-blue-500" />
                                <span className="font-semibold text-xs text-foreground">
                                  {msg.generation.generationType === "WORKSPACE_TREE_DRAFT" ? "Đề xuất cấu trúc Workspace & Projects" :
                                   msg.generation.generationType === "WORKSPACE_DRAFT" ? "Đề xuất tạo Workspace mới" :
                                   msg.generation.generationType === "PROJECT_DRAFT" ? "Đề xuất tạo Project mới" :
                                   `Đề xuất bản nháp công việc (${draftTasks.length})`}
                                </span>
                              </div>
                              <div>
                                {msg.generation.status === "APPLIED" ? (
                                  <Badge className="bg-emerald-600/10 text-emerald-500 border border-emerald-500/15 text-[10px] px-2 py-0">
                                    ✓ Đã áp dụng
                                  </Badge>
                                ) : msg.generation.status === "DISCARDED" ? (
                                  <Badge className="bg-red-600/10 text-red-500 border border-red-500/15 text-[10px] px-2 py-0">
                                    Đã hủy
                                  </Badge>
                                ) : (
                                  <Badge className="bg-amber-600/10 text-amber-500 border border-amber-500/15 text-[10px] px-2 py-0">
                                    Chờ duyệt
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Render different draft content structures dynamically */}
                            <div className="max-h-[300px] overflow-y-auto w-full pr-1.5 space-y-3 pb-1">
                              {(() => {
                                const type = msg.generation.generationType;
                                const data = msg.generation.outputData;

                                if (type === "TASK_DRAFT" || !type) {
                                  const tasks = data?.tasks ?? [];
                                  return (
                                    <div className="space-y-3">
                                      {tasks.map((task: any, idx: number) => (
                                        <div key={idx} className="border border-border/20 bg-background/25 rounded-xl p-3">
                                          <div className="flex items-start justify-between gap-4 mb-1">
                                            <h4 className="font-medium text-xs text-foreground">{task.title}</h4>
                                            <div className="flex items-center gap-1 shrink-0">
                                              <Badge variant="outline" className="text-[8px] border-border/40 text-muted-foreground px-1 h-4 flex items-center">
                                                <Clock className="size-2 mr-0.5" /> {task.estimatedHours}h
                                              </Badge>
                                              <Badge className="text-[8px] bg-blue-600/10 text-blue-500 px-1 border-none h-4 flex items-center">
                                                {task.priority}
                                              </Badge>
                                            </div>
                                          </div>
                                          <p className="text-muted-foreground text-[11px] leading-relaxed mb-2">{task.description}</p>
                                          {task.subtasks && task.subtasks.length > 0 && (
                                            <div className="pl-2 border-l border-border/30 space-y-1 mt-2">
                                              {task.subtasks.map((sub: any, sidx: number) => (
                                                <div key={sidx} className="text-[10px] text-muted-foreground flex justify-between">
                                                  <span>• {sub.title}</span>
                                                  <span className="text-muted-foreground/60">{sub.estimatedHours}h</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }

                                if (type === "WORKSPACE_TREE_DRAFT") {
                                  const workspaces = data?.workspaces ?? [];
                                  return (
                                    <div className="space-y-4">
                                      {workspaces.map((ws: any, wIdx: number) => (
                                        <div key={wIdx} className="border border-border/30 bg-background/20 rounded-xl p-3 space-y-3">
                                          <div className="border-b border-border/20 pb-2">
                                            <span className="text-[9px] text-muted-foreground font-mono uppercase">Workspace</span>
                                            <h4 className="font-bold text-xs text-foreground">{ws.name} ({ws.slug})</h4>
                                          </div>
                                          {ws.projects && ws.projects.map((proj: any, pIdx: number) => (
                                            <div key={pIdx} className="border border-border/15 bg-background/10 rounded-lg p-2.5 space-y-2">
                                              <div className="flex items-center justify-between">
                                                <h5 className="font-semibold text-[11px] text-foreground">Project: {proj.name}</h5>
                                                <Badge variant="outline" className="text-[8px] border-border/40 text-muted-foreground">{proj.key}</Badge>
                                              </div>
                                              <p className="text-muted-foreground text-[10px] leading-relaxed">{proj.description}</p>
                                              {proj.tasks && proj.tasks.length > 0 && (
                                                <div className="space-y-1.5 pt-1.5 border-t border-border/15">
                                                  <span className="text-[9px] text-muted-foreground/80 font-medium block">Tasks ({proj.tasks.length}):</span>
                                                  {proj.tasks.map((task: any, tIdx: number) => (
                                                    <div key={tIdx} className="text-[10px] text-muted-foreground bg-accent/20 rounded p-1.5 flex justify-between items-center">
                                                      <div className="min-w-0 flex-1 pr-2">
                                                        <span className="font-medium text-foreground block truncate">{task.title}</span>
                                                      </div>
                                                      <Badge className="text-[8px] bg-blue-600/10 text-blue-500 shrink-0 border-none">{task.priority}</Badge>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }

                                if (type === "WORKSPACE_DRAFT") {
                                  return (
                                    <div className="border border-border/20 bg-background/25 rounded-xl p-3">
                                      <span className="text-[10px] text-muted-foreground font-mono uppercase">New Workspace</span>
                                      <h4 className="font-bold text-xs text-foreground mt-1">{data?.name}</h4>
                                      <span className="text-[10px] text-muted-foreground/75 font-mono">Slug: {data?.slug}</span>
                                    </div>
                                  );
                                }

                                if (type === "PROJECT_DRAFT") {
                                  return (
                                    <div className="border border-border/20 bg-background/25 rounded-xl p-3 space-y-2">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <span className="text-[10px] text-muted-foreground font-mono uppercase">New Project</span>
                                          <h4 className="font-bold text-xs text-foreground mt-0.5">{data?.name}</h4>
                                        </div>
                                        <Badge className="text-[9px] bg-blue-600/10 text-blue-500 border-none">{data?.key}</Badge>
                                      </div>
                                      <p className="text-muted-foreground text-[11px] leading-relaxed">{data?.description}</p>
                                      <span className="text-[9px] text-muted-foreground/60 block">Visibility: {data?.visibility}</span>
                                    </div>
                                  );
                                }

                                return <pre className="text-xs overflow-auto p-2 bg-background/40 rounded">{JSON.stringify(data, null, 2)}</pre>;
                              })()}
                            </div>

                            {msg.generation.status === "GENERATED" && (
                              <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-border/20">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs"
                                  disabled={applyGeneration.isPending || discardGeneration.isPending}
                                  onClick={() => handleDiscardDraft(msg.generation!.id)}
                                >
                                  Hủy bỏ
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                  disabled={applyGeneration.isPending || discardGeneration.isPending}
                                  onClick={() => handleApplyDraft(msg.generation!.id)}
                                >
                                  Áp dụng bản nháp
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <span className={`text-[9px] text-muted-foreground/60 block mt-1 ${isAi ? "text-left" : "text-right"}`}>
                        {msg.createdAt 
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Hôm nay"}
                      </span>
                    </div>

                    {!isAi && (
                      <div className="size-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                        <UserIcon className="size-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}

              {(sendAiMessage.isPending || createConversation.isPending) && (
                <div className="flex gap-4 justify-start">
                  <div className="size-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Bot className="size-4 text-blue-500 animate-spin" />
                  </div>
                  <div className="space-y-2 max-w-[85%]">
                    <div className="p-4 rounded-2xl border border-border/30 bg-card/45 text-foreground flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="size-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="size-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="size-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground italic">Trợ lý đang phân tích yêu cầu...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Panel chuyển xuống dưới cùng */}
          <div className="p-4 border-t border-border/30 bg-card/5 backdrop-blur-md shrink-0 flex flex-col gap-2">
            <div className="max-w-3xl mx-auto w-full flex items-center justify-between px-1">
              <div 
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 select-none" 
                onClick={() => setAutoApply(!autoApply)}
              >
                <input 
                  type="checkbox" 
                  checked={autoApply} 
                  onChange={() => {}} 
                  className="size-3 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer" 
                />
                <span className="text-[10px] text-muted-foreground">Tự động áp dụng bản nháp (Auto Apply)</span>
              </div>
              <span className="text-[9px] text-muted-foreground/50">Bật để tự động lưu thay vì xem trước</span>
            </div>
            
            <div className="max-w-3xl mx-auto w-full flex gap-2">
              <Input
                placeholder="Nhập yêu cầu tiếp theo..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                className="flex-1 h-10 rounded-xl bg-background/50 border-border/40 text-sm focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                disabled={sendAiMessage.isPending || createConversation.isPending}
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage} 
                disabled={sendAiMessage.isPending || createConversation.isPending || !inputMsg.trim()}
                className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shrink-0"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
