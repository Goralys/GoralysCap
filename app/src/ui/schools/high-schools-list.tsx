"use client";

import React, { ReactElement, useEffect, useState } from "react";
import HighSchoolCard from "@/app/src/ui/schools/high-school-card";
import { setSchoolToken } from "@/app/src/lib/auth/school-token";
import { HighSchoolCardSkeleton } from "@/app/src/ui/skeletons/schools/high-school-card-skeleton";
import { navigateTo } from "@/app/src/lib/navigation/navigation-listener";

type HighSchoolsResponse = Record<string, string>;

export default function HighSchoolsList(): ReactElement {
    const [highSchools, setHighSchools] = useState<HighSchoolsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHighSchools = async (): Promise<void> => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_DOMAIN}/highschools/list`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Goralys-Client": "mobile",
                    },
                });

                if (!response.ok) {
                    console.error("High-school fetch failed, status:", response.statusText);
                }

                const data: HighSchoolsResponse = await response.json();
                setHighSchools(data);
            } catch (error) {
                console.error("High-school fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };

        void loadHighSchools();
    }, []);

    const setToken = async (uai: string): Promise<void> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_DOMAIN}/highschools/token?code=${encodeURIComponent(uai)}`, {
            method: "GET",
        });

        if (!res.ok) {
            await setSchoolToken("no-token");
            return;
        }

        const data = await res.json();
        console.log(data.token);
        await setSchoolToken(data.token ?? "no-token");
        navigateTo("/user/login");
    };

    const skeletons = Array.from({ length: 2 }, (_, i) => <HighSchoolCardSkeleton key={i} />);

    return (
        <>
            {highSchools === null || loading
                ? skeletons
                : Object.entries(highSchools).map(([uai, name]) => (
                      <HighSchoolCard key={uai} name={name} onClickAction={() => setToken(uai)} />
                  ))}
        </>
    );
}
