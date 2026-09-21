import { useMutation } from "@tanstack/react-query";
import { pageAccessRequestApi } from "../api/page-access-request.api";

export function useCreatePageAccessRequest(pageId: string, token: string) {
	return useMutation({
		mutationFn: () =>
			pageAccessRequestApi.create(pageId, {
				token,
			}),
	});
}
