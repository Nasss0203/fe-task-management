export const PERMISSIONS = {
	WORKSPACE_READ: "workspace.read",
	WORKSPACE_UPDATE: "workspace.update",
	WORKSPACE_DELETE: "workspace.delete",
	WORKSPACE_BILLING_READ: "workspace.billing.read",
	WORKSPACE_BILLING_MANAGE: "workspace.billing.manage",
	WORKSPACE_USAGE_READ: "workspace.usage.read",
	WORKSPACE_FEATURE_READ: "workspace.feature.read",
	WORKSPACE_FEATURE_UPDATE: "workspace.feature.update",

	WORKSPACE_MEMBER_READ: "workspace.member.read",
	WORKSPACE_MEMBER_ADD: "workspace.member.add",
	WORKSPACE_MEMBER_UPDATE_ROLE: "workspace.member.update_role",
	WORKSPACE_MEMBER_REMOVE: "workspace.member.remove",
	WORKSPACE_ROLE_MANAGE: "workspace.role.manage",

	PROJECT_CREATE: "project.create",
	PROJECT_READ: "project.read",
	PROJECT_UPDATE: "project.update",
	PROJECT_DELETE: "project.delete",

	BOARD_CREATE: "board.create",
	BOARD_READ: "board.read",
	BOARD_UPDATE: "board.update",
	BOARD_DELETE: "board.delete",

	TASK_CREATE: "task.create",
	TASK_READ: "task.read",
	TASK_UPDATE: "task.update",
	TASK_DELETE: "task.delete",
	TASK_ASSIGNEE_ADD: "task.assignee.add",
	TASK_ASSIGNEE_REMOVE: "task.assignee.remove",

	TASK_COMMENT_CREATE: "task.comment.create",
	TASK_COMMENT_READ: "task.comment.read",
	TASK_COMMENT_UPDATE: "task.comment.update",
	TASK_COMMENT_DELETE: "task.comment.delete",

	SPRINT_CREATE: "sprint.create",
	SPRINT_READ: "sprint.read",
	SPRINT_UPDATE: "sprint.update",
	SPRINT_DELETE: "sprint.delete",
	SPRINT_START: "sprint.start",
	SPRINT_COMPLETE: "sprint.complete",
	SPRINT_CANCEL: "sprint.cancel",

	PAGE_CREATE: "page.create",
	PAGE_READ: "page.read",
	PAGE_UPDATE: "page.update",
	PAGE_DELETE: "page.delete",

	PAGE_BLOCK_CREATE: "page_block.create",
	PAGE_BLOCK_READ: "page_block.read",
	PAGE_BLOCK_UPDATE: "page_block.update",
	PAGE_BLOCK_DELETE: "page_block.delete",

	TASK_STATUS_READ: "task_status.read",
	TASK_STATUS_MANAGE: "task_status.manage",

	TASK_PRIORITY_READ: "task_priority.read",
	TASK_PRIORITY_MANAGE: "task_priority.manage",

	ATTACHMENT_UPLOAD: "attachment.upload",
	ATTACHMENT_READ: "attachment.read",
	ATTACHMENT_DELETE: "attachment.delete",

	ACTIVITY_READ: "activity.read",
	AUDIT_LOG_READ: "audit_log.read",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
