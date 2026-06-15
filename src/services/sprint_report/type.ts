export const SPRINT_REPORT_KEY = {
  SPRINT_REPORTS: "sprint_reports",
};

export type SprintReport = {
  id: string;
  workspaceId: string;
  projectId: string;
  sprintId: string;
  sprintName: string;
  sprintGoal?: string | null;
  totalTasks: number;
  completedTasks: number;
  incompleteTasks: number;
  totalEstimate: number;
  completedEstimate: number;
  completedTaskIds: string[];
  incompleteTaskIds: string[];
  memberPerformance: {
    assigneeId: string;
    assigneeName?: string;
    avatar?: string;
    completedTasks: number;
    incompleteTasks: number;
    completedEstimate: number;
    incompleteEstimate: number;
  }[];
  completedTaskDetails: {
    id: string;
    projectSeq: number;
    title: string;
    estimateMinutes: number;
    assignees: { userId: string; name?: string; avatar?: string }[];
  }[];
  incompleteTaskDetails: {
    id: string;
    projectSeq: number;
    title: string;
    estimateMinutes: number;
    assignees: { userId: string; name?: string; avatar?: string }[];
  }[];
  startAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SprintReportParams = {
  workspaceId: string;
  projectId: string;
};
