/*
 * Copyright (C) 2026 Sami Saubion
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
"use client";

import { usePathname } from "next/navigation";
import { useSubjectsGuard } from "@/app/src/lib/proxies/guard/subjects-guard";
import { useAdminsGuard } from "@/app/src/lib/proxies/guard/admins-guard";
import { useFoolsGuard } from "@/app/src/lib/proxies/guard/fools-guard";
import { useSchoolGuard } from "@/app/src/lib/proxies/guard/school-guard";

const routes: Array<{
    matcher: RegExp;
    guard: "subjects" | "admins" | "fools" | "school";
}> = [
    { matcher: /^\/subject/, guard: "subjects" },
    { matcher: /^\/admin/, guard: "admins" },
    { matcher: /^\/coffee/, guard: "fools" },
    { matcher: /^\/tea/, guard: "fools" },
];

/**
 * This component is used to fake the behavior of Next.js' proxy.
 * Because on mobile there is no server-side code, all the logic had to be re-written client-side.
 * @constructor
 */
export function RouteGuards(): null {
    const pathname = usePathname();

    const activeGuard = routes.find((r) => r.matcher.test(pathname))?.guard;

    useSubjectsGuard({ enabled: activeGuard === "subjects", pathname });
    useAdminsGuard({ enabled: activeGuard === "admins", pathname });
    useFoolsGuard({ enabled: activeGuard === "fools", pathname });

    const isHome = pathname === "/";
    useSchoolGuard({ enabled: !isHome, pathname });

    return null;
}
