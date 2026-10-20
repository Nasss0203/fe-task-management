"use client";

import { Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { buildPageBlockTree } from "@/entities/page-block/lib/build-page-block-tree";
import { usePageBlocks } from "@/entities/page-block/model/page-block.queries";
import { useMyPageEditRequests } from "@/entities/page-edit-request/model/page-edit-request.queries";
import { PageContent, PageCover, PageHeader } from "@/entities/page/ui/page-surface";
import { usePage } from "@/entities/page/model/page.queries";

import { PageEditAccessBoundary } from "@/features/page-access/ui/page-edit-access-boundary";
import { RequestEditAccessDialog } from "@/features/page-edit-access/ui/request-edit-access-dialog";

import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";

import { AiChat } from "@/widgets/ai-chat/ui/AiChat";
import { PageBlockList } from "@/widgets/page-block-editor/ui/page-block-list";

export default function PageDetail() {
  const params = useParams<{
    pageId: string;
  }>();

  const [requestEditOpen, setRequestEditOpen] = useState(false);

  const { data: page, isLoading, isError } = usePage(params.pageId);

  const { data: blocks = [], isLoading: isBlocksLoading } = usePageBlocks(
    params.pageId,
  );

  const { data: myEditRequests = [], isLoading: isEditRequestsLoading } =
    useMyPageEditRequests(Boolean(page && !page.canEdit));

  const pendingEditRequest = myEditRequests.find(
    (request) =>
      request.pageId === params.pageId && request.status === "PENDING",
  );

  const hasPendingEditRequest = !!pendingEditRequest;

  const blockTree = useMemo(() => buildPageBlockTree(blocks), [blocks]);

  if (
    isLoading ||
    isBlocksLoading ||
    (Boolean(page && !page.canEdit) && isEditRequestsLoading)
  ) {
    return <div className="p-6">Loading...</div>;
  }

  if (isError || !page) {
    return <div className="p-6">Page not found</div>;
  }

<<<<<<< HEAD
	return (
		<div className='w-full min-w-0'>
			{page.cover_url && <PageCover url={page.cover_url} />}

			<PageHeader icon={page.icon} title={page.title} />

			<PageEditAccessBoundary
				canEdit={page.canEdit}
				onRequestEdit={() => {
					setRequestEditOpen(true);
				}}
			>
				<PageContent>
					<PageBlockList
						pageId={page.id}
						blocks={blockTree}
						canEdit={page.canEdit}
					/>
				</PageContent>
			</PageEditAccessBoundary>
=======
  return (
    <div className="w-full min-w-0">
      {page.cover_url && (
        <div className="h-64 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.cover_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4 px-12 pt-10 md:px-16 lg:px-24">
        <div className="flex min-w-0 items-center gap-1">
          <div className="mb-3 text-5xl">{page.icon || "📄"}</div>

          <h1 className="min-w-0 truncate text-4xl font-bold">
            {page.title || "Untitled"}
          </h1>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
            >
              <Sparkles className="size-4" />
              Ask AI
            </Button>
          </SheetTrigger>
>>>>>>> feat/ui

          <SheetContent
            side="right"
            className="flex w-full flex-col p-0 sm:max-w-xl"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>AI Assistant</SheetTitle>

              <SheetDescription>
                Ask AI to work with the current page.
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1">
              <AiChat showHeader currentPageId={page.id} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <PageEditAccessBoundary
        canEdit={page.canEdit}
        onRequestEdit={() => {
          setRequestEditOpen(true);
        }}
      >
        <div className="mt-14 w-full min-w-0 max-w-full px-12 md:px-16 lg:px-24">
          <PageBlockList
            pageId={page.id}
            blocks={blockTree}
            canEdit={page.canEdit}
          />
        </div>
      </PageEditAccessBoundary>

      <RequestEditAccessDialog
        pageId={page.id}
        open={requestEditOpen && !page.canEdit}
        hasPendingEditRequest={hasPendingEditRequest}
        onOpenChange={setRequestEditOpen}
      />
    </div>
  );
}
