export enum ActivityAction {
  // Task
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  TASK_RESTORED = "TASK_RESTORED",

  TASK_STATUS_CHANGED = "TASK_STATUS_CHANGED",
  TASK_PRIORITY_CHANGED = "TASK_PRIORITY_CHANGED",
  TASK_TITLE_CHANGED = "TASK_TITLE_CHANGED",
  TASK_DESCRIPTION_CHANGED = "TASK_DESCRIPTION_CHANGED",
  TASK_DUE_DATE_CHANGED = "TASK_DUE_DATE_CHANGED",
  TASK_START_DATE_CHANGED = "TASK_START_DATE_CHANGED",
  TASK_ESTIMATE_CHANGED = "TASK_ESTIMATE_CHANGED",

  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_UNASSIGNED = "TASK_UNASSIGNED",

  TASK_MOVED_TO_SPRINT = "TASK_MOVED_TO_SPRINT",
  TASK_REMOVED_FROM_SPRINT = "TASK_REMOVED_FROM_SPRINT",
  TASK_MOVED_TO_BACKLOG = "TASK_MOVED_TO_BACKLOG",

  // Sprint
  SPRINT_CREATED = "SPRINT_CREATED",
  SPRINT_UPDATED = "SPRINT_UPDATED",
  SPRINT_STARTED = "SPRINT_STARTED",
  SPRINT_COMPLETED = "SPRINT_COMPLETED",
  SPRINT_CANCELLED = "SPRINT_CANCELLED",
  SPRINT_DELETED = "SPRINT_DELETED",
  SPRINT_RESTORED = "SPRINT_RESTORED",

  // Comment
  COMMENT_CREATED = "COMMENT_CREATED",
  COMMENT_UPDATED = "COMMENT_UPDATED",
  COMMENT_DELETED = "COMMENT_DELETED",

  // Workspace / Project
  WORKSPACE_MEMBER_JOINED = "WORKSPACE_MEMBER_JOINED",
  WORKSPACE_MEMBER_REMOVED = "WORKSPACE_MEMBER_REMOVED",
  WORKSPACE_MEMBER_ROLE_CHANGED = "WORKSPACE_MEMBER_ROLE_CHANGED",

  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_DELETED = "PROJECT_DELETED",
  PROJECT_RESTORED = "PROJECT_RESTORED",
}

export type ActivityActorResponseDto = {
  id: string;
  username: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export type ActivityResponseDto = {
  id: string;
  workspaceId: string;
  projectId: string | null;
  entityType: string;
  entityId: string;
  actorId: string | null;
  actor?: ActivityActorResponseDto | null;
  action: ActivityAction;
  field: string | null;
  oldValue: unknown | null;
  newValue: unknown | null;
  metadata: Record<string, unknown> | null;
  isSystem: boolean;
  createdAt: string;
};

export type FindActivityResponse = {
  items: ActivityResponseDto[];
  nextCursor: string | null;
};
