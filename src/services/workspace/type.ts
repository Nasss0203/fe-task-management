export enum WORKSPACE_KEY {
	WORKSPACE = "workspace",
}

export interface WorkspaceDto {
	name: string;
}

export interface WorkspaceResonse {
	data: {
		id: string;
		name: string;
		slug: string;
		planType: string;
		createdAt: string;
		updatedAt: string;
	}[];
}
