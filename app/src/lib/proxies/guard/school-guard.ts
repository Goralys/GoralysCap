import { GuardOptions } from "@/app/src/lib/types";
import { useCallback, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { navigateTo } from "@/app/src/lib/navigation/navigation-listener";
import { SCHOOL_TOKEN_KEY } from "@/app/src/lib/config";

type SchoolGuardOptions = GuardOptions;

export function useSchoolGuard({ enabled }: SchoolGuardOptions): void {
    const run = useCallback(async () => {
        const token = await Preferences.get({ key: SCHOOL_TOKEN_KEY });

        if (token.value === null) {
            navigateTo("/?reason=no-school");
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;

        run();
    }, [enabled, run]);
}
