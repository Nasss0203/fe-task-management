import api from "../axios";
import type { Assignee, AssignInput } from "./type";

export const assignService = {
	assign: async (input: AssignInput): Promise<Assignee> => {
		const { data } = await api.post("/task-assignee", {
			taskId: input.taskId,
			userId: input.userId,
		});
		return data;
	},

	unassign: async (taskId: string, userId: string): Promise<void> => {
		await api.delete(`/task-assignee/task/${taskId}/user/${userId}`);
	},
};
