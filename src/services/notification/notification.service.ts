import instance from "../axios";
import { FindNotificationParams, FindNotificationResponse } from "./type";

export const findMyNotificationsApi = async (
	params?: FindNotificationParams,
) => {
	const result =
		await instance.get<FindNotificationResponse>("/notifications");

	return result.data;
};
