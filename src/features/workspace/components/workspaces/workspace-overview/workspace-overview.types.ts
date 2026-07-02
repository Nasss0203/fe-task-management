export type WorkspaceOverviewApiResponse = {
  statusCode: number;
  message: string;
  data: WorkspaceOverviewApiData;
};

export type WorkspaceOverviewApiData = {
  metrics: {
    projects: {
      count: number;
      newThisWeek: number;
    };
    openTasks: {
      count: number;
      assignedToMe: number;
    };
    overdueTasks: {
      count: number;
      assignedToMe: number;
    };
    members: {
      count: number;
      activeRecently: number;
    };
  };

  projects: WorkspaceOverviewProject[];

  taskStatus: {
    total: number;
    items: WorkspaceOverviewTaskStatusItem[];
  };

  attentionItems: WorkspaceOverviewAttentionItem[];

  myTasks: WorkspaceOverviewMyTask[];

  activities: WorkspaceOverviewActivity[];

  upcomingDeadlines: WorkspaceOverviewDeadline[];
};

export type WorkspaceOverviewProject = {
  id: string;
  name: string;
  code: string;
  health: 'on-track' | 'at-risk' | 'almost-done';
  progress: number;
  totalTasks: number;
  openTasks: number;
  doneTasks: number;
  overdueTasks: number;
  deadline: string | null;
  members: {
    id: string;
    name: string;
    avatarUrl: string | null;
  }[];
};

export type WorkspaceOverviewTaskStatusItem = {
  statusId: string;
  name: string;
  count: number;
  isDone: boolean;
  color: string | null;
  position: number | null;
};

export type WorkspaceOverviewAttentionItem = {
  id: string;
  type: 'overdue' | 'deadline-soon' | 'unassigned';
  count: number;
  projectId: string | null;
  projectName: string | null;
};

export type WorkspaceOverviewMyTask = {
  id: string;
  title: string;
  dueAt: string | null;
  daysRemaining: number | null;
  isOverdue: boolean;
  project: {
    id: string;
    name: string;
  };
  status: {
    id: string;
    name: string;
    isDone: boolean;
    color: string | null;
  };
  priority: {
    id: string;
    name: string;
    level: number | null;
    color: string | null;
  } | null;
};

export type WorkspaceOverviewActivity = {
  id: string;
  actor: {
    id: string | null;
    name: string;
    avatarUrl: string | null;
  };
  action: string;
  entityType: string;
  entityId: string | null;
  targetName: string | null;
  field: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type WorkspaceOverviewDeadline = {
  id: string;
  title: string;
  type: 'task' | 'sprint';
  deadline: string;
  daysRemaining: number;
  isUrgent: boolean;
  projectId: string;
};
