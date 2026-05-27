import { PAGE_KEY } from "@/services/page/type";
import { updatePageBlockApi } from "@/services/page_block/page_block.service";
import { PageBlockItem } from "@/services/page_block/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const usePageBlock = () => {
	const queryClient = useQueryClient();
	const updatePageBlock = useMutation({
		mutationFn: async (data: PageBlockItem) => {
			const result = await updatePageBlockApi(data);

			return result;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [PAGE_KEY.PAGE],
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
