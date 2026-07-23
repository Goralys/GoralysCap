/*
 * Copyright (C) 2026 Sami Saubion
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useEffect } from "react";
import { emitNavigationEvent, onNavigationEvent } from "@goralys/core";
import { useRouter } from "next/navigation";

export function navigateTo(path: string): void {
    const url = new URL(path, window.location.origin);

    if (!url.pathname.endsWith("/")) {
        url.pathname += "/";
    }

    emitNavigationEvent({
        type: "redirect",
        url: url.pathname + url.search + url.hash,
    });
}

export function NavigationListener(): null {
    const router = useRouter();

    useEffect(() => {
        return onNavigationEvent((event) => {
            if (event.type === "teapot") {
                const params = encodeURIComponent(
                    JSON.stringify({
                        toastType: event.toastType,
                        toastTitle: event.toastTitle,
                        toastMessage: event.toastMessage,
                    }),
                );
                window.location.href = `/errors/teapot/?toast=${params}`;
            } else if (event.type === "redirect") {
                console.log("NavigationListener received redirect event, url =", JSON.stringify(event.url));
                router.push(event.url);
            }
        });
    }, [router]);

    return null;
}
