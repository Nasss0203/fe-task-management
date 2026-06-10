import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { refresh_token } = body;

		if (!refresh_token) {
			return NextResponse.json(
				{ message: "Refresh token is required" },
				{ status: 400 },
			);
		}

		// Set HttpOnly cookie for refresh token
		const cookieStore = await cookies();
		cookieStore.set("refresh_token", refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 30 * 24 * 60 * 60, // 30 days
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Session set error:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE() {
	const cookieStore = await cookies();
	cookieStore.delete("refresh_token");
	return NextResponse.json({ success: true });
}
