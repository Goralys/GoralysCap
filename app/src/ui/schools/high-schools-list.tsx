"use client";

import React, { ReactElement, useState } from "react";
import HighSchoolCard from "@/app/src/ui/schools/high-school-card";
import { setSchoolToken } from "@/app/src/lib/auth/school-token";
import { HighSchoolCardSkeleton } from "@/app/src/ui/skeletons/schools/high-school-card-skeleton";
import { navigateTo } from "@/app/src/lib/navigation/navigation-listener";
import { HighSchool } from "@/app/src/lib/types";
import HighSchoolsSearchBar from "@/app/src/ui/schools/high-schools-search-bar";
import { useHighSchools } from "@/app/src/hooks/useHighSchools";

export default function HighSchoolsList(): ReactElement {
    const { highSchools } = useHighSchools();
    const [currentHighSchools, setCurrentHighSchools] = useState<HighSchool[] | null>(highSchools);

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
            <HighSchoolsSearchBar highSchools={highSchools} setCurrentHighSchools={setCurrentHighSchools} />
            {currentHighSchools === null
                ? skeletons
                : currentHighSchools.map((h) => <HighSchoolCard key={h.code} name={h.name} onClickAction={() => setToken(h.code)} />)}
        </>
    );
}
