import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		const cookieStore = await cookies();
		const refreshToken = cookieStore.get("refresh_token")?.value;

		if (refreshToken) {
			const baseURL = process.env.NEXT_PUBLIC_API_URL;
			if (baseURL) {
				// Proxy logout request to the external backend to invalidate the token
				// We don't await/care about the result to ensure local logout always succeeds
				fetch(`${baseURL}/auth/logout`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ refresh_token: refreshToken }),
				}).catch(console.error);
			}
		}

		// Always clear the local session cookie
		cookieStore.delete("refresh_token");

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Logout error:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
