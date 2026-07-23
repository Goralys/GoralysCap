/*
 * Copyright (C) 2026 Sami Saubion
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@goralys/core";
import { GuardOptions } from "@/app/src/lib/types";
import { navigateTo } from "@/app/src/lib/navigation/navigation-listener";
import { getSchoolToken } from "@/app/src/lib/auth/school-token";

interface RoleGuardOptions extends GuardOptions {
    allowedRoles: UserRole["role"][];
    onSuccess?: (role: UserRole["role"]) => void;
}

interface RoleGuardResult {
    loading: boolean;
    authorized: boolean;
    role: UserRole["role"] | null;
}

export function useRoleGuard({ enabled, allowedRoles, onSuccess }: RoleGuardOptions): RoleGuardResult {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [role, setRole] = useState<UserRole["role"] | null>(null);
    const onSuccessRef = useRef(onSuccess);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
    });

    useEffect(() => {
        if (!enabled) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            setAuthorized(false);
            setRole(null);
            return;
        }

        let cancelled = false;

        async function checkRole(): Promise<void> {
            const apiUrl = process.env.NEXT_PUBLIC_API_DOMAIN;
            if (!apiUrl) {
                console.error("NEXT_PUBLIC_API_DOMAIN is not set");
                navigateTo("/user/login?reason=server_error");
                return;
            }

            let res: Response;
            try {
                res = await fetch(`${apiUrl}/user/role`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "X-High-School-Token": getSchoolToken(),
                        "X-Goralys-Client": "mobile",
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                        Expires: "0",
                    },
                    cache: "no-store",
                });
            } catch (err) {
                console.error("Error calling role API:", err);
                if (!cancelled) navigateTo("/user/login?reason=server_error");
                return;
            }

            if (cancelled) return;

            if (res.status === 401) {
                navigateTo("/user/login?reason=unauthenticated");
                return;
            }
            if (!res.ok) {
                console.error("Role API returned non-ok status:", res.status);
                navigateTo("/user/login?reason=unauthenticated");
                return;
            }

            let fetchedRole: UserRole["role"];
            try {
                const data = await res.json();
                fetchedRole = data?.role;
            } catch (err) {
                console.error("Failed to parse JSON from role API:", err);
                navigateTo("/user/login?reason=unauthenticated");
                return;
            }

            if (cancelled) return;

            if (!fetchedRole) {
                console.error("Role API returned no role field");
                navigateTo("/user/login?reason=unauthenticated");
                return;
            }

            if (!allowedRoles.includes(fetchedRole)) {
                navigateTo("/user/login?reason=unauthorized");
                return;
            }

            setRole(fetchedRole);
            setAuthorized(true);
            setLoading(false);
            onSuccessRef.current?.(fetchedRole);
        }

        checkRole().then();

        return (): void => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowedRoles.join(","), enabled, router]);

    return { loading, authorized, role };
}
