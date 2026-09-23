"use client";

import { isAxiosError } from "axios";
import { useEffect } from "react";

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
		isAxiosError<{
			message?: string;
		}>(createRequest.error) &&
		createRequest.error.response?.status === 409 &&
		createRequest.error.response.data.message ===
			"Access request is already pending";

	useEffect(() => {
		if (hasPendingRequest) {
			createRequest.reset();
		}
	}, [hasPendingRequest, createRequest.reset]);

	const requestSent =
		hasPendingRequest || createRequest.isSuccess || alreadyPendingError;

	const handleRequest = () => {
		if (createRequest.isPending || requestSent) {
			return;
		}

		createRequest.mutate();
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
						<p className='font-medium'>Request sent</p>

						<p className='text-muted-foreground'>
							Waiting for approval
						</p>
					</div>
				)}

				{createRequest.isError && !alreadyPendingError && (
					<p role='alert' className='text-sm text-destructive'>
						Unable to request access. Please try again.
					</p>
				)}

				{!requestSent && (
					<div className='flex flex-wrap justify-center gap-2'>
						<Button
							type='button'
							disabled={createRequest.isPending}
							onClick={handleRequest}
						>
							{createRequest.isPending
								? "Requesting..."
								: "Request access"}
						</Button>

						<Button
							type='button'
							variant='outline'
							disabled={
								isCheckingAccess || createRequest.isPending
							}
							onClick={onCheckAccess}
						>
							{isCheckingAccess
								? "Checking access..."
								: "Check access"}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
