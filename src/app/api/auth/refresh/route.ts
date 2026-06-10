import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		const cookieStore = await cookies();
		const refreshToken = cookieStore.get("refresh_token")?.value;

		if (!refreshToken) {
			return NextResponse.json(
				{ message: "No refresh token found" },
				{ status: 401 },
			);
		}

		const baseURL = process.env.NEXT_PUBLIC_API_URL;
		if (!baseURL) {
			return NextResponse.json(
				{ message: "Server configuration error" },
				{ status: 500 },
			);
		}

		// Proxy request to the external backend
		const response = await fetch(`${baseURL}/auth/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refresh_token: refreshToken }),
		});

		if (!response.ok) {
			// Refresh failed (token expired/invalid) - clear cookie
			cookieStore.delete("refresh_token");
			return NextResponse.json(
				{ message: "Refresh token failed" },
				{ status: 401 },
			);
		}

		const data = await response.json();
		const newAccessToken = data.data?.access_token;
		const newRefreshToken = data.data?.refresh_token;

		if (!newAccessToken) {
			return NextResponse.json(
				{ message: "Invalid response from server" },
				{ status: 500 },
			);
		}

		// Update refresh token if server returned a new one (rotation)
		if (newRefreshToken) {
			cookieStore.set("refresh_token", newRefreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 30 * 24 * 60 * 60, // 30 days
			});
		}

		// Return the new access token to the client so it can store it in memory
		return NextResponse.json({
			success: true,
			data: { access_token: newAccessToken },
		});
	} catch (error) {
		console.error("Refresh proxy error:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
