"use client";

import { GuardOptions } from "@/app/src/lib/types";
import { useRoleGuard } from "@/app/src/lib/proxies/guard/role-guard";
import { navigateTo } from "@/app/src/lib/navigation/navigation-listener";

type SubjectsGuardOptions = GuardOptions;

export function useSubjectsGuard({ enabled, pathname }: SubjectsGuardOptions): void {
    useRoleGuard({
        enabled,
        pathname,
        onSuccess: (role): void => {
            if (pathname.endsWith("subject/")) {
                navigateTo(`/subject/${role}`);
            } else {
                navigateTo(pathname);
            }
        },
        allowedRoles: ["student", "teacher"],
    });
}
