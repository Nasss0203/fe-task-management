import instance from "../axios";
import { PageBlockItem } from "../page/type";

export const updatePageBlockApi = async (
	data: PageBlockItem,
): Promise<PageBlockItem> => {
	const response = await instance.patch<PageBlockItem>(
		`/pageBlock/${data.id}`,
		data,
	);
	return response.data;
};
