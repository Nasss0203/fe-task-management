import instance from "../axios";
import { FindAllWorkspaceTemplateResponse } from "./type";

export const findAllWorkspaceTemplatesApi =
	async (): Promise<FindAllWorkspaceTemplateResponse> => {
		const response =
			await instance.get<FindAllWorkspaceTemplateResponse>(
				"/workspace-templates",
			);
		return response.data;
	};
