import { isFoolsDay } from "@goralys/core";
import { useRouter } from "next/navigation";
import { GuardOptions } from "@/app/src/lib/types";
import { useEffect } from "react";
import { navigateTo } from "@/app/src/lib/navigation/navigation-listener";

type FoolsGuardOptions = GuardOptions;

export function useFoolsGuard({ enabled, pathname }: FoolsGuardOptions): void {
    const router = useRouter();

    useEffect(() => {
        if (!enabled) return;

        const isFoolsRoute = ["/coffee", "/tea"].includes(pathname);
        if (isFoolsRoute && !isFoolsDay()) {
            navigateTo("/404");
        }
    }, [enabled, pathname, router]);
}
