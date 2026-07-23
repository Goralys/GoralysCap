"use client";

import HighSchoolsList from "@/app/src/ui/schools/high-schools-list";
import { ReactElement, useCallback, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { setSchoolToken } from "@/app/src/lib/auth/school-token";
import { navigateTo } from "@/app/src/lib/navigation/navigation-listener";
import { cookiesGet, ROLE_KEY, USER_ROLES, UserRole } from "@goralys/core";

export default function HomePageClient(): ReactElement {
    const initSchool = useCallback(async () => {
        const token = await Preferences.get({ key: "school-token" });

        if (token.value === null) return;
        await setSchoolToken(token.value);

        const role: string | boolean | number = cookiesGet(ROLE_KEY) ?? "none";
        if (USER_ROLES.includes(role as UserRole["role"])) {
            navigateTo("/subject");
            return;
        }

        navigateTo("/user/login");
    }, []);

    useEffect(() => {
        initSchool().then();
    }, [initSchool]);

    return (
        <div className="space-y-3 flex flex-col self-center grow items-center relative top-5 min-h-screen ml-2 mr-2">
            <HighSchoolsList />
        </div>
    );
}
