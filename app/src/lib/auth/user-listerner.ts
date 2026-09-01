/*
 * Copyright (C) 2026 Sami Saubion
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useEffect } from "react";
import { emptyUserCacheClient, fetchCsrfClient, goralysFetchClient, onUserEvent } from "@goralys/core";
import { navigateTo } from "@/app/src/lib/navigation/navigation-listener";
import { useConfirm } from "@/app/src/ui/modals/confirm/confirm-provider";
import { createAuthToken, hasToken } from "@/app/src/lib/auth/auth-token";
import { useToast } from "@/app/src/ui/toast/toast-provider";

export function UserListener(): null {
    const confirm = useConfirm();
    const { showToast } = useToast();

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
            } else if (event === "login") {
                (async (): Promise<void> => {
                    if (await hasToken()) return;

                    const create = await confirm.showConfirm({
                        title: "Sauvegarde de l'appareil",
                        message: "Voulez-vous enregistrer cet appareil ?",
                    });

                    if (create) {
                        await createAuthToken(showToast);
                    }
                })();
            }
        });
    }, [confirm, showToast]);

    return null;
}
