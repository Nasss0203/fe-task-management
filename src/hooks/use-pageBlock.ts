import { PAGE_KEY, PageBlockItems } from "@/services/page/type";
import { updatePageBlockApi } from "@/services/page_block/page_block.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const usePageBlock = () => {
	const queryClient = useQueryClient();
	const updatePageBlock = useMutation({
		mutationFn: async (data: PageBlockItems) => {
			const result = await updatePageBlockApi(data);
			console.log("🚀 ~ result~", result);

			return result;
		},
		onSuccess: async (res) => {
			await queryClient.invalidateQueries({
				queryKey: [PAGE_KEY.PAGE], // sửa thành queryKey thật trong usePage
			});
		},
		onError: (err) => {
			console.error("updatePageBlock failed", err);
		},
	});

	return {
		updatePageBlock,
	};
};
