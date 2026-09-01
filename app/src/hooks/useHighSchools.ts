/*
 * Copyright (C) 2026 Sami Saubion
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HighSchool } from "@/app/src/lib/types";
import { HIGH_SCHOOLS_CACHE, HIGH_SCHOOLS_SYNC } from "@/app/src/lib/config";
import {
    buildApiUrl,
    cookiesGet,
    cookiesOnChange,
    cookiesSet,
    goralysFetchClient,
    storageGet,
    storageRemove,
    storageSet,
} from "@goralys/core";

type HighSchoolsResponse = Record<string, string>;

export function useHighSchools(): {
    highSchools: HighSchool[] | null;
    loading: boolean;
    refetch: () => Promise<undefined | void>;
} {
    const [loading, setLoading] = useState(true);
    const [highSchools, setHighSchools] = useState<HighSchool[] | null>(null);

    const inFlightRef = useRef<Promise<void> | null>(null);

    const fetchHighSchools = useCallback(async (): Promise<void> => {
        if (inFlightRef.current) {
            return inFlightRef.current;
        }

        let resolve: () => void;
        inFlightRef.current = new Promise<void>((r) => {
            resolve = r;
        });

        try {
            const syncValue = cookiesGet(HIGH_SCHOOLS_SYNC);

            if (syncValue == "1") {
                const raw = storageGet(HIGH_SCHOOLS_CACHE);
                if (raw === null || raw === undefined) {
                    cookiesSet(HIGH_SCHOOLS_SYNC, "0");
                    storageRemove(HIGH_SCHOOLS_CACHE);
                    inFlightRef.current = null;
                    resolve!();
                    await fetchHighSchools();
                    return;
                }
                const cached: HighSchool[] = JSON.parse(raw ?? "null");
                setHighSchools((prev) => (JSON.stringify(prev) === JSON.stringify(cached) ? prev : cached));
                setLoading(false);
                return;
            }

            const response = await goralysFetchClient("GET", buildApiUrl("highschools/list", {}), undefined, {
                headers: { Accept: "application/json" },
                cache: "no-store",
            });

            if (!response.ok) {
                console.error("High-school fetch failed, status:", response.statusText);
                return;
            }

            const data: HighSchoolsResponse = await response.json();
            const result: HighSchool[] = Object.entries(data).map(([code, name]) => ({ code, name }));

            cookiesSet(HIGH_SCHOOLS_SYNC, "1");
            storageSet(HIGH_SCHOOLS_CACHE, JSON.stringify(result));

            setHighSchools((prev) => (JSON.stringify(prev) === JSON.stringify(result) ? prev : result));
        } catch (error) {
            console.error("High-school fetch failed:", error);
        } finally {
            setLoading(false);
            inFlightRef.current = null;
            resolve!();
        }
    }, []);

    useEffect(() => {
        const onChange = (): void => {
            if (inFlightRef.current) return;
            if (cookiesGet(HIGH_SCHOOLS_SYNC) != "1") {
                void fetchHighSchools();
            }
        };

        return cookiesOnChange(onChange);
    }, [fetchHighSchools]);

    useEffect(() => {
        void fetchHighSchools();
    }, [fetchHighSchools]);

    return useMemo(() => ({ highSchools, loading, refetch: fetchHighSchools }), [highSchools, loading, fetchHighSchools]);
}
