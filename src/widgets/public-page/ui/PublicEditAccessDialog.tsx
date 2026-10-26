"use client";

import Link from "next/link";
import { toast } from "sonner";

import { useRequestEditAccessFromSite } from "@/entities/page-access-request/model/page-access-request.mutations";
import { useMyPageAccessRequest } from "@/entities/page-access-request/model/page-access-request.queries";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

interface PublicEditAccessDialogProps {
	pageId: string;
	subdomain: string;
	path: string;
	authenticated: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PublicEditAccessDialog({
	pageId,
	subdomain,
	path,
	authenticated,
	open,
	onOpenChange,
}: PublicEditAccessDialogProps) {
	const myRequestQuery = useMyPageAccessRequest(pageId, open && authenticated);
	const requestMutation = useRequestEditAccessFromSite(pageId, subdomain, path);
	const pending = Boolean(myRequestQuery.data);

	const handleRequest = () => {
		requestMutation.mutate(undefined, {
			onSuccess: () => toast.success("Edit access requested"),
			onError: (error) =>
				toast.error(
					getApiErrorMessage(error, "Could not request edit access."),
				),
		});
	};

	const signInHref = `/sign-in?next=${encodeURIComponent(
		typeof window === "undefined"
			? "/"
			: window.location.pathname + window.location.search,
	)}`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{!authenticated
							? "Sign in to edit"
							: pending
								? "Edit access requested"
								: "Request edit access"}
					</DialogTitle>

					<DialogDescription>
						{!authenticated
							? "This page can be edited by members with permission. Sign in to continue."
							: pending
								? "Your request is waiting for approval from the page owner."
								: "You can only view this page. Ask the page owner for edit access?"}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						{pending ? "Close" : "Cancel"}
					</Button>

					{!authenticated ? (
						<Button asChild>
							<Link href={signInHref}>Sign in</Link>
						</Button>
					) : pending ? (
						<Button disabled>Request sent</Button>
					) : (
						<Button
							disabled={myRequestQuery.isLoading || requestMutation.isPending}
							onClick={handleRequest}
						>
							{requestMutation.isPending
								? "Requesting..."
								: "Request edit access"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
