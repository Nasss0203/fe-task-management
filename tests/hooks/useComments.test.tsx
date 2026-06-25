import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGetComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/features/task/hooks/useComments";
import { commentService } from "@/services/comment/comment.service";
import { createWrapper } from "../utils/test-utils";
import { COMMENT_KEY } from "@/services/comment/type";

vi.mock("@/services/comment/comment.service", () => ({
  commentService: {
    getComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

describe("useComments hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useGetComments", () => {
    it("1. Gọi getComments api và trả về dữ liệu", async () => {
      const { wrapper } = createWrapper();
      vi.mocked(commentService.getComments).mockResolvedValueOnce([{ id: "c1", content: "Test comment" } as any]);

      const { result } = renderHook(() => useGetComments("ws1", "pj1", "t1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([{ id: "c1", content: "Test comment" }]);
      expect(commentService.getComments).toHaveBeenCalledWith("ws1", "pj1", "t1");
    });
  });

  describe("useCreateComment", () => {
    it("2. Gọi createComment api và cập nhật optimistic update", async () => {
      const { wrapper, queryClient } = createWrapper();
      const queryKey = [COMMENT_KEY.COMMENTS, "ws1", "pj1", "t1"];
      
      // Setup initial data
      queryClient.setQueryData(queryKey, [{ id: "c1", content: "Old comment" }]);
      
      vi.mocked(commentService.createComment).mockResolvedValueOnce({ id: "c2", content: "New comment" } as any);

      const { result } = renderHook(() => useCreateComment(), { wrapper });

      result.current.mutate({
        workspaceId: "ws1",
        projectId: "pj1",
        taskId: "t1",
        content: "New comment",
      });

      // Optimistic update
      await waitFor(() => {
        const data: any = queryClient.getQueryData(queryKey);
        expect(data).toHaveLength(2);
        expect(data[1].content).toBe("New comment");
        expect(data[1].authorName).toBe("Sending...");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(commentService.createComment).toHaveBeenCalledWith({
        workspaceId: "ws1",
        projectId: "pj1",
        taskId: "t1",
        content: "New comment",
      });
    });
  });

  describe("useUpdateComment", () => {
    it("3. Gọi updateComment api và cập nhật optimistic update", async () => {
      const { wrapper, queryClient } = createWrapper();
      const queryKey = [COMMENT_KEY.COMMENTS, "ws1", "pj1", "t1"];
      
      queryClient.setQueryData(queryKey, [{ id: "c1", content: "Old comment" }]);
      
      vi.mocked(commentService.updateComment).mockResolvedValueOnce({ id: "c1", content: "Updated" } as any);

      const { result } = renderHook(() => useUpdateComment(), { wrapper });

      result.current.mutate({
        workspaceId: "ws1",
        projectId: "pj1",
        taskId: "t1",
        commentId: "c1",
        content: "Updated",
      });

      // Optimistic update
      await waitFor(() => {
        const data: any = queryClient.getQueryData(queryKey);
        expect(data[0].content).toBe("Updated");
        expect(data[0].isEdited).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe("useDeleteComment", () => {
    it("4. Gọi deleteComment api và cập nhật optimistic update", async () => {
      const { wrapper, queryClient } = createWrapper();
      const queryKey = [COMMENT_KEY.COMMENTS, "ws1", "pj1", "t1"];
      
      queryClient.setQueryData(queryKey, [{ id: "c1", content: "Old comment" }]);
      
      vi.mocked(commentService.deleteComment).mockResolvedValueOnce({ success: true } as any);

      const { result } = renderHook(() => useDeleteComment(), { wrapper });

      result.current.mutate({
        workspaceId: "ws1",
        projectId: "pj1",
        taskId: "t1",
        commentId: "c1",
      });

      // Optimistic update (comment id c1 should be removed)
      await waitFor(() => {
        const data: any = queryClient.getQueryData(queryKey);
        expect(data).toHaveLength(0);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
