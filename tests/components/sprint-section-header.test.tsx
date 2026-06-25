import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SprintSectionHeader } from "@/features/sprint/components/SprintSectionHeader";
import { useSprints } from "@/features/sprint/hooks/useSprint";

import { PERMISSIONS } from "@/constants/permissions";

// Mock hooks and components correctly
vi.mock("@/features/sprint/hooks/useSprint");

vi.mock("@/features/permission/components/RequirePermission", () => ({
  RequirePermission: ({ children, code }: any) => {
    // If we mock a missing permission, we can check for a prop on window/global
    // But for simplicity, we assume permission is granted unless tested otherwise
    if ((global as any).__mockMissingPermission === code) return null;
    return <div data-testid="permission-wrapper" data-code={code}>{children}</div>;
  },
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "workspace-1" }),
}));

// Mock Dialogs to avoid nested complex logic in component tests
vi.mock("@/components/dialog/CompleteSprintDialog", () => ({
  CompleteSprintDialog: () => <button>Complete sprint mock</button>,
}));
vi.mock("@/components/dialog/DialogStartSprint", () => ({
  StartSprintDialog: () => <button>Start sprint mock</button>,
}));
vi.mock("@/components/dialog/DialogEditSprint", () => ({
  EditSprintDialog: ({ trigger }: any) => <div>{trigger}</div>,
}));
vi.mock("@/components/dialog/DialogDeleteSprint", () => ({
  DeleteSprintDialog: ({ trigger }: any) => <div>{trigger}</div>,
}));
vi.mock("@/components/dialog/DialogCancelSprint", () => ({
  CancelSprintDialog: ({ trigger }: any) => <div data-testid="cancel-sprint-trigger">{trigger}</div>,
}));

describe("SprintSectionHeader Component", () => {
  const defaultProps = {
    sprint: { id: "s1", name: "Sprint 1", tasks: [] } as any,
    projectId: "p1",
    workspaceId: "w1",
    open: true,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).__mockMissingPermission = null;

    vi.mocked(useSprints).mockReturnValue({
      cancelSprint: { mutate: vi.fn(), isPending: false },
      deleteSprint: { mutate: vi.fn(), isPending: false },
    } as any);
  });

  it("1. PLANNED status: Hiện Start và Delete (trong dropdown), không hiện Cancel/Complete", async () => {
    const user = userEvent.setup();
    render(<SprintSectionHeader {...defaultProps} status="PLANNED" />);

    expect(screen.getByText("Start sprint mock")).toBeInTheDocument();
    

    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons[menuButtons.length - 1]; // usually the last button
    await user.click(dropdownTrigger);

    await waitFor(() => {
      expect(screen.getByText("Delete sprint")).toBeInTheDocument();
      expect(screen.queryByText("Cancel sprint")).not.toBeInTheDocument();
    });
  });

  it("2. ACTIVE status: Hiện Complete và Cancel (dropdown), không hiện Delete", async () => {
    const user = userEvent.setup();
    render(<SprintSectionHeader {...defaultProps} status="ACTIVE" />);

    expect(screen.getByText("Complete sprint mock")).toBeInTheDocument();

    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons[menuButtons.length - 1];
    await user.click(dropdownTrigger);

    await waitFor(() => {
      expect(screen.getByText("Cancel sprint")).toBeInTheDocument();
      expect(screen.queryByText("Delete sprint")).not.toBeInTheDocument();
    });
  });

  it("3. COMPLETED status: Hiện View Report, không hiện Delete/Cancel", async () => {
    const user = userEvent.setup();
    render(<SprintSectionHeader {...defaultProps} status="COMPLETED" />);

    expect(screen.getByText("View Report")).toBeInTheDocument();

    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons[menuButtons.length - 1];
    await user.click(dropdownTrigger);

    await waitFor(() => {
      expect(screen.queryByText("Cancel sprint")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete sprint")).not.toBeInTheDocument();
    });
  });

  it("4. CANCELLED status: Hiện Delete (dropdown), không hiện Cancel/Start/Complete", async () => {
    const user = userEvent.setup();
    render(<SprintSectionHeader {...defaultProps} status="CANCELLED" />);

    expect(screen.queryByText("Start sprint mock")).not.toBeInTheDocument();
    expect(screen.queryByText("Complete sprint mock")).not.toBeInTheDocument();

    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons[menuButtons.length - 1];
    await user.click(dropdownTrigger);

    await waitFor(() => {
      expect(screen.getByText("Delete sprint")).toBeInTheDocument();
      expect(screen.queryByText("Cancel sprint")).not.toBeInTheDocument();
    });
  });

  it("5. User không có permission: Không render action nguy hiểm", async () => {
    // Giả lập thiếu quyền DELETE
    (global as any).__mockMissingPermission = PERMISSIONS.SPRINT_DELETE;
    
    const user = userEvent.setup();
    render(<SprintSectionHeader {...defaultProps} status="PLANNED" />);

    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons[menuButtons.length - 1];
    await user.click(dropdownTrigger);

    await waitFor(() => {
      // Permission mock trả về null nếu thiếu quyền
      expect(screen.queryByText("Delete sprint")).not.toBeInTheDocument();
    });
  });
});
