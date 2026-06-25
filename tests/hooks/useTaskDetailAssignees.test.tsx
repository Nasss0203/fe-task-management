import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTaskDetailAssignees } from "@/features/task/hooks/useTaskDetailAssignees";
import { useAssign } from "@/features/assign/hooks/useAssign";
import { useMember } from "@/features/member/hooks/useMember";
import { createWrapper } from "../utils/test-utils";

vi.mock("@/features/assign/hooks/useAssign");
vi.mock("@/features/member/hooks/useMember");

describe("useTaskDetailAssignees hook", () => {
  const mockAssign = vi.fn();
  const mockUnassign = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAssign).mockReturnValue({
      assign: { mutateAsync: mockAssign } as any,
      unassign: { mutateAsync: mockUnassign } as any,
    });

    vi.mocked(useMember).mockReturnValue({
      findAllMember: {
        data: {
          data: [
            { user_id: "user-1", full_name: "User One" },
            { user_id: "user-2", full_name: "User Two" },
          ],
        },
      },
    } as any);
  });

  const task = {
    id: "task-1",
    workspaceId: "ws-1",
    assignees: [{ userId: "user-1", name: "User One" }],
  } as any;

  const currentUser = { id: "user-1" } as any;

  it("1. Trả về đúng danh sách members từ API", () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useTaskDetailAssignees(task, currentUser), { wrapper });

    expect(result.current.members).toHaveLength(2);
    expect(result.current.members[0].isMe).toBe(true); // user-1 is currentUser
    expect(result.current.selectedMembers).toHaveLength(1);
    expect(result.current.selectedMembers[0].id).toBe("user-1");
  });

  it("2. handleToggle thêm người dùng (chưa được assign)", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useTaskDetailAssignees(task, currentUser), { wrapper });

    mockAssign.mockResolvedValueOnce({ success: true });

    await act(async () => {
      await result.current.onToggle("user-2");
    });

    expect(mockAssign).toHaveBeenCalledWith({
      taskId: "task-1",
      userId: "user-2",
    });

    // Sau khi toggle, selectedMembers sẽ bao gồm user-2
    expect(result.current.selectedMembers).toHaveLength(2);
  });

  it("3. handleToggle xóa người dùng (đã được assign)", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useTaskDetailAssignees(task, currentUser), { wrapper });

    mockUnassign.mockResolvedValueOnce({ success: true });

    await act(async () => {
      await result.current.onToggle("user-1");
    });

    expect(mockUnassign).toHaveBeenCalledWith("user-1");

    // Sau khi toggle xóa user-1, selectedMembers rỗng
    expect(result.current.selectedMembers).toHaveLength(0);
  });

  it("4. handleUnassign xóa người dùng cụ thể", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useTaskDetailAssignees(task, currentUser), { wrapper });

    mockUnassign.mockResolvedValueOnce({ success: true });

    await act(async () => {
      await result.current.onUnassign("user-1");
    });

    expect(mockUnassign).toHaveBeenCalledWith("user-1");
    expect(result.current.selectedMembers).toHaveLength(0);
  });

  it("5. rollback state nếu gọi API thất bại", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useTaskDetailAssignees(task, currentUser), { wrapper });

    mockUnassign.mockRejectedValueOnce(new Error("Failed to unassign"));

    await act(async () => {
      await result.current.onToggle("user-1");
    });

    // Nó vẫn trở lại state cũ (có 1 member) sau khi bị lỗi
    expect(result.current.selectedMembers).toHaveLength(1);
  });
});
