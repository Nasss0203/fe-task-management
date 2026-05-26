export interface ApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
}

export interface ApiPageResponse<T> extends ApiResponse<T> {
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}
