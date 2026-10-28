export type CommentTargetType = "PAGE" | "PAGE_BLOCK" | "DATABASE_ROW";

/** Thứ được comment: page, block hoặc row của database. */
export interface CommentTarget {
	type: CommentTargetType;
	id: string;
}

/** `{ [blockId]: số comment }`; block không có comment thì không có key. */
export type BlockCommentCounts = Record<string, number>;

/** Người có thể mention trong page (thành viên workspace / teamspace xem được page). */
export interface MentionCandidate {
	id: string;
	username: string;
	email: string;
	avatar_url: string | null;
}

export interface CommentAuthor {
	id: string;
	username: string;
	email: string;
}

export interface Comment {
	id: string;
	page_id: string;
	target_type: CommentTargetType;
	target_id: string;
	parent_comment_id: string | null;
	body: string;
	author_id: string;
	/** null khi tài khoản tác giả không còn. */
	author: CommentAuthor | null;
	resolved_at: string | null;
	edited_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface CommentThread {
	root: Comment;
	replies: Comment[];
}
