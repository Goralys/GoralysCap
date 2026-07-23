"use client";

import { useCallback, useEffect, useRef } from "react";
import { useToast } from "@/app/src/ui/toast/toast-provider";
import { buildApiUrl, FLASH_TOAST_KEY, goralysFetchClient, storageGet, storageRemove, Toast } from "@goralys/core";
import { useNavigationEffect } from "@/app/src/lib/navigation/use-navigation-effect";

export default function FlashToastListener(): null {
    const { showToast } = useToast();

    const showToastRef = useRef(showToast);
    const runningRef = useRef(false);
    const pendingRef = useRef(false);

    useEffect(() => {
        showToastRef.current = showToast;
    }, [showToast]);

    const showCachedToast = useCallback((): void => {
        const raw = storageGet(FLASH_TOAST_KEY);
        if (!raw) return;

        storageRemove(FLASH_TOAST_KEY);

        try {
            const parsed: Toast = JSON.parse(raw);
            if (!parsed.expires) return;

            const remaining = parsed.expires - Date.now();
            if (remaining <= 0) return;

            showToastRef.current(parsed, remaining);
        } catch (error) {
            console.error("[FlashToastListener] Invalid cached toast: ", error);
        }
    }, []);

    const fetchFlashToast = useCallback(async (): Promise<void> => {
        try {
            const res = await goralysFetchClient("GET", buildApiUrl("toast/flash", {}), undefined, {
                cache: "no-store",
            });

            const data = await res.json();

            console.debug("[FlashToastListener] Response", { status: res.status, ...data });

            if (data?.toast) {
                // Server returned a toast — clear cache to avoid double-showing
                storageRemove(FLASH_TOAST_KEY);
                showToastRef.current({
                    type: data.toast.toastType,
                    title: data.toast.toastTitle,
                    message: data.toast.toastMessage,
                });

                return;
            }
            showCachedToast();
        } catch (error) {
            console.error("[FlashToastListener] Request failed: ", error);
        }
    }, [showCachedToast]);

    const run = useCallback(async (): Promise<void> => {
        if (runningRef.current) {
            pendingRef.current = true;
            return;
        }

        runningRef.current = true;

        try {
            do {
                pendingRef.current = false;
                await fetchFlashToast();
            } while (pendingRef.current);
        } finally {
            runningRef.current = false;
        }
    }, [fetchFlashToast]);

    useEffect(() => {
        void run();
    }, [run]);

    useNavigationEffect(() => void run());

    return null;
}
