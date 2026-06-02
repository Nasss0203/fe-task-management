export enum WORKSPACE_FEATURE_KEY {
	WORKSPACE_FEATURES = "workspace-features",
}

export enum FeatureKey {
	SPRINT_ENABLED = "sprint:enabled",
}

export type WorkspaceFeatureItem = {
	code: string;
	name: string;
	description: string | null;
	category: string | null;
	planEnabled: boolean;
	workspaceEnabled: boolean | null;
	enabled: boolean;
	metadata: Record<string, unknown> | null;
};

export type FindWorkspaceFeaturesResponse = {
	data: WorkspaceFeatureItem[];
};

export type UpdateWorkspaceFeaturePayload = {
	workspaceId: string;
	featureCode: FeatureKey | string;
	enabled: boolean;
};

export type UpdateWorkspaceFeatureResponse = {
	data: WorkspaceFeatureItem;
};
