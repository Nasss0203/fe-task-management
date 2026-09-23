"use client";

import { isAxiosError } from "axios";

import { useCreatePageAccessRequest } from "@/entities/page-access-request/model/page-access-request.mutations";

import { Button } from "@/shared/ui/button";

interface PageAccessGateProps {
	pageId: string;
	token: string;

	hasPendingRequest: boolean;

	isCheckingAccess: boolean;
	onCheckAccess: () => void;
}

export function PageAccessGate({
	pageId,
	token,
	hasPendingRequest,
	isCheckingAccess,
	onCheckAccess,
}: PageAccessGateProps) {
	const createRequest = useCreatePageAccessRequest(pageId, token);

	const alreadyPendingError =
		isAxiosError<{ message?: string }>(createRequest.error) &&
		createRequest.error.response?.status === 409 &&
		createRequest.error.response.data.message ===
			"Access request is already pending";

	/*
	 * Có 3 trường hợp được xem là đã gửi:
	 *
	 * 1. GET /access-requests/me trả PENDING
	 * 2. vừa POST thành công
	 * 3. backend trả 409 vì request đã tồn tại
	 */
	const requestSent =
		hasPendingRequest || createRequest.isSuccess || alreadyPendingError;

	const handleRequest = () => {
		if (!createRequest.isPending && !requestSent) {
			createRequest.mutate();
		}
	};

	return (
		<div className='flex min-h-screen items-center justify-center p-6'>
			<div className='w-full max-w-md space-y-4 rounded-xl border p-6 text-center'>
				<h1 className='text-xl font-semibold'>You need access</h1>

				<p className='text-sm text-muted-foreground'>
					This page is only available to people who have been granted
					access.
				</p>

				{requestSent && (
					<div role='status' className='text-sm'>
						<p>
							{hasPendingRequest || alreadyPendingError
								? "Access request already pending"
								: "Request sent"}
						</p>

						<p className='text-muted-foreground'>
							Waiting for approval
						</p>
					</div>
				)}

				{createRequest.isError && !alreadyPendingError && (
					<p role='alert' className='text-sm text-destructive'>
						Unable to request access. Please try again or check your
						access.
					</p>
				)}

				<div className='flex flex-wrap justify-center gap-2'>
					<Button
						type='button'
						disabled={createRequest.isPending || requestSent}
						onClick={handleRequest}
					>
						{createRequest.isPending
							? "Requesting..."
							: requestSent
								? "Request sent"
								: "Request access"}
					</Button>

					<Button
						type='button'
						variant='outline'
						disabled={isCheckingAccess || createRequest.isPending}
						onClick={onCheckAccess}
					>
						{isCheckingAccess
							? "Checking access..."
							: "Check access"}
					</Button>
				</div>
			</div>
		</div>
	);
}
