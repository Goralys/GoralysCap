/*
 * Copyright (C) 2026 Sami Saubion
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useEffect } from "react";
import { emptyUserCacheClient, fetchCsrfClient, goralysFetchClient, onUserEvent } from "@goralys/core";
import { navigateTo } from "@/app/src/lib/navigation/navigation-listener";

export function UserListener(): null {
    useEffect(() => {
        return onUserEvent((event) => {
            if (event === "logout") {
                (async (): Promise<void> => {
                    try {
                        emptyUserCacheClient();
                        const payload = { "csrf-token": await fetchCsrfClient("logout") };
                        await goralysFetchClient("POST", "user/logout", payload);
                    } catch (err) {
                        console.error("[UserListener] Failed to clear user cache:", err);
                    } finally {
                        setTimeout(() => {
                            navigateTo("/user/login");
                        }, 0);
                    }
                })();
            }
        });
    }, []);

    return null;
}
