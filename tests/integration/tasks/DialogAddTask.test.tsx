import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DialogAddTask from '@/components/dialog/DialogAddTask';
import { useTask, useTaskStatus } from '@/features/task/hooks/useTask';
import { useMember } from '@/features/member/hooks/useMember';
import { useUser } from '@/features/auth/hooks/useUser';
import { useProjectSelectionStore } from '@/stores/use-project-selection';
import { usePermission } from '@/features/permission/hooks/usePermission';

// Mock dependencies
vi.mock('@/features/task/hooks/useTask');
vi.mock('@/features/member/hooks/useMember');
vi.mock('@/features/auth/hooks/useUser');
vi.mock('@/stores/use-project-selection');
vi.mock('@/features/permission/hooks/usePermission');

// Mock Lucide icons to avoid rendering issues with SVGs in tests
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    Plus: () => <div data-testid="plus-icon" />,
  };
});

// Polyfill for ResizeObserver which is often needed by Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.HTMLElement.prototype.scrollIntoView = vi.fn();
global.HTMLElement.prototype.hasPointerCapture = vi.fn();
global.HTMLElement.prototype.releasePointerCapture = vi.fn();

describe('DialogAddTask', () => {
  let mockCreateTask: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateTask = vi.fn().mockResolvedValue({});

    vi.mocked(useTask).mockReturnValue({
      createTask: mockCreateTask,
    } as any);

    vi.mocked(useTaskStatus).mockReturnValue({
      data: { data: [{ id: 'status-1', name: 'To Do', color: 'bg-blue-500' }] },
    } as any);

    vi.mocked(useMember).mockReturnValue({
      findAllMember: {
        data: {
          data: [{ user_id: 'user-2', full_name: 'John Doe', email: 'john@example.com' }],
        },
      },
    } as any);

    vi.mocked(useUser).mockReturnValue({
      user: { id: 'user-1', name: 'Test User' },
    } as any);

    vi.mocked(useProjectSelectionStore).mockReturnValue({
      currentProjectId: 'proj-1',
      currentWorkspaceId: 'ws-1',
    } as any);

    vi.mocked(usePermission).mockReturnValue({
      can: vi.fn().mockReturnValue(true),
    } as any);
  });

  const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<DialogAddTask />);
    const triggerBtn = screen.getByRole('button');
    await user.click(triggerBtn);
    await waitFor(() => {
      expect(screen.getByText('Tạo công việc mới')).toBeInTheDocument();
    });
  };

  it('1. Render form: Hiển thị các field chính và nút submit', async () => {
    const user = userEvent.setup();
    await openDialog(user);

    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    expect(screen.getByText('Assignees')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Deadline')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument();
  });

  it('2. Validation: Submit bị disable khi thiếu title hoặc field bắt buộc', async () => {
    const user = userEvent.setup();
    await openDialog(user);

    const submitBtn = screen.getByRole('button', { name: 'Create Task' });
    
    // Ban đầu title rỗng nên button phải bị disable
    expect(submitBtn).toBeDisabled();

    // Gõ title
    const titleInput = screen.getByPlaceholderText('Task title');
    await user.type(titleInput, 'New task title');

    // Button sẽ enable
    expect(submitBtn).toBeEnabled();

    // Xóa title
    await user.clear(titleInput);
    expect(submitBtn).toBeDisabled();
    
    // Xác nhận mutation không bao giờ được gọi
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('3. Submit thành công: Gọi mutation đúng payload và đóng dialog', async () => {
    const user = userEvent.setup();
    await openDialog(user);

    const titleInput = screen.getByPlaceholderText('Task title');
    await user.type(titleInput, 'My awesome task');

    const submitBtn = screen.getByRole('button', { name: 'Create Task' });
    await user.click(submitBtn);

    expect(mockCreateTask).toHaveBeenCalledTimes(1);
    expect(mockCreateTask).toHaveBeenCalledWith({
      workspaceId: 'ws-1',
      projectId: 'proj-1',
      title: 'My awesome task',
      statusId: 'status-1',
      assigneeIds: [],
      startAt: null,
      dueAt: null,
      initialComment: null,
    });
    
    // Text loading state should be verified ideally but the dialog closes immediately on resolve 
    // because we mocked a synchronous-like fast resolve
  });

  it('4. Submit thất bại: Giữ form khi có lỗi', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCreateTask.mockRejectedValueOnce(new Error('API Error'));

    const user = userEvent.setup();
    await openDialog(user);

    const titleInput = screen.getByPlaceholderText('Task title');
    await user.type(titleInput, 'Failing task');

    const submitBtn = screen.getByRole('button', { name: 'Create Task' });
    await user.click(submitBtn);

    // Chờ console.error được gọi (do component handle error qua console.error)
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create task:', expect.any(Error));
    });

    // Form vẫn còn hiển thị (không gọi setOpen(false))
    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});
