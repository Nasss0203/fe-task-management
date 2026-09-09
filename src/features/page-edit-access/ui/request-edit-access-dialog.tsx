"use client";

import { useCreatePageEditRequest } from "@/entities/page-edit-request/model/page-edit-request.mutations";

import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

interface RequestEditAccessDialogProps {
	pageId: string;
	open: boolean;
	hasPendingEditRequest?: boolean;
	onOpenChange: (open: boolean) => void;
}

export function RequestEditAccessDialog({
	pageId,
	open,
	hasPendingEditRequest = false,
	onOpenChange,
}: RequestEditAccessDialogProps) {
	const createEditRequest = useCreatePageEditRequest();

	const handleRequest = () => {
		if (hasPendingEditRequest || createEditRequest.isPending) {
			return;
		}

		createEditRequest.mutate(pageId, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{hasPendingEditRequest
							? "Edit access requested"
							: "Request edit access"}
					</DialogTitle>

					<DialogDescription>
						{hasPendingEditRequest
							? "You still have view access to this page. Your edit access request is waiting for approval from the page owner."
							: "You currently only have view access to this page. Send a request for edit access?"}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					{hasPendingEditRequest ? (
						<>
							<Button
								variant='outline'
								onClick={() => onOpenChange(false)}
							>
								Close
							</Button>
							<Button disabled>Request sent</Button>
						</>
					) : (
						<>
							<Button
								variant='outline'
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>

							<Button
								disabled={createEditRequest.isPending}
								onClick={handleRequest}
							>
								{createEditRequest.isPending
									? "Requesting..."
									: "Request edit access"}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
