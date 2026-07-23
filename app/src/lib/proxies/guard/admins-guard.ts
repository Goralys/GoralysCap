/*
 * Copyright (C) 2026 Sami Saubion
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
"use client";

import { GuardOptions } from "@/app/src/lib/types";
import { useRoleGuard } from "@/app/src/lib/proxies/guard/role-guard";

type AdminsGuardOptions = GuardOptions;

export function useAdminsGuard({ enabled, pathname }: AdminsGuardOptions): void {
    useRoleGuard({ enabled, pathname, allowedRoles: ["admin"] });
}
