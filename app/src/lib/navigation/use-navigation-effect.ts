/*
 * Copyright (C) 2026 Sami Saubion
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useEffect, useRef } from "react";
import { onNavigationEvent } from "@goralys/core";

export function useNavigationEffect(fn: () => void): void {
    const fnRef = useRef<() => void>(fn);

    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    return useEffect(() => {
        return onNavigationEvent((event) => {
            if (event.type === "redirect") {
                console.log("Received navigation effect... running");
                fnRef.current();
            }
        });
    }, []);
}
