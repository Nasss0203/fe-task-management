import instance from "../axios";
import { PageBlockItems } from "../page/type";

export const updatePageBlockApi = async (
	data: PageBlockItems,
): Promise<PageBlockItems> => {
	const response = await instance.patch<PageBlockItems>(
		`/pageBlock/${data.id}`,
		data,
	);
	return response.data;
};
