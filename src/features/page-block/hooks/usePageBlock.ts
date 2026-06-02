import {
	createPageBlockApi,
	deletePageBlockApi,
	findPageBlocksByPageApi,
	reorderPageBlocksApi,
	updatePageBlockApi,
} from "@/services/page_block/page_block.service";
import {
	CreatePageBlockPayload,
	DeletePageBlockPayload,
	FindPageBlocksByPageResponse,
	PAGE_BLOCK_KEY,
	PageBlockItem,
	ReorderPageBlockPayload,
} from "@/services/page_block/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UsePageBlockParams = {
	pageId?: string;
};

export const usePageBlock = ({ pageId }: UsePageBlockParams = {}) => {
	const queryClient = useQueryClient();

	const pageBlocks = useQuery({
		queryKey: [PAGE_BLOCK_KEY.PAGE_BLOCKS, pageId],
		queryFn: () => findPageBlocksByPageApi(pageId as string),
		enabled: !!pageId,
	});

	const upsertPageBlockCache = (block: PageBlockItem) => {
		if (!block?.id || !block.page_id) return false;

		const previous = queryClient.getQueryData<FindPageBlocksByPageResponse>(
			[PAGE_BLOCK_KEY.PAGE_BLOCKS, block.page_id],
		);

		if (!previous?.data) return false;

		const nextBlocks = previous.data
			.filter((item) => item.id !== block.id)
			.concat(block)
			.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

		queryClient.setQueryData<FindPageBlocksByPageResponse>(
			[PAGE_BLOCK_KEY.PAGE_BLOCKS, block.page_id],
			{
				...previous,
				data: nextBlocks,
			},
		);

		return true;
	};

	const removePageBlockCache = ({
		blockId,
		pageId,
	}: DeletePageBlockPayload) => {
		const previous = queryClient.getQueryData<FindPageBlocksByPageResponse>(
			[PAGE_BLOCK_KEY.PAGE_BLOCKS, pageId],
		);

		if (!previous?.data) return false;

		queryClient.setQueryData<FindPageBlocksByPageResponse>(
			[PAGE_BLOCK_KEY.PAGE_BLOCKS, pageId],
			{
				...previous,
				data: previous.data.filter((block) => block.id !== blockId),
			},
		);

		return true;
	};

	const replacePageBlocksCache = (
		pageId: string,
		blocks: PageBlockItem[],
	) => {
		const previous = queryClient.getQueryData<FindPageBlocksByPageResponse>(
			[PAGE_BLOCK_KEY.PAGE_BLOCKS, pageId],
		);

		if (!previous?.data) return false;

		const nextBlocks = [...blocks].sort(
			(a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
		);

		queryClient.setQueryData<FindPageBlocksByPageResponse>(
			[PAGE_BLOCK_KEY.PAGE_BLOCKS, pageId],
			{
				...previous,
				data: nextBlocks,
			},
		);

		return true;
	};

	const refetchPageBlocks = async (pageId?: string) => {
		await queryClient.invalidateQueries({
			queryKey: pageId
				? [PAGE_BLOCK_KEY.PAGE_BLOCKS, pageId]
				: [PAGE_BLOCK_KEY.PAGE_BLOCKS],
		});
	};

	const createPageBlock = useMutation({
		mutationFn: async (data: CreatePageBlockPayload) => {
			const result = await createPageBlockApi(data);

			return result;
		},
		onSuccess: (block) => {
			const hasUpdatedCache = upsertPageBlockCache(block);

			if (!hasUpdatedCache) {
				void refetchPageBlocks(block.page_id);
				return;
			}

			void refetchPageBlocks(block.page_id);
		},
		onSettled: (_, error, variables) => {
			if (error) void refetchPageBlocks(variables.page_id);
		},
		onError: (err) => {
			console.error("createPageBlock failed", err);
		},
	});

	const updatePageBlock = useMutation({
		mutationFn: async (data: PageBlockItem) => {
			const result = await updatePageBlockApi(data);

			return result;
		},
		onSuccess: (block) => {
			const hasUpdatedCache = upsertPageBlockCache(block);

			if (!hasUpdatedCache) {
				void refetchPageBlocks(block.page_id);
				return;
			}

			void refetchPageBlocks(block.page_id);
		},
		onSettled: (_, error, variables) => {
			if (error) void refetchPageBlocks(variables.page_id);
		},
		onError: (err) => {
			console.error("updatePageBlock failed", err);
		},
	});

	const deletePageBlock = useMutation({
		mutationFn: async (data: DeletePageBlockPayload) => {
			await deletePageBlockApi(data);

			return data;
		},
		onSuccess: (data) => {
			const hasUpdatedCache = removePageBlockCache(data);

			if (!hasUpdatedCache) {
				void refetchPageBlocks(data.pageId);
				return;
			}

			void refetchPageBlocks(data.pageId);
		},
		onSettled: (_, error, variables) => {
			if (error) void refetchPageBlocks(variables?.pageId);
		},
		onError: (err) => {
			console.error("deletePageBlock failed", err);
		},
	});

	const reorderPageBlocks = useMutation({
		mutationFn: async (data: ReorderPageBlockPayload) => {
			const result = await reorderPageBlocksApi(data);

			return result;
		},
		onSuccess: (blocks, variables) => {
			const hasUpdatedCache = replacePageBlocksCache(
				variables.page_id,
				blocks,
			);

			if (!hasUpdatedCache) {
				void refetchPageBlocks(variables.page_id);
			}
		},
		onSettled: (_, error, variables) => {
			if (error) void refetchPageBlocks(variables?.page_id);
		},
		onError: (err) => {
			console.error("reorderPageBlocks failed", err);
		},
	});

	return {
		pageBlocks,
		createPageBlock,
		updatePageBlock,
		deletePageBlock,
		reorderPageBlocks,
	};
};
