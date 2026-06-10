"use client";

import { useUser } from "@/features/auth/hooks/useUser";
import { isSystemAdmin } from "@/lib/auth/system-role";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export function AdminRouteGuard({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { user } = useUser();
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	useEffect(() => {
		if (!isHydrated) return;

		if (!user) {
			router.replace("/sign-in");
			return;
		}

		if (!isSystemAdmin(user)) {
			router.replace("/404");
			return;
		}
	}, [isHydrated, user, router]);

	if (!isHydrated) {
		// Return null trong lúc đợi hydrate để trang trắng mượt mà,
		// Không hiển thị "Đang kiểm tra..." để tránh lộ việc có trang admin.
		return null;
	}

	if (!user || !isSystemAdmin(user)) {
		return null;
	}

	return <>{children}</>;
}
